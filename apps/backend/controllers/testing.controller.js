import prisma from "../lib/prisma.js";
import ROLES from "../constants/roles.js";

// Dedicated endpoint to teardown the database between test suites.
// ONLY ACTIVE if NODE_ENV=test
export const resetDatabase = async (req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        return res.status(404).json({ message: "Not found" });
    }

    try {
        // Use raw SQL to bypass the soft delete extension and actually wipe the tables.
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Comment" CASCADE');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Report" CASCADE');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Phase" CASCADE');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Task" CASCADE');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Sprint" CASCADE');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Project" CASCADE');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Client" CASCADE');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE');

        return res.status(200).json({ success: true, message: "Database wiped for testing." });
    } catch (error) {
        next(error);
    }
};

// Elevates an existing user to a target role — test-only.
// Required because signup always assigns INTERN (security hardening Step 2).
// Fixtures call this immediately after signup, then re-login to get a fresh JWT.
export const promoteUserRole = async (req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        return res.status(404).json({ message: "Not found" });
    }
    try {
        const { email, role } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const targetRole = role || user.role;
        const allowed = Object.values(ROLES);
        if (!allowed.includes(targetRole)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed: ${allowed.join(', ')}`
            });
        }
        
        const updated = await prisma.user.update({ 
            where: { email }, 
            data: { 
                role: targetRole,
                isVerified: true 
            } 
        });
        const { password: _, ...safe } = updated;
        return res.status(200).json({ success: true, data: safe });
    } catch (error) {
        next(error);
    }
};
