import { Router } from "express";
import auth from "../middlewares/auth.middleware";
import teamMemberControllers from "../controllers/teams.controller";

const router = Router();

router.get("/", auth, teamMemberControllers.getAllTeamMembers);
router.post("/", auth, teamMemberControllers.addTeamMember);
router.put("/:id", auth, teamMemberControllers.updateTeamMember);
router.delete("/:id", auth, teamMemberControllers.deleteTeamMember);

export default router;
