import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, role) => {
    const token = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d", algorithm: "HS256" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
        httpOnly: true, // Prevents XSS
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return token;
};
