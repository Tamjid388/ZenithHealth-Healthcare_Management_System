import express from "express";
import { IndexRoutes } from "./app/routes";
import { globalErroHandler } from "./app/middleware/globalErroHandler";
import notFound from "./app/middleware/notfound";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", IndexRoutes);
// Basic route
app.get('/', (req, res) => {
    res.send('Hello, TypeScript + Express!');
});
app.use(globalErroHandler);
app.use(notFound);
export default app;
