import * as activityService from "../services/activity.service.js";
import prisma from "../lib/prisma.js";
import { assertProjectMembership } from "../utils/membership.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

/**
 * Retrieves activity logs for a specific task.
 */
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
    
    return res.json({
      status: "success",
      data: activities
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves activity logs for a user.
 */
export const getActivities = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user.id;
    // Allow users to view their own log. Admins and PMs can view anyone's logs.
    if (userId !== req.user.id && req.user.role !== "ADMIN" && req.user.role !== "PM") {
      throw new ForbiddenError("You can only view your own activity logs.");
    }

    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logs a new activity.
 */
export const createActivity = async (req, res, next) => {
  try {
    const { action, entityId, entityType, taskId, oldValue, newValue } = req.body;
    const userId = req.user.id;

    const activity = await prisma.activityLog.create({
      data: {
        action,
        entityId,
        entityType,
        taskId: taskId || null,
        userId,
        oldValue: oldValue ? (typeof oldValue === "string" ? oldValue : JSON.stringify(oldValue)) : null,
        newValue: newValue ? (typeof newValue === "string" ? newValue : JSON.stringify(newValue)) : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
