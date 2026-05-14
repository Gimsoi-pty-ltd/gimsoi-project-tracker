import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import fs from 'fs';
import path from 'path';

const jar = new CookieJar();
const client = wrapper(axios.create({ 
    baseURL: 'http://localhost:5000/api',
    jar,
    withCredentials: true 
}));

async function generateReport() {
    try {
        console.log('Logging in...');
        const loginRes = await client.post('/auth/login', {
            email: 'pm@gimsoi.com',
            password: 'Password123!'
        });
        
        // CSRF token is in cookies
        const cookies = await jar.getCookies('http://localhost:5000/api');
        const csrfToken = cookies.find(c => c.key === 'csrf-token')?.value;
        
        console.log('Fetching projects...');
        const projectsRes = await client.get('/projects');
        const project = projectsRes.data.data[0];
        
        if (!project) throw new Error('No projects found. Seed the DB first.');

        console.log(`Creating SPRINT_METRICS report for project: ${project.name}`);
        const reportRes = await client.post('/reports', {
            name: 'Styled Automation Report',
            type: 'SPRINT_METRICS',
            projectId: project.id
        }, {
            headers: { 'x-csrf-token': csrfToken }
        });
        
        const report = reportRes.data.data;
        console.log(`Report created: ${report.id}`);

        console.log('Downloading PDF...');
        const pdfRes = await client.get(`/reports/${report.id}/pdf`, {
            responseType: 'arraybuffer'
        });

        const filePath = path.resolve('scratch', 'automation-report.pdf');
        fs.writeFileSync(filePath, pdfRes.data);
        console.log(`Report saved to: ${filePath}`);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
        process.exit(1);
    }
}

generateReport();
