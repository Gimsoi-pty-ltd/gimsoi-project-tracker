import prisma from '../lib/prisma.js';
import bcryptjs from 'bcryptjs';

async function main() {
    console.log('Starting seed...');

    // Helper for randomization
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

    const passwordHash = await bcryptjs.hash('Password123!', 10);

    // 1. Create Core Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gimsoi.com' },
        update: {},
        create: {
            email: 'admin@gimsoi.com',
            fullName: 'Admin User',
            password: passwordHash,
            role: 'ADMIN',
            isVerified: true,
        },
    });

    const pm = await prisma.user.upsert({
        where: { email: 'pm@gimsoi.com' },
        update: {},
        create: {
            email: 'pm@gimsoi.com',
            fullName: 'Project Manager',
            password: passwordHash,
            role: 'PM',
            isVerified: true,
        },
    });

    const intern = await prisma.user.upsert({
        where: { email: 'intern@gimsoi.com' },
        update: {},
        create: {
            email: 'intern@gimsoi.com',
            fullName: 'Intern User',
            password: passwordHash,
            role: 'INTERN',
            isVerified: true,
        },
    });

    const clientUser = await prisma.user.upsert({
        where: { email: 'client@gimsoi.com' },
        update: {},
        create: {
            email: 'client@gimsoi.com',
            fullName: 'Client User',
            password: passwordHash,
            role: 'CLIENT',
            isVerified: true,
        },
    });

    // 2. Create Client
    const client = await prisma.client.create({
        data: {
            name: 'Global Tech Solutions',
            contactEmail: clientUser.email,
            createdByUserId: admin.id,
        },
    });

    // 3. Create Projects
    const projectsData = [
        { name: 'AI Infrastructure Upgrade', status: 'ACTIVE' },
        { name: 'Customer Portal V2', status: 'ACTIVE' }
    ];

    for (const proj of projectsData) {
        const project = await prisma.project.create({
            data: {
                name: proj.name,
                status: proj.status,
                clientId: client.id,
                createdByUserId: pm.id,
            },
        });

        // Add members to project
        await prisma.projectMember.createMany({
            data: [
                { projectId: project.id, userId: pm.id, role: 'OWNER' },
                { projectId: project.id, userId: intern.id, role: 'MEMBER' }
            ]
        });

        // 4. Create Sprints per Project
        const sprintConfigs = [
            { name: 'Sprint 1 - Foundation', status: 'CLOSED', goal: 'Build core architecture' },
            { name: 'Sprint 2 - Integration', status: 'ACTIVE', goal: 'Connect all microservices' }
        ];

        for (const sConf of sprintConfigs) {
            const sprint = await prisma.sprint.create({
                data: {
                    name: sConf.name,
                    status: sConf.status,
                    goal: sConf.goal,
                    projectId: project.id,
                    createdByUserId: pm.id,
                    startDate: sConf.status === 'ACTIVE' ? new Date() : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                    endDate: sConf.status === 'ACTIVE' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : new Date()
                },
            });

            // 5. Populate Tasks (15 per sprint)
            const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED', 'CANCELLED'];
            const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
            const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

            for (let i = 1; i <= 15; i++) {
                const status = sConf.status === 'CLOSED' ? 'DONE' : randomItem(statuses);
                const isBlocked = status === 'BLOCKED';
                const severity = isBlocked ? randomItem(['HIGH', 'CRITICAL']) : randomItem(severities);
                
                // Force some overdue tasks if not closed
                let dueDate = randomDate(new Date(2025, 0, 1), new Date(2026, 11, 31));
                if (i <= 3 && sConf.status !== 'CLOSED') {
                    dueDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
                }

                const task = await prisma.task.create({
                    data: {
                        title: `${proj.name} - ${sConf.name} Task ${i}`,
                        description: `Detailed description for task ${i} in ${sConf.name}`,
                        status: status,
                        projectId: project.id,
                        sprintId: sprint.id,
                        reporterId: pm.id,
                        assigneeId: intern.id,
                        priority: randomItem(priorities),
                        severity: severity,
                        storyPoints: randomInt(1, 13),
                        estimatedHours: randomInt(4, 40),
                        actualHours: status === 'DONE' ? randomInt(4, 40) : randomInt(0, 5),
                        isBlocked: isBlocked,
                        dueDate: dueDate,
                        completedAt: status === 'DONE' ? new Date() : null
                    },
                });

                // Add random labels
                if (i % 3 === 0) {
                    const labelName = randomItem(['API', 'Frontend', 'Refactor', 'Bug']);
                    await prisma.task.update({
                        where: { id: task.id },
                        data: {
                            labels: {
                                connectOrCreate: {
                                    where: { projectId_name: { projectId: project.id, name: labelName } },
                                    create: { name: labelName, projectId: project.id }
                                }
                            }
                        }
                    });
                }

                // Add some activity and comments for recent tasks
                if (i <= 5 && sConf.status === 'ACTIVE') {
                    await prisma.activityLog.create({
                        data: {
                            taskId: task.id,
                            userId: pm.id,
                            action: 'STATUS_CHANGE',
                            oldValue: 'TODO',
                            newValue: status
                        }
                    });

                    await prisma.comment.create({
                        data: {
                            taskId: task.id,
                            userId: intern.id,
                            content: `Working on this task. Found some interesting edge cases for ${proj.name}.`
                        }
                    });
                }
            }
        }
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
