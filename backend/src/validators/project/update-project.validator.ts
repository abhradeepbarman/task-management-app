import { z } from "zod";

const updateProjectSchema = z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    teamMembers: z.array(z.string()).min(1).optional(),
});

export default updateProjectSchema;
