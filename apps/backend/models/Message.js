import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for groups
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // Optional for DMs
    text: { type: String, },
    image: { type: String, },
    isScam: { type: Boolean, default: false },
    seen: { type: Boolean, default: false }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;