
import prisma from "../lib/prisma.js";

export async function createSprint(data) {
    return prisma.sprint.create({ data });
}

export async function getAllSprints() {
    return prisma.sprint.findMany();
}

//Lifecycle Validation
function validatetransition(current, next) {
    const allowed = {
        planned: ["active"],
        active: ["completed"],
        completed: []
    };

    if (!allowed[current].includes(next)) {
        throw new Error(`Cannot change sprint from ${current} -> ${next}`);
    }
}

//Update Sprint
export async function updateSprint(id, data) {
    const sprint = await prisma.sprint.findUnique({ where: { id } });

    if (!sprint) throw new Error("Sprint not found");

    //Prevent edits on sprints id they are complete
    if (sprint.status === "completed") {
        throw new Error("Completed sprints are read-only");

    }

//Status change
if(data.status) {
    validatetransition(sprint.status, data.status);
}

return prisma.sprint.update({
    where: { id },
    data
});
}

//Progress Calculation


async function calculateProgress(sprintId) {
    const tasks = await prisma.task.findMany({
        where: { sprintId }
    });

    const total = tasks.length;
    const done = tasks.filter(t => t.status === "done").length;

    if (total === 0) return 0;
    return Math.round((done / total) * 100);
}

export async function getSprintWithProgress(id) {
    const sprint = await prisma.sprint.findUnique({
        where: { id: Number(id) }
    });

    if (!sprint) throw new Error("Sprint not found");

    const progress = await calculateProgress(id);

    return{
        ...sprint,
        progress
    };
}