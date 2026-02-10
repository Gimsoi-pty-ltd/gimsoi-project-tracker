import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js";
import { checkIsScam } from "../lib/gemini.js";


// Get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        // Count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false })
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessages })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ]
        }).populate("senderId", "fullName profilePic");

        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });

        res.json({ success: true, messages })


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true })
        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        // Populate the sender info before emitting
        const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "fullName profilePic");


        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage)
        }

        res.json({ success: true, newMessage: populatedMessage });

        // Async Scam Detection (Fire and Forget)
        if (text) {
            console.log("Starting background scam check for:", text.substring(0, 50) + "...");
            checkIsScam(text).then(async (isScam) => {
                console.log("Scam check result for message:", newMessage._id, "isScam:", isScam);
                if (isScam) {
                    await Message.findByIdAndUpdate(newMessage._id, { isScam: true });
                    const updatedMessage = { ...newMessage._doc, isScam: true };

                    // Emit update to receiver if they are online
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit("messageUpdated", updatedMessage);
                    }
                    // Optionally emit to sender too if you want them to know
                }
            }).catch(err => {
                console.error("Background Scam Check Failed:", err);
            });
        }

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}