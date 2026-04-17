import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Generates a JWT, sets the HttpOnly auth cookie with secure cross-origin flags.
 * Returns the generated token string.
 */
export const generateTokenAndSetCookie = (res, userId, role) => {
    const token = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d", algorithm: "HS256" }
    );

    const cookieBase = {
        secure: true,
        sameSite: "none",
    };

    // HttpOnly auth cookie — JS cannot read this
    res.cookie("token", token, {
        ...cookieBase,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};
