import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
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

        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized - invalid token structure" });
    }
};
