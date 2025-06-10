import { z } from "zod";
import { taskStatus } from "../../constants";

const updateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    deadline: z
        .string()
        .transform((str) => new Date(str))
        .optional(),
    projectId: z.string().min(1, "Project ID is required").optional(),
    assignedMembers: z
        .array(z.string())
        .min(1, "At least one team member must be assigned")
        .optional(),
    status: z
        .enum([
            taskStatus.PENDING,
            taskStatus.IN_PROGRESS,
            taskStatus.COMPLETED,
            taskStatus.CANCELLED,
        ])
        .optional(),
});

export default updateTaskSchema;
