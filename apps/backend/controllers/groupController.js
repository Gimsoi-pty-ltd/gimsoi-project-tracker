import Group from "../models/Group.js";
import Message from "../models/Message.js";
import { io, userSocketMap } from "../server.js";
import { checkIsScam } from "../lib/gemini.js";
import cloudinary from "../lib/cloudinary.js";

export const createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const admin = req.user._id;

        if (!name || !members || members.length === 0) {
            return res.status(400).json({ message: "Name and at least one member are required" });
        }

        // Add admin to members if not already included (though client should handle logic, safety check)
        const memberIds = [...new Set([...members, admin])];

        const newGroup = new Group({
            name,
            members: memberIds,
            admin,
        });

        await newGroup.save();

        // Populate members to return full user objects if needed, or just return group
        const populatedGroup = await Group.findById(newGroup._id).populate("members", "-password");

        // Notify members (socket)
        memberIds.forEach(memberId => {
            // In a real app we might emit to a user-specific room
            // for now let's assume client fetches groups or listens for general events
            const socketId = userSocketMap[memberId];
            if (socketId) {
                io.to(socketId).emit("addedToGroup", populatedGroup);
            }
        });

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.error("Error in createGroup: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({}).populate("members", "-password").sort({ updatedAt: -1 });
        res.status(200).json(groups);
    } catch (error) {
        console.error("Error in getGroups: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ groupId })
            .populate("senderId", "fullName profilePic")
            .sort({ createdAt: 1 }); // Oldest first for chat history

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getGroupMessages: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { groupId } = req.params;
        const senderId = req.user._id;

        // Verify user is in group? (Optional security step, skipping for MVP speed)

        const newMessage = new Message({
            senderId,
            groupId,
            text,
            image,
        });

        await newMessage.save();

        // Populate sender info for the client to display name/avatar
        await newMessage.populate("senderId", "fullName profilePic");

        // Emit to Group Room
        io.to(`group_${groupId}`).emit("newGroupMessage", newMessage);

        res.status(201).json(newMessage);

        // Async Scam Detection
        if (text) {
            console.log("Starting background scam check for group message:", text.substring(0, 50) + "...");
            checkIsScam(text).then(async (isScam) => {
                console.log("Scam check result for group message:", newMessage._id, "isScam:", isScam);
                if (isScam) {
                    await Message.findByIdAndUpdate(newMessage._id, { isScam: true });
                    const updatedMessage = await Message.findById(newMessage._id).populate("senderId", "fullName profilePic");

                    // Emit update to group room
                    io.to(`group_${groupId}`).emit("messageUpdated", updatedMessage);
                }
            }).catch(err => {
                console.error("Background Scam Check Failed (Group):", err);
            });
        }

    } catch (error) {
        console.error("Error in sendGroupMessage: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, groupPic } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Authorization: Only admin can update
        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can update group details" });
        }

        // Update fields if provided
        if (name) group.name = name;

        if (groupPic) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(groupPic);
                group.groupPic = uploadResponse.secure_url;
            } catch (err) {
                console.error("Cloudinary Upload Error:", err);
                return res.status(500).json({ message: "Failed to upload image" });
            }
        }
        // If groupPic is empty string (explicit removal), we can handle that if needed, 
        // but current UI might just verify presence. 
        // For now, only upload if truthy base64 is sent.

        await group.save();

        const updatedGroup = await Group.findById(groupId).populate("members", "-password");

        // Notify all members
        updatedGroup.members.forEach(member => {
            const socketId = userSocketMap[member._id.toString()];
            if (socketId) {
                // Emit event to update group list/active chat
                io.to(socketId).emit("groupUpdated", updatedGroup);
            }
        });

        res.status(200).json(updatedGroup);

    } catch (error) {
        console.error("Error in updateGroup: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ message: "Already a member" });
        }

        group.members.push(userId);
        await group.save();

        const populatedGroup = await Group.findById(groupId).populate("members", "-password");

        // Notify the user via socket as well just in case
        const userSocketId = userSocketMap[userId.toString()];
        if (userSocketId) {
            io.to(userSocketId).emit("addedToGroup", populatedGroup);
        }

        res.json(populatedGroup);
    } catch (error) {
        console.error("Error in joinGroup: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
