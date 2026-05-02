import * as activityService from "../services/activity.service.js";
import prisma from "../lib/prisma.js";
import { assertProjectMembership } from "../utils/membership.js";
import { NotFoundError } from "../utils/errors.js";

export const getTaskActivities = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        
        // Security check: Must be a project member to see task activity
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { projectId: true }
        });
        if (!task) throw new NotFoundError(`Task ${taskId} not found.`);
        
        await assertProjectMembership(task.projectId, req.user.id, req.user.role);
        
        const activities = await activityService.getTaskActivities(taskId);
        
        res.json({
            status: "success",
            data: activities
        });
    } catch (err) {
        next(err);
    }
};
