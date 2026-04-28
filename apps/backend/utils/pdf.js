import PDFDocument from 'pdfkit';

/**
 * Generates a project progress PDF report.
 *
 * @param {object} reportData - The report payload from report.service.js
 * @returns {Buffer} - The PDF as a binary buffer
 */
export const generateProjectReportPDF = async (reportData) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // --- Header ---
        doc.fontSize(22).font('Helvetica-Bold').text('Gimsoi Project Tracker', { align: 'center' });
        doc.fontSize(14).font('Helvetica').text('Project Progress Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).fillColor('grey').text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
        doc.fillColor('black');
        doc.moveDown(1.5);

        // --- Report Metadata ---
        doc.fontSize(14).font('Helvetica-Bold').text('Report Details');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fontSize(11).font('Helvetica');
        doc.text(`Report Name: ${reportData.name}`);
        doc.text(`Report Type: ${reportData.type}`);
        doc.text(`Report ID:   ${reportData.id}`);
        doc.moveDown();

        // --- Project Section ---
        if (reportData.project) {
            const p = reportData.project;
            doc.fontSize(14).font('Helvetica-Bold').text('Project');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.fontSize(11).font('Helvetica');
            doc.text(`Name:        ${p.name}`);
            doc.text(`Status:      ${p.status}`);
            doc.text(`Description: ${p.description || 'N/A'}`);
            doc.text(`End Date:    ${p.endDate ? new Date(p.endDate).toDateString() : 'N/A'}`);
            doc.moveDown();

            // --- Task Summary ---
            const tasks = p.tasks || [];
            const statusGroups = tasks.reduce((acc, t) => {
                acc[t.status] = (acc[t.status] || 0) + 1;
                return acc;
            }, {});

            doc.fontSize(14).font('Helvetica-Bold').text('Task Summary');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.fontSize(11).font('Helvetica');
            doc.text(`Total Tasks:    ${tasks.length}`);
            Object.entries(statusGroups).forEach(([status, count]) => {
                doc.text(`  ${status}: ${count}`);
            });
        }

        doc.end();
    });
};
