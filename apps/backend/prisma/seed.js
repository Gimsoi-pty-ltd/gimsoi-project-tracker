import prisma from '../lib/prisma.js';
import bcryptjs from 'bcryptjs';

async function main() {
    console.log('Starting seed...');

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

    // 2. Create a Client Entity
    const client = await prisma.client.create({
        data: {
            name: 'Acme Corp',
            contactEmail: clientUser.email,
            createdByUserId: admin.id,
        },
    });

    // 3. Create Projects for each state
    const draftProject = await prisma.project.create({
        data: {
            name: 'Website Redesign (Draft)',
            status: 'DRAFT',
            clientId: client.id,
            createdByUserId: pm.id,
        },
    });

    const activeProject = await prisma.project.create({
        data: {
            name: 'Mobile App (Active)',
            status: 'ACTIVE',
            clientId: client.id,
            createdByUserId: pm.id,
        },
    });

    const completedProject = await prisma.project.create({
        data: {
            name: 'Legacy Migration (Completed)',
            status: 'COMPLETED',
            clientId: client.id,
            createdByUserId: admin.id,
        },
    });

    // 4. Create a Sprint
    const sprint = await prisma.sprint.create({
        data: {
            name: 'Sprint 1 - Core Features',
            status: 'PLANNING',
            projectId: activeProject.id,
            createdByUserId: pm.id,
        },
    });

    // 5. Create a Task
    await prisma.task.create({
        data: {
            title: 'Setup Database',
            description: 'Initialize PostgreSQL with Prisma',
            status: 'TODO',
            projectId: activeProject.id,
            sprintId: sprint.id,
            reporterId: pm.id,
            assigneeId: intern.id,
        },
    });

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
