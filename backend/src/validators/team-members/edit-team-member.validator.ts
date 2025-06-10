import { z } from "zod";

const editTeamMemberSchema = z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    designation: z.string().min(3).optional(),
});

export default editTeamMemberSchema;
