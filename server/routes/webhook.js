import express from "express";
import bodyParser from "body-parser";
import Appointment from "../models/appointment.js";

const router = express.Router();

router.post(
    "/stripe-webhook",
    bodyParser.raw({type: "application/json"}),
    async (req, res) => {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = "whsec_72bc7c69c19b049d1adafac66cd976f9aca51e6c29216fcf21f246c8eba4695a"; // find in Stripe Dashboard

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

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

      

      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        date: new Date(date),
        startTime,
        endTime: "auto", // you can recompute as before
        price: Number(computedPrice),
        reason,
        age,
        gender,
      });
    }

    res.json({ received: true });
  }
);

export default router;
