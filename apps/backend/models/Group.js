import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupPic: { type: String, default: "" },
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);

export default Group;
