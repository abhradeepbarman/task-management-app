import { model, Schema } from "mongoose";
import { taskStatus } from "../constants";

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    assignedMembers: [
        {
            type: Schema.Types.ObjectId,
            ref: "TeamMember",
            required: true,
        },
    ],
    status: {
        type: String,
        enum: [
            taskStatus.PENDING,
            taskStatus.IN_PROGRESS,
            taskStatus.COMPLETED,
        ],
        default: "pending",
    },
});

const Task = model("Task", taskSchema);
export default Task;
