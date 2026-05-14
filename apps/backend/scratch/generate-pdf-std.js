import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5001/api';

async function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const data = Buffer.concat(chunks);
                resolve({ 
                    statusCode: res.statusCode, 
                    headers: res.headers, 
                    data: data 
                });
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    try {
        console.log('Logging in...');
        const loginRes = await request({
            hostname: 'localhost',
            port: 5001,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, JSON.stringify({ email: 'pm@gimsoi.com', password: 'Password123!' }));

        if (loginRes.statusCode !== 200) {
            throw new Error(`Login failed with status ${loginRes.statusCode}: ${loginRes.data.toString()}`);
        }

        const setCookie = loginRes.headers['set-cookie'] || [];
        const cookies = setCookie.map(c => c.split(';')[0]).join('; ');
        
        // Find the XSRF-TOKEN cookie
        const xsrfCookie = setCookie.find(c => c.startsWith('XSRF-TOKEN='));
        const csrfToken = xsrfCookie ? xsrfCookie.split('=')[1].split(';')[0] : null;

        console.log('Using CSRF Token:', csrfToken);

        console.log('Fetching projects...');
        const projectsRes = await request({
            hostname: 'localhost',
            port: 5001,
            path: '/api/projects',
            method: 'GET',
            headers: { 'Cookie': cookies }
        });
        const project = JSON.parse(projectsRes.data.toString()).data[0];
        if (!project) throw new Error('No projects found');

        console.log('Creating report...');
        const reportRes = await request({
            hostname: 'localhost',
            port: 5001,
            path: '/api/reports',
            method: 'POST',
            headers: { 
                'Cookie': cookies,
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken
            }
        }, JSON.stringify({ name: 'Manual PDF', type: 'SPRINT_METRICS', projectId: project.id }));
        
        const report = JSON.parse(reportRes.data.toString()).data;
        console.log(`Report ID: ${report.id}`);

        console.log('Downloading PDF...');
        const pdfRes = await request({
            hostname: 'localhost',
            port: 5001,
            path: `/api/reports/${report.id}/pdf`,
            method: 'GET',
            headers: { 'Cookie': cookies }
        });

        // Validate content type
        const contentType = pdfRes.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
            const errorObj = JSON.parse(pdfRes.data.toString());
            throw new Error(`Server Error: ${errorObj.message}`);
        }

        if (!contentType.includes('application/pdf')) {
            throw new Error(`Unexpected content type: ${contentType}`);
        }

        const filePath = path.resolve('scratch', 'manual-report.pdf');
        fs.writeFileSync(filePath, pdfRes.data);
        console.log(`Saved to: ${filePath}`);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

main();
