import { Router } from "express";
import auth from "../middlewares/auth.middleware";
import taskControllers from "../controllers/tasks.controller";

const router = Router();

router.get("/", auth, taskControllers.getAllTasks);
router.post("/", auth, taskControllers.createTask);
router.put("/:id", auth, taskControllers.updateTask);
router.delete("/:id", auth, taskControllers.deleteTask);

export default router;
