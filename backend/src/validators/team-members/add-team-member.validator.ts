import { z } from "zod";

const addTeamMemberSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    designation: z.string().min(3),
});

export default addTeamMemberSchema;