import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, role) => {
    const token = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d", algorithm: "HS256" }
    );

    res.cookie("token", token, {
        httpOnly: true, // Prevents XSS
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return token;
};
