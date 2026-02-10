import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        // 1. Prioritize Cookie, Fallback to Header
        const token = req.cookies.token || req.headers.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized - No Token Provided" });
        }

        // 2. Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ success: false, message: "Unauthorized - Invalid Token" });
        }

        // 3. Fetch User (Required for Message Controller)
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 4. Attach to Request
        req.user = user;

        // Compatibility: Set req.userId just in case other controllers switch to this middleware and expect it
        req.userId = user._id;

        next();

    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};