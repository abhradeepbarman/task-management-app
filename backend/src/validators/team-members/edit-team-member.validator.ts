import { z } from "zod";

const editTeamMemberSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    designation: z.string().min(3),
});

export default editTeamMemberSchema;
