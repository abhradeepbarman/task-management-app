import { z } from "zod";

const createProjectSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(3),
    teamMembers: z.array(z.string()).min(1),
});

export default createProjectSchema;
