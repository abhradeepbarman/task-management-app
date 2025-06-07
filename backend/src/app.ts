import express, { Application } from "express";
import { authRoutes } from "./routes";
import cors from "cors";

const app: Application = express();

/** Middlewares */
app.use(express.json());
app.use(cors());

/** Routes */
app.use("/api/v1/auth", authRoutes);

export default app;
