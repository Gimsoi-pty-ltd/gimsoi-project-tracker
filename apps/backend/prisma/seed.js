import prisma from '../lib/prisma.js';
import bcryptjs from 'bcryptjs';

// --- Helpers for Randomization ---
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const pastDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d;
};
const futureDate = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d;
};

// Dummy text arrays to make things look real
const taskTitles = [
    'Implement API Authentication', 'Design Landing Page', 'Setup Database Schema',
    'Write E2E Tests', 'Fix Navigation Bug', 'Optimize Image Loading',
    'Update Privacy Policy', 'Create User Onboarding Flow', 'Integrate Payment Gateway',
    'Configure CI/CD Pipeline', 'Migrate Legacy Data', 'Audit Security Logs',
    'Design Email Templates', 'Build Search Feature', 'Refactor State Management'
];
const projectNames = ['Website Redesign', 'Mobile App V2', 'Internal Dashboard', 'Client Portal'];
const clientNames = ['Acme Corp', 'Globex Corporation', 'Initech', 'Soylent Corp'];

async function main() {
    console.log('Starting rich seed...');

    // Optionally clear existing data for a clean slate
    await prisma.activityLog.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.sprint.deleteMany({});
    await prisma.phase.deleteMany({});
    await prisma.projectAnalytics.deleteMany({});
    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.client.deleteMany({});
    // We don't delete users to avoid breaking logins, we just upsert them

    const passwordHash = await bcryptjs.hash('Password123!', 10);

    // 0. Conditionally create the Demo Account securely via environment variables
    if (process.env.DEMO_PASSWORD) {
        const demoHash = await bcryptjs.hash(process.env.DEMO_PASSWORD, 10);
        await prisma.user.upsert({
            where: { email: 'demo.account@gimsoi.com' },
            update: { password: demoHash, role: 'ADMIN', isVerified: true },
            create: {
                email: 'demo.account@gimsoi.com',
                fullName: 'Demo Account',
                password: demoHash,
                role: 'ADMIN',
                isVerified: true,
            },
        });
        console.log('Demo account securely seeded from environment.');
    }

    // 1. Create Users for each role
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
            fullName: 'Sarah Mitchell', // Project Manager
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

    const teamUsers = [admin, pm, intern];
    const allUsers = [...teamUsers, clientUser];

    // 2. Create Clients
    const clients = [];
    for (const name of clientNames) {
        const client = await prisma.client.create({
            data: {
                name,
                contactEmail: `contact@${name.toLowerCase().replace(/\s/g, '')}.com`,
                createdByUserId: admin.id,
            },
        });
        clients.push(client);
    }

    // 3. Create Projects
    const projectStatuses = ['ACTIVE', 'ACTIVE', 'DRAFT', 'COMPLETED'];
    const projects = [];

    for (let i = 0; i < projectNames.length; i++) {
        const status = projectStatuses[i];
        const project = await prisma.project.create({
            data: {
                name: projectNames[i],
                status: status,
                clientId: randomElement(clients).id,
                createdByUserId: pm.id,
                description: `This is a sample description for ${projectNames[i]}`,
            },
        });

        // Add Members to Project
        for (const user of allUsers) {
            // Give 50% chance to be in project, but always include PM
            if (user.id === pm.id || Math.random() > 0.5) {
                await prisma.projectMember.create({
                    data: {
                        projectId: project.id,
                        userId: user.id,
                        role: user.id === pm.id ? 'OWNER' : 'MEMBER'
                    }
                });
            }
        }

        // 4. Create Phases for Project
        const phases = [];
        const phaseNames = ['Discovery & Planning', 'Design', 'Development', 'Testing & QA', 'Deployment'];
        for (let p = 0; p < phaseNames.length; p++) {
            const phaseStatus = p < 2 ? 'COMPLETED' : (p === 2 ? 'ACTIVE' : 'DRAFT');
            const phase = await prisma.phase.create({
                data: {
                    name: phaseNames[p],
                    status: phaseStatus,
                    projectId: project.id,
                    order: p,
                    startDate: pastDate(30 - p * 7),
                    endDate: pastDate(30 - (p + 1) * 7),
                }
            });
            phases.push(phase);
        }

        // 5. Create Sprints for Project
        const sprints = [];
        // Past Sprints
        for (let s = 1; s <= 3; s++) {
            const sprint = await prisma.sprint.create({
                data: {
                    name: `Sprint ${s} - Past`,
                    status: 'CLOSED',
                    projectId: project.id,
                    startDate: pastDate(40 - s * 14),
                    endDate: pastDate(40 - (s + 1) * 14),
                }
            });
            sprints.push(sprint);
        }
        // Active Sprint
        const activeSprint = await prisma.sprint.create({
            data: {
                name: 'Sprint 4 - Current',
                status: 'ACTIVE',
                projectId: project.id,
                startDate: pastDate(7),
                endDate: futureDate(7),
            }
        });
        sprints.push(activeSprint);

        // Future Sprint
        const futureSprint = await prisma.sprint.create({
            data: {
                name: 'Sprint 5 - Next',
                status: 'PLANNING',
                projectId: project.id,
                startDate: futureDate(8),
                endDate: futureDate(22),
            }
        });
        sprints.push(futureSprint);

        // 6. Create Tasks for Project
        // Generate ~40 tasks
        const numTasks = randomInt(30, 50);
        for (let t = 0; t < numTasks; t++) {
            const titleBase = randomElement(taskTitles);
            const title = `${titleBase} - Part ${randomInt(1, 10)}`;
            
            // Randomly select status
            const statusChoices = ['TODO', 'IN_PROGRESS', 'DONE', 'DONE', 'BLOCKED', 'TODO', 'IN_PROGRESS'];
            const taskStatus = randomElement(statusChoices);
            
            // Prioritize older sprints for DONE tasks, active sprint for IN_PROGRESS
            let sprintId = null;
            if (taskStatus === 'DONE') {
                sprintId = randomElement(sprints.slice(0, 3)).id; // Past sprints
            } else if (taskStatus === 'IN_PROGRESS' || taskStatus === 'BLOCKED') {
                sprintId = activeSprint.id; // Current sprint
            } else {
                sprintId = randomElement(sprints.slice(3, 5)).id; // Current or Future
            }

            const priorityChoices = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
            const priority = randomElement(priorityChoices);

            // Mix up due dates: 20% overdue, 80% future/current
            const isOverdue = Math.random() < 0.2 && taskStatus !== 'DONE';
            const dueDate = isOverdue ? pastDate(randomInt(1, 15)) : futureDate(randomInt(1, 30));

            // CompletedAt logic
            const completedAt = taskStatus === 'DONE' ? pastDate(randomInt(1, 20)) : null;

            await prisma.task.create({
                data: {
                    title,
                    description: `Rich dummy content for ${title}. Needs to be robust for testing.`,
                    status: taskStatus,
                    projectId: project.id,
                    sprintId,
                    phaseId: randomElement(phases).id,
                    assigneeId: randomElement(teamUsers).id, // Assign to internal team
                    reporterId: randomElement(allUsers).id,
                    priority,
                    dueDate,
                    completedAt,
                    isBlocked: taskStatus === 'BLOCKED',
                }
            });
        }
        projects.push(project);
    }

    console.log(`Seed completed successfully! Generated ${projects.length} projects with phases, sprints, and tasks.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
