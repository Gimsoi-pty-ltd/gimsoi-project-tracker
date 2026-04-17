import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, role) => {
    const token = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d", algorithm: "HS256" }
    );

    // AppSail doesn't always inject NODE_ENV properly in early boot,
    // and since frontend (Slate) and backend (AppSail) are always separate domains,
    // we MUST force SameSite=none and secure=true.
    res.cookie("token", token, {
        httpOnly: true, // Prevents XSS
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return token;
};
