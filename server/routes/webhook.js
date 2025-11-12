import express from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";
import { ensureAppointmentCreated } from "../controllers/appointmentController.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_72bc7c69c19b049d1adafac66cd976f9aca51e6c29216fcf21f246c8eba4695a";

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful checkout
    if (event.type === "checkout.session.completed") {
      try {
        const session = event.data.object;
        console.log("✅ Payment successful for session:", session.id);

        const {
          patientId,
          doctorId,
          date,
          startTime,
          reason,
          age,
          gender,
          computedPrice,
        } = session.metadata;

        if (!patientId || !doctorId || !date || !startTime) {
          console.error("❌ Missing required metadata in session:", session.metadata);
          return res.status(400).json({ error: "Missing required appointment data" });
        }

        let appointment = await ensureAppointmentCreated({
          patientId,
          doctorId,
          date,
          startTime,
          reason,
          age,
          gender,
          computedPrice,
        });

        // Send notifications once
        if (!appointment.notificationSent) {
          appointment = await appointment.populate("patient doctor", "name email");
          const patientEmail = appointment.patient?.email;
          const doctorEmail = appointment.doctor?.email;
          const patientName = appointment.patient?.name || "Patient";
          const doctorName = appointment.doctor?.name || "Doctor";

          const when = `${new Date(date).toDateString()} ${startTime}-${appointment.endTime}`;
          try {
            const p = await sendEmail(
              patientEmail,
              "Appointment Confirmed",
              `Hi ${patientName}, your appointment with Dr. ${doctorName} is confirmed for ${when}.`
            );
            if (p?.previewUrl) console.log("🔗 Patient email preview:", p.previewUrl);
          } catch (e) {
            console.error("❌ Failed to email patient:", e.message);
          }
          try {
            const d = await sendEmail(
              doctorEmail,
              "New Appointment Booked",
              `Hi Dr. ${doctorName}, you have a new appointment with ${patientName} on ${when}. Reason: ${reason || "N/A"}.`
            );
            if (d?.previewUrl) console.log("🔗 Doctor email preview:", d.previewUrl);
          } catch (e) {
            console.error("❌ Failed to email doctor:", e.message);
          }
          appointment.notificationSent = true;
          await appointment.save();
        }

        console.log("✅ Appointment created successfully:", appointment._id);
        res.json({ received: true, appointmentId: appointment._id });
      } catch (err) {
        console.error("❌ Error creating appointment from webhook:", err);
        // Still return 200 to Stripe to prevent retries, but log the error
        res.status(200).json({ received: true, error: err.message });
      }
    } else {
      // Return success for other event types
      res.json({ received: true });
    }
  }
);

export default router;
