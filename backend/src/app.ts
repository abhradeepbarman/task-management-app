import express, { Application, NextFunction, Request, Response } from "express";
import {
    authRoutes,
    projectRoutes,
    taskRoutes,
    teamMemberRoutes,
} from "./routes";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler";

const app: Application = express();

/** Middlewares */
app.use(express.json());
app.use(cors());

/** Routes */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teams", teamMemberRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);

/* ----------------404 not found---------------- */
app.use((req: Request, res: Response) => {
    res.status(404).json({
        status: 404,
        message: "404 not found",
    });
});

/* -------------------Custom Middleware------------------- */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
});

export default app;
