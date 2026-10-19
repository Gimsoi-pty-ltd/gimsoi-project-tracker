import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token)
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized - no token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded)
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized - invalid token" });

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true },
        });

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized - user no longer exists" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError" && error.name !== "NotBeforeError") {
            return next(error);
        }
        return res.status(401).json({ success: false, message: "Unauthorized - invalid token structure" });
    }
};
