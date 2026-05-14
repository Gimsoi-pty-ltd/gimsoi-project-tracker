
import * as taskService from '../services/task.service.js';
import prisma from '../lib/prisma.js';

async function repro() {
    try {
        console.log('--- Starting Repro ---');
        // Find a task
        const task = await prisma.task.findFirst();
        if (!task) {
            console.log('No task found. Please run tests first to populate DB.');
            return;
        }
        console.log('Testing Task:', task.id, 'Status:', task.status);

        console.log('\n--- Testing FLYING status (Expect 400 StateTransitionError) ---');
        try {
            await taskService.updateTask(task.id, { status: 'FLYING', version: task.version }, null, 'ADMIN');
            console.log('FAILED: Should have thrown');
        } catch (e) {
            console.log('Caught Expected Error:', e.name, 'Status:', e.statusCode);
            if (e.statusCode !== 400) {
                console.log('BUG: statusCode is NOT 400!', e);
            }
        }

        console.log('\n--- Testing DONE status (Expect completedAt set) ---');
        // Reset task to IN_PROGRESS first
        if (task.sprintId) {
            const sprint = await prisma.sprint.findUnique({ where: { id: task.sprintId } });
            if (sprint && sprint.status !== 'ACTIVE') {
                await prisma.sprint.update({ where: { id: task.sprintId }, data: { status: 'ACTIVE' } });
            }
        }
        
        const resetTask = await prisma.task.update({ 
            where: { id: task.id }, 
            data: { status: 'IN_PROGRESS' } 
        });

        await taskService.updateTask(task.id, { status: 'DONE', version: resetTask.version }, null, 'ADMIN');
        const updatedTask = await prisma.task.findUnique({ where: { id: task.id } });
        console.log('Updated Task Status:', updatedTask.status);
        console.log('CompletedAt:', updatedTask.completedAt);
        if (updatedTask.completedAt === null) {
            console.log('BUG: completedAt is NULL!');
        }

    } catch (err) {
        console.error('Fatal Repro Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

repro();
