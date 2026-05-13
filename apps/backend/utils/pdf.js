import PDFDocument from 'pdfkit';
import https from 'https';

// ─── Brand Tokens ────────────────────────────────────────
const BRAND = {
    navy:        '#002D62',
    blue:        '#002D62', // unified: navy-only palette
    accent:      '#004080', // deep navy accent for contrast
    background:  '#F8FAFC',
    surface:     '#FFFFFF',
    border:      '#E2E8F0',
    textPrimary: '#0F172A',
    textBody:    '#334155',
    textMuted:   '#64748B',
    textFaint:   '#94A3B8',
};

// ─── Status Badge Colors ──────────────────────────────────
const STATUS_COLORS = {
    DONE:        { bg: '#10B981', text: '#FFFFFF' }, // Emerald
    IN_PROGRESS: { bg: '#3B82F6', text: '#FFFFFF' }, // Blue
    REVIEW:      { bg: '#8B5CF6', text: '#FFFFFF' }, // Violet
    BLOCKED:     { bg: '#EF4444', text: '#FFFFFF' }, // Red
    CANCELLED:   { bg: '#64748B', text: '#FFFFFF' }, // Slate
    TODO:        { bg: '#94A3B8', text: '#FFFFFF' }, // Gray
};

const PRIORITY_COLORS = {
    URGENT: { bg: '#E11D48', text: '#FFFFFF' }, // Rose
    HIGH:   { bg: '#F59E0B', text: '#FFFFFF' }, // Amber
    MEDIUM: { bg: '#0EA5E9', text: '#FFFFFF' }, // Sky
    LOW:    { bg: '#059669', text: '#FFFFFF' }, // Emerald
};

// ─── Helpers ─────────────────────────────────────────────
const hex = (color) => color; 

/**
 * Fetches a chart image from QuickChart.io
 * @param {object} chartConfig - QuickChart configuration object
 * @returns {Promise<Buffer>}
 */
