export const requireAnyRole = (roles = []) => {
  const allowed = new Set(roles);

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
    if (!req.user.role) return res.status(403).json({ message: "Missing role" });

    const userRole = req.user.role.toUpperCase();
    if (!allowed.has(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
};
