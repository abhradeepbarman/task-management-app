import express, { Application } from "express";
import { authRoutes } from "./routes";

const app: Application = express();

/** Middlewares */
app.use(express.json());

/** Routes */
app.use("/api/v1/auth", authRoutes);

export default app;
