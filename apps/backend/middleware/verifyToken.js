import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // Support cookie or Authorization: Bearer <token>
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

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

        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        console.log("Error in verifyToken ", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
