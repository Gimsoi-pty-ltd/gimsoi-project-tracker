import jwt from "jsonwebtoken";

const ACCESS_TOKEN_TTL = "30m"; 

export const signAccessToken = (user) => {
  return jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
};
