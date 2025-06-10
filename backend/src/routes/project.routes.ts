import { Router } from "express";
import auth from "../middlewares/auth.middleware";
import projectControllers from "../controllers/project.controller";

const router = Router();

router.get("/", auth, projectControllers.getAllProjects);
router.post("/", auth, projectControllers.createProject);
router.put("/:id", auth, projectControllers.updateProject);
router.delete("/:id", auth, projectControllers.deleteProject);

export default router;
