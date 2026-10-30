
import { assertOwnership } from "../utils/ownership.js";
import { NotFoundError } from "../utils/errors.js";
import prisma from "../lib/prisma.js";
import { getEmployeeWorkloads } from "./employeeCapacity.service.js";

export const recommendEmployees = async ({
    projectId,
    userId,
    userRole,
    limit = 5,
}) => {
    if (!projectId) {
        throw new Error("Project ID is required.");
    }

    const project = await prisma.project.findUnique({
        where: { id: String(projectId) },
        select: {
            id: true,
            createdByUserId: true,
        },
    });

    if (!project) {
        throw new NotFoundError("Project not found.");
    }

    assertOwnership(project, userId, userRole);

    const workloads = await getEmployeeWorkloads({ projectId });

    return workloads.slice(0, limit).map((item, index) => {
        const { activeTasks, activeStoryPoints } = item.workload;

        let reason;

        if (activeStoryPoints === 0) {
            reason = `Has ${activeTasks} active tasks and no estimated story points.`;
        } else {
            reason = `Has ${activeTasks} active tasks and ${activeStoryPoints} active story points assigned.`;
        }

        return {
            rank: index + 1,
            employee: item.employee,
            workload: item.workload,
            reason,
        };
    });
};
