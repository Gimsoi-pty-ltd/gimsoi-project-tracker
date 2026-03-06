import prisma from "../lib/prisma.js";

export const SprintModel = {

    create(data) {
        return prisma.sprint.create({ data });
    },

    findAll() {
        return prisma.sprint.findMany();
    },

    findById(id) {
        return prisma.sprint.findUnique({ where: { id: Number(id) } });
    },

    update(id, data) {
        return prisma.sprint.update({
            where: { id: Number(id) },
            data
        });
    }
}