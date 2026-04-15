import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, role) => {
    const token = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d", algorithm: "HS256" }
    );

    // AppSail doesn't always inject NODE_ENV properly. 
    // Since frontend and backend are ALWAYS on separate domains (onslate vs catalystappsail),
    // we MUST force SameSite=none and secure=true to ensure the browser doesn't block the auth cookie.
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return token;
};
