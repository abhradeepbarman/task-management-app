import express, { Application } from "express";
import { authRoutes, teamMemberRoutes } from "./routes";
import cors from "cors";

const app: Application = express();

/** Middlewares */
app.use(express.json());
app.use(cors());

/** Routes */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teams", teamMemberRoutes);

export default app;