async function fetchChartImage(chartConfig) {
    const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=500&h=300`;
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
    });
}

/**
 * Draws the page header on the current page.
 */
function drawPageHeader(doc, reportType, L, R, T) {
    const y = T;
    // Important: Disable auto-page additions during header/footer draw
    const originalAutoPage = doc.options.autoFirstPage;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND.navy);
    doc.text('GIMSOI PROJECT TRACKER', L, y, { characterSpacing: 1.5, continued: false, lineBreak: false });

    const label = (reportType || 'Report').replace(/_/g, ' ');
    doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND.blue);
    doc.text(label, L, y, { align: 'right', width: R - L, lineBreak: false });

    const ruleY = y + 14;
    doc.moveTo(L, ruleY).lineTo(R, ruleY).lineWidth(1.5).strokeColor(BRAND.navy).stroke();

    const dateStr = `Generated: ${new Date().toUTCString()}`;
    doc.font('Helvetica').fontSize(8).fillColor(BRAND.textFaint);
    doc.text(dateStr, L, ruleY + 4, { align: 'right', width: R - L, lineBreak: false });
}

/**
 * Draws the page footer on the current page.
 */
function drawPageFooter(doc, L, R, B, pageNum) {
    const footerY = B + 8;
    doc.moveTo(L, footerY).lineTo(R, footerY).lineWidth(0.5).strokeColor(BRAND.border).stroke();

    doc.font('Helvetica').fontSize(8).fillColor(BRAND.textFaint);
    doc.text('Gimsoi Project Tracker — Confidential', L, footerY + 6, { lineBreak: false });
    doc.text(`Page ${pageNum}`, L, footerY + 6, { align: 'right', width: R - L, lineBreak: false });
}

/**
 * Manually adds a branded page with header and footer.
 */
function addBrandedPage(doc, margins) {
    doc.addPage();
    const { L, R, T, B } = margins;
    doc.pageCount = (doc.pageCount || 0) + 1;

    // Suppress auto-paging during branding
    const savedM = { T: doc.page.margins.top, B: doc.page.margins.bottom };
    doc.page.margins.top = 0;
    doc.page.margins.bottom = 0;

    drawPageHeader(doc, doc.reportType, L, R, T - 36);
    drawPageFooter(doc, L, R, B, doc.pageCount);

    // Restore margins
    doc.page.margins.top = savedM.T;
    doc.page.margins.bottom = savedM.B;

    doc.y = T;
}

/**
 * Draws a rounded badge pill.
 */
function drawBadge(doc, x, y, text, colors) {
    const textWidth = doc.font('Helvetica-Bold').fontSize(7).widthOfString(text);
    const badgeW = textWidth + 12;
    const badgeH = 14;

    doc.roundedRect(x, y - 2, badgeW, badgeH, 4).fill(colors.bg);
    doc.fillColor(colors.text).text(text, x + 6, y + 1.5, { lineBreak: false });
}

/**
 * Draws a metadata block with alternating rows.
 */
function drawMetadataBlock(doc, title, rows, margins) {
    const { L, R } = margins;
    drawSectionHeading(doc, title, margins);
    
    rows.forEach(([key, val], i) => {
        const y = doc.y;
        const rowBg = i % 2 === 0 ? BRAND.surface : BRAND.background;
        doc.rect(L, y, R - L, 22).fill(rowBg);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND.textMuted).text(key, L + 8, y + 6, { width: 130 });
        doc.font('Helvetica').fontSize(9).fillColor(BRAND.textBody).text(String(val), L + 148, y + 6, { width: R - L - 156 });
        doc.y = y + 22;
    });
    doc.moveDown(0.5);
}

/**
 * Draws the cover page for the report.
 */
function drawCoverPage(doc, report, margins) {
    const { L, R } = margins;
    const pageWidth = doc.page.width;

    // Suppress auto-paging for cover hero
    const savedM = { T: doc.page.margins.top, B: doc.page.margins.bottom };
    doc.page.margins.top = 0;
    doc.page.margins.bottom = 0;

    // Navy header band
    doc.rect(0, 0, pageWidth, 120).fill(BRAND.navy);
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#FFFFFF');
    doc.text('GIMSOI PROJECT TRACKER', 0, 32, { align: 'center', width: pageWidth, characterSpacing: 1.5 });

    // Blue accent strip
    doc.rect(0, 120, pageWidth, 8).fill(BRAND.blue);

    // Hero Title
    doc.y = 180;
    doc.font('Helvetica-Bold').fontSize(28).fillColor(BRAND.navy);
    doc.text(report.project?.name || 'Project Overview', L, doc.y, { align: 'center', width: R - L });
    
    // Subtitle
    const reportLabel = (report.type || 'Report').replace(/_/g, ' ');
    doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND.blue);
    doc.text(reportLabel.toUpperCase(), L, doc.y + 4, { align: 'center', width: R - L, characterSpacing: 1 });

    // Metadata table
    const metaStartY = doc.y + 80;
    const rows = [
        ['Report Name', report.name || 'N/A'],
        ['Report Type', reportLabel],
        ['Project Status', report.project?.status || 'N/A'],
        ['Generated',   new Date().toUTCString()],
        ['Report ID',   report.id || 'N/A'],
    ];

    let y = metaStartY;
    rows.forEach(([key, val], i) => {
        const rowBg = i % 2 === 0 ? BRAND.surface : BRAND.background;
        doc.rect(L, y, R - L, 22).fill(rowBg);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.textMuted).text(key, L + 8, y + 6, { width: 130 });
        doc.font('Helvetica').fontSize(10).fillColor(BRAND.textBody).text(String(val), L + 148, y + 6, { width: R - L - 156 });
        y += 22;
    });

    // Restore margins
    doc.page.margins.top = savedM.T;
    doc.page.margins.bottom = savedM.B;
}

/**
 * Draws a section heading with a blue underline accent.
 */
function drawSectionHeading(doc, title, margins) {
    if (doc.y + 40 > doc.page.height - 80) addBrandedPage(doc, margins);
    const { L, R } = margins;
    doc.moveDown(0.8);
    const y = doc.y;
    doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND.textPrimary).text(title, L, y);
    const textWidth = doc.widthOfString(title);
    doc.moveTo(L, doc.y + 2).lineTo(L + textWidth + 8, doc.y + 2)
        .lineWidth(2).strokeColor(BRAND.accent).stroke();
    doc.moveDown(0.6);
}

function generateExecutiveNarrative(report) {
    const m = report.sprintMetrics || {};
    const name = report.type === 'SPRINT_METRICS' ? (report.sprint?.name || 'Current Sprint') : (report.project?.name || 'Project');
    const comp = m.completionPercentage ?? 0;
    const vTrend = report.velocityTrend ?? 0;
    const blockedCount = m.blockedTasks ?? 0;
    const health = m.sprintHealth ?? 0;

    const blockedTasks = (report.project?.tasks || [])
        .filter(t => t.status === 'BLOCKED' && t.sprintId === report.sprint?.id);

    // 1. STATUS LINE
    const phase = comp > 85 ? "final testing and stabilization" : (comp > 40 ? "mid-cycle development" : "early execution");
    const s1 = `The ${name} phase is at ${comp}% completion, currently in ${phase}.`;

    // 2. VELOCITY LINE
    let s2 = "";
    if (vTrend > 0) s2 = `The team is tracking ${vTrend}% ahead of the historical sprint average.`;
    else if (vTrend < 0) s2 = `The team is tracking ${Math.abs(vTrend)}% behind the historical sprint average.`;
    else s2 = `Team pace is exactly matching the historical sprint average.`;

    // 3. RISK LINE
    let s3 = "";
    if (blockedCount > 0) {
        let taskNames = blockedTasks.slice(0, 2).map(t => {
            const cleanTitle = (t.title || 'N/A').replace(new RegExp(`^${report.project?.name || '___'} - `), '').replace(/^.*?(Sprint \d+.*? (Task | - ))/, "$2").replace(/^[\s-]+/, '');
            return `"${cleanTitle}"`;
        }).join(" and ");
        if (blockedTasks.length > 2) taskNames += ` and ${blockedTasks.length - 2} others`;
        
        let owner = blockedTasks[0]?.assignee?.fullName;
        
        if (taskNames) {
            s3 = `${blockedCount} blockers are threatening the critical path, specifically ${taskNames}.${owner ? '' : ' (Data gap: No owner assigned to primary blocker).'}`;
        } else {
            s3 = `${blockedCount} blockers are threatening the critical path (Data gap: Specific blocker names are unavailable).`;
        }
    } else {
        s3 = `There are 0 active blockers threatening the deadline or scope.`;
    }

    // 4. HEALTH VERDICT
    let s4 = "";
    if (health >= 85) s4 = `Overall health is ON TRACK, as core deliverables are pacing well against time elapsed.`;
    else if (health >= 60) s4 = `Overall health is AT RISK, as active blockers or overdue tasks are eroding the schedule buffer.`;
    else s4 = `Overall health is CRITICAL, as fundamental delivery metrics are failing to meet the baseline.`;

    // 5. RECOMMENDED ACTION
    let s5 = "";
    if (blockedCount > 0) {
        let owner = blockedTasks[0]?.assignee?.fullName || "The Project Manager";
        s5 = `Recommended Action: ${owner} must resolve the primary blocker immediately to prevent schedule slip.`;
    } else if (comp < 30 && vTrend < 0) {
        s5 = `Recommended Action: The Scrum Master must identify the root cause of the early delay by end of day.`;
    } else {
        s5 = `Recommended Action: The Product Owner should prepare the sprint review and backlog for the next cycle.`;
    }

    return `${s1} ${s2} ${s3} ${s4} ${s5}`;
}

/**
 * Draws the Executive Dashboard on Page 2.
 * Frontloads Goal, KPIs, and Red Flags.
 */
async function drawExecutiveSummary(doc, report, margins) {
    const { L, R } = margins;
    
    drawSectionHeading(doc, 'EXECUTIVE SUMMARY', margins);
    doc.font('Helvetica').fontSize(10).fillColor(BRAND.textBody);
    
    const summaryText = generateExecutiveNarrative(report);
    
    doc.text(summaryText, L, doc.y, { width: R - L, lineGap: 2 });
    doc.moveDown(1.5);

    // 1. Context: Metadata Block
    const metaRows = report.type === 'SPRINT_METRICS' ? [
        ['Sprint Goal', report.sprint?.goal || 'No goal set'],
        ['Status', report.sprint?.status || 'N/A'],
        ['Timeframe', `${report.sprint?.startDate ? new Date(report.sprint.startDate).toDateString() : 'N/A'} - ${report.sprint?.endDate ? new Date(report.sprint.endDate).toDateString() : 'N/A'}`]
    ] : [
        ['Status', report.project?.status || 'N/A'],
        ['Description', report.project?.description || 'No description provided.'],
        ['End Date', report.project?.endDate ? new Date(report.project.endDate).toDateString() : 'Not set']
    ];
    drawMetadataBlock(doc, 'Context & Objectives', metaRows, margins);

    // 2. Health: KPI Dashboard
    const m = report.sprintMetrics || {};
    drawKpiRow(doc, [
        { label: 'Velocity (pts)', value: m.velocity ?? 0, trend: report.velocityTrend },
        { label: 'Completion %',   value: `${m.completionPercentage ?? 0}%` },
        { label: 'Sprint Health',  value: `${m.sprintHealth ?? 0}%` },
        { label: 'Blocked Tasks',  value: m.blockedTasks ?? 0 },
        { label: 'Overdue Tasks',  value: m.overdueTasks ?? 0 },
    ], margins);

    drawKpiRow(doc, [
        { label: 'Hours Burnt (%)', value: `${m.taskProgress ?? 0}%` },
        { label: 'Delay Rate',      value: m.delayRate ?? 0 },
        { label: 'Delivery Risk',   value: m.deliveryRisk ?? 0 },
        { label: 'Impact Score',    value: m.impactScore ?? 0 },
        { label: 'Severity Index',  value: m.severityIndex ?? 0 },
    ], margins);

    doc.moveDown(0.5);

    // 3. Urgency: Red Flags
    if (report.redFlags && report.redFlags.length > 0) {
        doc.rect(L, doc.y, R - L, 24).fill(BRAND.navy);
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
        doc.text('CRITICAL IMPEDIMENTS & RED FLAGS', L + 8, doc.y + 7);
        doc.y += 24;
        doc.moveDown(0.5);

        report.redFlags.forEach(flag => {
            const y = doc.y;
            const textWidth = R - L - 330;
            const textHeight = doc.font('Helvetica').fontSize(9).heightOfString(flag.reason, { width: textWidth });
            const rowHeight = Math.max(24, textHeight + 10);

            doc.rect(L, y, R - L, rowHeight).fill(BRAND.surface);
            doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND.blue).text(flag.title, L + 8, y + (rowHeight - 9) / 2, { width: 300, lineBreak: false });
            doc.font('Helvetica').fontSize(9).fillColor(BRAND.textMuted).text(flag.reason, L + 320, y + (rowHeight - textHeight) / 2, { align: 'right', width: textWidth });
            doc.y = y + rowHeight + 4;
        });
        doc.moveDown();
    }
}

/**
 * Helper to draw the velocity chart deep-dive.
 */
async function drawVelocityChart(doc, report, margins) {
    if (!report.historicalVelocity || report.historicalVelocity.length < 2) return;
    const { L, R } = margins;

    if (doc.y + 240 > doc.page.height - 50) addBrandedPage(doc, margins);
    
    drawSectionHeading(doc, 'Performance Trends', margins);
    const chartConfig = {
        type: 'bar',
        data: {
            labels: report.historicalVelocity.map(v => v.name),
            datasets: [{
                label: 'Velocity',
                backgroundColor: BRAND.blue,
                data: report.historicalVelocity.map(v => v.velocity)
            }]
        },
        options: {
            title: { display: true, text: 'Historical Velocity Trend' }
        }
    };

    try {
        const chartBuffer = await fetchChartImage(chartConfig);
        if (doc.y + 240 > doc.page.height - 80) addBrandedPage(doc, margins);
        doc.image(chartBuffer, L, doc.y, { width: R - L, height: 200 });
        doc.y += 220;
    } catch (err) {
        const y = doc.y;
        doc.rect(L, y, R - L - 40, 160).lineWidth(1).dash(5, { space: 5 }).strokeColor(BRAND.border).stroke();
        doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.textFaint)
            .text('CHART UNAVAILABLE', L, y + 70, { align: 'center', width: R - L - 40 });
        doc.y = y + 180;
        doc.undash();
    }
}

/**
 * Draws a row of KPI cards.
 * @param {Array<{label: string, value: string}>} kpis
 */
function drawKpiRow(doc, kpis, margins) {
    if (doc.y + 70 > doc.page.height - 80) addBrandedPage(doc, margins);
    const { L, R } = margins;
    const totalWidth = R - L;
    const gutter = 16;
    const cardWidth = Math.floor((totalWidth - (gutter * (kpis.length - 1))) / kpis.length);
    const cardHeight = 56;

    let x = L;
    const y = doc.y;

    kpis.forEach(({ label, value, trend }) => {
        // Card background
        doc.roundedRect(x, y, cardWidth, cardHeight, 4).fill(BRAND.surface);
        // Left accent bar
        doc.rect(x, y, 4, cardHeight).fill(BRAND.blue);
        // Border
        doc.roundedRect(x, y, cardWidth, cardHeight, 4)
            .lineWidth(0.5).strokeColor(BRAND.accent).stroke();

        // Label
        doc.font('Helvetica-Bold').fontSize(7)
            .fillColor(BRAND.textMuted)
            .text(label.toUpperCase(), x + 12, y + 10, { width: cardWidth - 16, characterSpacing: 0.5 });

        // Value
        doc.font('Helvetica-Bold').fontSize(16)
            .fillColor(BRAND.blue)
            .text(String(value ?? 'N/A'), x + 12, y + 24, { width: cardWidth - 16 });

        // Trend indicator
        if (trend !== undefined) {
            const isPos = trend > 0;
            const trendText = `${isPos ? '+' : ''}${trend}% ${isPos ? '↑' : '↓'}`;
            doc.font('Helvetica-Bold').fontSize(8)
                .fillColor(isPos ? '#10B981' : '#EF4444')
                .text(trendText, x + 12, y + 42, { align: 'right', width: cardWidth - 24 });
        }

        x += cardWidth + gutter;
    });

    doc.y = y + cardHeight + 12;
}

/**
 * Draws a table. headers: string[], rows: string[][]
 */
function drawTable(doc, headers, rows, margins) {
    const { L, R } = margins;
    const totalWidth = R - L;
    const colCount = headers.length;
    const colWidth = Math.floor(totalWidth / colCount);
    const rowHeight = 32;
    const headerHeight = 32;
    let currentY = doc.y;

    const drawTableHeader = (startY) => {
        doc.rect(L, startY, totalWidth, headerHeight).fill(BRAND.navy);
        headers.forEach((h, i) => {
            const x = L + i * colWidth + 8;
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
                .text(h.toUpperCase(), x, startY + 11, { 
                    lineBreak: false 
                });
        });
        return startY + headerHeight;
    };

    if (currentY + headerHeight + rowHeight > doc.page.height - 80) {
        addBrandedPage(doc, margins);
        currentY = doc.y;
    }
    currentY = drawTableHeader(currentY);

    // Body rows
    rows.forEach((row, rowIdx) => {
        if (currentY + rowHeight > doc.page.height - 80) {
            addBrandedPage(doc, margins);
            currentY = drawTableHeader(doc.y);
        }

        const y = currentY;
        const rowBg = rowIdx % 2 === 0 ? BRAND.surface : BRAND.background;
        doc.rect(L, y, totalWidth, rowHeight).fill(rowBg);

        row.forEach((cell, colIdx) => {
            const header = headers[colIdx].toUpperCase();
            const x = L + colIdx * colWidth + 8;
            
            if (header === 'STATUS' || header === 'PRIORITY') {
                const palette = STATUS_COLORS[cell] || PRIORITY_COLORS[cell];
                if (palette) {
                    drawBadge(doc, x, y + 10, cell, palette);
                    return;
                }
            }

            if (header === 'LABELS') {
                const labels = Array.isArray(cell) ? cell : [];
                let labelX = x;
                labels.forEach(lbl => {
                    const lblText = String(lbl.name || lbl);
                    const lblW = doc.widthOfString(lblText) + 10;
                    if (labelX + lblW > x + colWidth - 8) return;
                    drawBadge(doc, labelX, y + 10, lblText, { bg: '#E5E7EB', text: '#374151' });
                    labelX += lblW + 4;
                });
                return;
            }

            doc.font('Helvetica').fontSize(9).fillColor(BRAND.textBody)
                .text(String(cell ?? 'N/A'), x, y + 11, {
                    width: colWidth - 12,
                    lineBreak: false,
                    ellipsis: true,
                    height: rowHeight - 4,
                });
        });

        // Row divider
        doc.moveTo(L, y + rowHeight).lineTo(R, y + rowHeight)
            .lineWidth(0.4).strokeColor(BRAND.border).stroke();
        
        currentY += rowHeight;
    });

    doc.y = currentY + 16;
}

/**
 * Draws a two-column section for Activity Logs and Comments.
 */
function drawActivityAndComments(doc, report, margins) {
    const { L, R, W } = margins;
    const colW = (W - 20) / 2;

    drawSectionHeading(doc, 'Activity & Collaboration', margins);

    const startY = doc.y;
    const rowHeight = 32;
    
    // Recent Activity
    doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.navy).text('RECENT ACTIVITY', L, startY);
    let activityY = startY + 20;
    
    const activities = report.recentActivity || [];
    if (activities.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(BRAND.textMuted).text('No recent activity recorded.', L, activityY);
        activityY += 20;
    } else {
        activities.slice(0, 8).forEach((act, i) => {
            if (activityY + rowHeight > doc.page.height - 80) return;
            if (i % 2 === 0) doc.rect(L - 5, activityY - 4, colW + 5, rowHeight).fill(BRAND.surface);
            
            doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND.textBody)
                .text(`${act.user?.fullName || 'System'}: ${act.action}`, L, activityY);
            doc.font('Helvetica').fontSize(7).fillColor(BRAND.textMuted)
                .text(`${act.task?.title?.substring(0, 45) || 'Task'}`, L, activityY + 11);
            activityY += rowHeight;
        });
    }

    // Recent Comments
    const col2X = L + colW + 20;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.navy).text('RECENT COMMENTS', col2X, startY);
    let commentY = startY + 20;
    
    const comments = report.recentComments || [];
    if (comments.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(BRAND.textMuted).text('No recent comments found.', col2X, commentY);
        commentY += 20;
    } else {
        comments.slice(0, 8).forEach((c, i) => {
            if (commentY + rowHeight > doc.page.height - 80) return;
            if (i % 2 === 0) doc.rect(col2X - 5, commentY - 4, colW + 5, rowHeight).fill(BRAND.surface);
            
            doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND.textBody)
                .text(`${c.user?.fullName || 'User'}:`, col2X, commentY);
            doc.font('Helvetica-Oblique').fontSize(7).fillColor(BRAND.textMuted)
                .text(`"${c.content?.substring(0, 50) || ''}..."`, col2X, commentY + 11);
            commentY += rowHeight;
        });
    }

    doc.y = Math.max(activityY, commentY) + 20;
}

/**
 * Generates a PROJECT_PROGRESS report.
 */
async function buildProjectProgressReport(doc, report, margins) {
    const { L } = margins;
    const project = report.project;
    const tasks = project?.tasks || [];

    await drawVelocityChart(doc, report, margins);
    drawActivityAndComments(doc, report, margins);

    drawSectionHeading(doc, 'Project Tasks', margins);
    const headers = ['Task', 'Status', 'Priority', 'Labels', 'Assignee'];
    const rows = tasks.slice(0, 50).map(t => [
        t.title?.substring(0, 50) || 'N/A',
        t.status || 'N/A',
        t.priority || 'N/A',
        t.labels || [],
        t.assignee?.fullName || 'Unassigned',
    ]);
    if (rows.length > 0) {
        drawTable(doc, headers, rows, margins);
    } else {
        doc.font('Helvetica').fontSize(10).fillColor(BRAND.textMuted)
            .text('No tasks found for this project.', L, doc.y);
    }
}

/**
 * Generates a SPRINT_METRICS report.
 */
async function buildSprintMetricsReport(doc, report, margins) {
    const { L, R } = margins;
    let tasks = [...(report.project?.tasks || [])];

    // 1. Team Workload Aggregation
    const assigneeStats = tasks.reduce((acc, t) => {
        const name = t.assignee?.fullName || 'Unassigned';
        if (!acc[name]) acc[name] = { total: 0, done: 0, points: 0 };
        acc[name].total++;
        if (t.status === 'DONE') acc[name].done++;
        acc[name].points += (t.storyPoints || 0);
        return acc;
    }, {});

    await drawVelocityChart(doc, report, margins);
    drawActivityAndComments(doc, report, margins);

    // 2. Team Workload Distribution
    drawSectionHeading(doc, 'Team Workload Distribution', margins);
    const workloadHeaders = ['Assignee', 'Total Tasks', 'Done', 'Story Pts'];
    const workloadRows = Object.entries(assigneeStats).map(([name, stats]) => [
        name, stats.total, stats.done, stats.points
    ]);
    drawTable(doc, workloadHeaders, workloadRows, margins);

    // 3. Priority-Sorted Task List
    drawSectionHeading(doc, 'Sprint Tasks (Priority Sorted)', margins);
    const STATUS_RANK = { BLOCKED: 0, REVIEW: 1, IN_PROGRESS: 2, TODO: 3, DONE: 4 };
    tasks.sort((a, b) => (STATUS_RANK[a.status] ?? 5) - (STATUS_RANK[b.status] ?? 5));

    const headers = ['Task', 'Status', 'Priority', 'Labels', 'Assignee'];
    const tableRows = tasks.slice(0, 50).map(t => [
        t.title?.substring(0, 50) || 'N/A',
        t.status || 'N/A',
        t.priority || 'N/A',
        t.labels || [],
        t.assignee?.fullName || 'Unassigned',
    ]);
    if (tableRows.length > 0) {
        drawTable(doc, headers, tableRows, margins);
    } else {
        doc.font('Helvetica').fontSize(10).fillColor(BRAND.textMuted)
            .text('No tasks found for this sprint.', L, doc.y);
    }
}

/**
 * Generates a TEAM_PERFORMANCE report.
 */
function buildTeamPerformanceReport(doc, report, margins) {
    const { L } = margins;
    const teamStats = report.teamStats || [];
    const tasks = report.project?.tasks || [];
    const members = report.project?.members || [];

    drawSectionHeading(doc, 'Team Overview', margins);
    doc.font('Helvetica').fontSize(10).fillColor(BRAND.textBody);
    doc.text(`Project: ${report.project?.name || 'N/A'}`, L, doc.y);
    doc.text(`Team Members: ${members.length}`);
    doc.text(`Total Tasks: ${tasks.length}`);
    doc.moveDown(0.5);

    drawKpiRow(doc, [
        { label: 'Team Members',     value: members.length },
        { label: 'Total Tasks',      value: tasks.length },
        { label: 'Completed',        value: tasks.filter(t => t.status === 'DONE').length },
        { label: 'Avg Completion %', value: teamStats.length > 0
            ? `${Math.round(teamStats.reduce((s, a) => s + a.completionRate, 0) / teamStats.length)}%`
            : '0%' },
    ], margins);

    drawSectionHeading(doc, 'Assignee Performance', margins);
    if (teamStats.length > 0) {
        const headers = ['Assignee', 'Total Tasks', 'Done', 'Completion %'];
        const rows = teamStats.map(a => [
            a.name,
            a.total,
            a.done,
            `${a.completionRate}%`,
        ]);
        drawTable(doc, headers, rows, margins);
    } else {
        doc.font('Helvetica').fontSize(10).fillColor(BRAND.textMuted)
            .text('No team data available.', L, doc.y);
    }

    drawSectionHeading(doc, 'Task Distribution', margins);
    const headers2 = ['Task', 'Status', 'Assignee', 'Priority'];
    const rows2 = tasks.slice(0, 50).map(t => [
        t.title?.substring(0, 38) || 'N/A',
        t.status || 'N/A',
        t.assignee?.fullName || 'Unassigned',
        t.priority || 'N/A',
    ]);
    if (rows2.length > 0) {
        drawTable(doc, headers2, rows2, margins);
    } else {
        doc.font('Helvetica').fontSize(10).fillColor(BRAND.textMuted)
            .text('No tasks found.', L, doc.y);
    }
}

/**
 * Main PDF generation function.
 *
 * @param {object} reportData - Enriched report object from report.service.js
 * @returns {Promise<Buffer>} - The PDF as a binary buffer
 */
export const generateProjectReportPDF = async (reportData) => {
    // A4: 595.28 x 841.89 pt at 72dpi
    // 20mm = ~56.7pt, 24mm = ~68pt
    const marginLR = 57;
    const marginT  = 72;
    const marginB  = 72;

    const doc = new PDFDocument({
        size: 'A4',
        margin: marginT,
        autoFirstPage: false,
        info: {
            Title:    reportData.name || 'Gimsoi Report',
            Author:   'Gimsoi Project Tracker',
            Creator:  'Gimsoi PDF Engine',
            Subject:  reportData.type || 'Report',
        },
    });

    const chunks = [];
    doc.on('data',  (chunk) => chunks.push(chunk));
    
    const pdfBufferPromise = new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });

    const margins = {
        L: marginLR,
        R: 595.28 - marginLR,
        T: marginT,
        B: 841.89 - marginB,
        W: 595.28 - 2 * marginLR,
    };

    // Initial page Count
    doc.pageCount = 0;

    // ─── COVER PAGE ─────────────────────────────────
    doc.reportType = reportData.type;
    doc.isCoverPage = true;
    doc.addPage();
    doc.pageCount = 1;
    // Override margins R now that we have a page
    margins.R = 595.28 - marginLR;
    drawCoverPage(doc, reportData, margins);

    // ─── CONTENT PAGES ──────────────────────────────
    doc.isCoverPage = false;
    addBrandedPage(doc, margins);
    
    // Page 2: Executive Summary & Red Flags
    await drawExecutiveSummary(doc, reportData, margins);
    
    // Page 3+: Detailed Metrics
    if (doc.y > margins.T + 50) {
        addBrandedPage(doc, margins);
    }

    const type = reportData.type;

    if (type === 'PROJECT_PROGRESS') {
        await buildProjectProgressReport(doc, reportData, margins);
    } else if (type === 'SPRINT_METRICS') {
        await buildSprintMetricsReport(doc, reportData, margins);
    } else if (type === 'TEAM_PERFORMANCE') {
        buildTeamPerformanceReport(doc, reportData, margins);
    } else {
        await buildProjectProgressReport(doc, reportData, margins);
    }

    doc.end();
    return pdfBufferPromise;
};
