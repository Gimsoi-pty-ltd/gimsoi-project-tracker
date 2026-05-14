import prisma from '../lib/prisma.js';
import * as sprintService from '../services/sprint.service.js';

async function verify() {
    console.log('Verifying seed metrics...');

    const sprints = await prisma.sprint.findMany({
        where: { status: 'ACTIVE' },
        include: { project: true }
    });

    if (sprints.length === 0) {
        console.error('No active sprints found!');
        process.exit(1);
    }

    for (const sprint of sprints) {
        console.log(`\nChecking metrics for Sprint: ${sprint.name} (Project: ${sprint.project.name})`);
        const metrics = await sprintService.getSprintMetrics(sprint.id);
        
        console.log(`Total Tasks: ${metrics.totalTasks}`);
        console.log(`Completed Tasks: ${metrics.completedTasks}`);
        console.log(`Velocity: ${metrics.velocity}`);
        console.log(`Sprint Health: ${metrics.sprintHealth}%`);
        console.log(`Overdue Tasks: ${metrics.overdueTasks}`);
        console.log(`Blocked Tasks: ${metrics.blockedTasks}`);
        
        if (metrics.totalTasks === 0) {
            console.error('FAILED: Total tasks should be non-zero.');
            process.exit(1);
        }
        if (metrics.overdueTasks === 0) {
            console.warn('WARNING: Overdue tasks should ideally be non-zero for this seed.');
        }
        if (metrics.blockedTasks === 0) {
            console.warn('WARNING: Blocked tasks should ideally be non-zero for this seed.');
        }
    }

    console.log('\nVerification successful!');
}

verify()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
