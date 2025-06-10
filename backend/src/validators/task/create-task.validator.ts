import { z } from "zod";
import { taskStatus } from "../../constants";

const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    deadline: z.string().transform((str) => new Date(str)),
    projectId: z.string().min(1, "Project ID is required"),
    assignedMembers: z
        .array(z.string())
        .min(1, "At least one team member must be assigned"),
    status: z
        .enum([
            taskStatus.PENDING,
            taskStatus.IN_PROGRESS,
            taskStatus.COMPLETED,
            taskStatus.CANCELLED,
        ])
        .optional(),
});

export default createTaskSchema;
