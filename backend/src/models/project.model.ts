import { model, Schema } from "mongoose";

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    teamMembers: [
        {
            type: Schema.Types.ObjectId,
            ref: "TeamMember",
            required: true,
        },
    ],
});

const Project = model("Project", projectSchema);
export default Project;
