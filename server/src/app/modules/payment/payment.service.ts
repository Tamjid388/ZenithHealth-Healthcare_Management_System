import Stripe from "stripe";
import { stripe } from "../../config/stripe.config";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/client";



const handleStripeWebhook = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingPayment) {
    console.log(`Payment already exists for event ${event.id}`);
    return { message: `Payment already exists for event ${event.id}` };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.error(`Missing Appointment ID or Payment ID`);
        return {
          message: `Missing Appointment ID or Payment ID,
          Invalid metadata for event ${event.id}`,
        };
      }

      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
      });

      if (!appointment) {
        console.error(`Appointment not found for ID: ${appointmentId}`);
        return { message: `Appointment not found for ID: ${appointmentId}` };
      }

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus:session.payment_status==="paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
          },
        });
        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
          stripeEventId:event.id,
          status:session.payment_status==="paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
          paymentGatewayData:JSON.parse(JSON.stringify(session)),
          },
        });
        console.log(`Payment updated for appointment ${appointmentId} and payment ${paymentId}`)
       
      });
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Checkout session expired for session ${session.id}`)
      break;
    }
    case "payment_intent.payment_failed": {
      console.log(`Payment failed for event ${event.id}`)
      break;
    }
    default: {
      break;
    }
  }
  return { message: `Webhook processed successfully for event ${event.id}` };
};

export const PaymentService = {
  handleStripeWebhook,
};

