import prisma from "../lib/prisma.js";

// Dedicated endpoint to teardown the database between test suites.
// ONLY ACTIVE if NODE_ENV=test
export const resetDatabase = async (req, res) => {
    if (process.env.NODE_ENV !== 'test') {
        return res.status(404).json({ message: "Not found" });
    }

    try {
        // Delete in reverse dependency order
        await prisma.task.deleteMany({});
        await prisma.sprint.deleteMany({});
        await prisma.project.deleteMany({});
        await prisma.client.deleteMany({});
        await prisma.user.deleteMany({});

        return res.status(200).json({ success: true, message: "Database wiped for testing." });
    } catch (error) {
        console.error("Test Teardown Error:", error);
        return res.status(500).json({ success: false, message: "Teardown failed" });
    }
};
