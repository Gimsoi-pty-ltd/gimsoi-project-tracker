import { createReport, getReportById, getReports } from '../services/report.service.js';
import { generateProjectReportPDF } from '../utils/pdf.js';

export const createReportHandler = async (req, res, next) => {
    try {
        const report = await createReport({ ...req.body, createdByUserId: req.user.id });
        return res.status(201).json({ success: true, data: report });
    } catch (err) {
        next(err);
    }
};

export const getReportsHandler = async (req, res, next) => {
    try {
        const { limit, cursor } = req.query;
        const reports = await getReports({ limit, cursor, createdByUserId: req.user.id });
        return res.status(200).json({ success: true, data: reports });
    } catch (err) {
        next(err);
    }
};

export const getReportPdfHandler = async (req, res, next) => {
    try {
        const report = await getReportById(req.params.id);

        // Ownership check: only the creator can download their report
        if (report.createdByUserId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Forbidden.' });
        }

        const pdfBuffer = await generateProjectReportPDF(report);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="report-${report.id}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.status(200).send(pdfBuffer);
    } catch (err) {
        next(err);
    }
};
