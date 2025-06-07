import { Router } from "express";
import teamMemberControllers from "../controllers/team-member.controller";
import auth from "../middlewares/auth.middleware";

const router = Router();

router.get("/", auth, teamMemberControllers.getAllTeamMembers);
router.post("/", auth, teamMemberControllers.addTeamMember);
router.put("/:id", auth, teamMemberControllers.updateTeamMember);
router.delete("/:id", auth, teamMemberControllers.deleteTeamMember);

export default router;
