import express, { Application } from "express";
import { authRoutes, projectRoutes, taskRoutes, teamMemberRoutes } from "./routes";
import cors from "cors";

const app: Application = express();

/** Middlewares */
app.use(express.json());
app.use(cors());

/** Routes */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teams", teamMemberRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);

export default app;
