import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTimeString = (minutes) => {
  const hrs = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}`;
};

const getDayName = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString("en-US", { weekday: "long" });
};


//adding stripe functionality
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const {
      doctorId,
      date,
      startTime, // expected "HH:MM"
      reason,
      age,
      gender,
      price,
    } = req.body;

    if (!doctorId || !date || !startTime || !reason || !age || !gender) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const availability = doctor.doctorDetails?.availability;
    if (!availability) {
      return res.status(400).json({ message: "Doctor availability is not configured" });
    }

    const dayName = getDayName(date);
    if (!dayName) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    if (!availability.days?.includes(dayName)) {
      return res.status(400).json({ message: `Doctor is not available on ${dayName}` });
    }

    const duration = Number(availability.slotDuration) || 30;
    const startMinutes = toMinutes(availability.startTime);
    const endMinutes = toMinutes(availability.endTime);
    if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || startMinutes >= endMinutes) {
      return res.status(400).json({ message: "Doctor availability is invalid" });
    }

    const requestedMinutes = toMinutes(startTime);
    if (requestedMinutes < startMinutes || requestedMinutes >= endMinutes) {
      return res.status(400).json({ message: "Selected slot is outside doctor's availability" });
    }

    const availableSlots = [];
    for (let current = startMinutes; current < endMinutes; current += duration) {
      availableSlots.push(current);
    }

    if (!availableSlots.includes(requestedMinutes)) {
      return res.status(400).json({ message: "Selected slot does not match doctor's schedule" });
    }

    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    const now = new Date();
    if (
      appointmentDate.getTime() === new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() &&
      requestedMinutes <= now.getHours() * 60 + now.getMinutes()
    ) {
      return res.status(400).json({ message: "Selected slot has already passed" });
    }

    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: appointmentDate,
      startTime,
    });

    if (existing) {
      return res.status(409).json({ message: "This slot is already booked" });
    }

    const computedPrice = price ?? doctor.doctorDetails?.consultationFee ?? 0;
    const amountInPaisa = Math.round(computedPrice * 100);

    //creating a stripe checkout session
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            // Consider switching to a widely supported currency like 'usd' if 'pkr' is not enabled
            currency: process.env.STRIPE_CURRENCY || "usd",
            product_data: {
              name: `Consultation with Dr. ${doctor.name}`,
              description: reason,
            },
            unit_amount: amountInPaisa > 0 ? amountInPaisa : 100, // minimal positive amount
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      metadata: {
        patientId,
        doctorId,
        date,
        startTime,
        reason,
        gender,
        age,
        computedPrice,
      },
    });

    // For reliability, create the appointment on successful payment via webhook.
    // Return the checkout URL to the client now.
    return res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create appointment" });
  }
};

export const getBookedSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "Doctor ID and date are required" });
    }

    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: appointmentDate,
      status: { $ne: "cancelled" },
    }).select("startTime");

    const bookedSlots = appointments.map((apt) => apt.startTime);

    res.json({ bookedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch booked slots" });
  }
};

// Admin: list all appointments (optionally filter by doctor, patient, date)
export const getAllAppointments = async (req, res) => {
  try {
    const { doctorId, patientId, date } = req.query;
    const filter = {};
    if (doctorId) filter.doctor = doctorId;
    if (patientId) filter.patient = patientId;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      filter.date = d;
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch appointments" });
  }
};

// Doctor/Patient: list my own appointments
export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const filter = {};
    if (role === "doctor") filter.doctor = userId;
    else filter.patient = userId;

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ date: 1, startTime: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch my appointments" });
  }
};

