import { model, Schema } from "mongoose";

const teamMemberSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
});

const TeamMember = model("TeamMember", teamMemberSchema);
export default TeamMember;
