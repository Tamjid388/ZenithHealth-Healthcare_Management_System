import express, { Application, NextFunction, Request, Response } from "express";

import { IndexRoutes } from "./app/routes";
import { globalErroHandler } from "./app/middleware/globalErroHandler";
import notFound from "./app/middleware/notfound";
import cookieParser from "cookie-parser";
import cors from "cors";
import qs from "qs";
import { PaymentController } from "./app/modules/payment/payment.controller";
import { envVars } from "./app/config/env";


const app: Application = express();

app.set("query parser", (query: string) => {
  return qs.parse(query);
});

app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));





// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())
// Stripe webhook
app.post("/webhook",express.raw({type: "application/json"}), 
PaymentController.handleStripeWebhook)


app.use("/api/v1",IndexRoutes)



// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.use(globalErroHandler)
app.use(notFound)
    



export default app;
