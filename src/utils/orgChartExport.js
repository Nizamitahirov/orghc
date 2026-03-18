// utils/orgChartExport.js

const wait     = (ms) => new Promise(r => setTimeout(r, ms));
const waitFrame = ()  => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

// ─── Node data-koordinat bounding box ───────────────────────────────────────
const getNodesDataBounds = () => {
    const nodeEls = document.querySelectorAll('.react-flow__node');
    if (!nodeEls.length) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodeEls.forEach(el => {
        const m = (el.style.transform || '').match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        if (!m) return;
        const x = parseFloat(m[1]), y = parseFloat(m[2]);
        const w = el.offsetWidth || 260, h = el.offsetHeight || 150;
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h);
    });
    return isFinite(minX) ? { minX, minY, maxX, maxY } : null;
};

// ─── Core capture ────────────────────────────────────────────────────────────
const captureFullChart = async (darkMode) => {
    const { toPng } = await import('html-to-image');

    const rfWrapper  = document.querySelector('.react-flow');
    const viewportEl = document.querySelector('.react-flow__viewport');
    if (!rfWrapper || !viewportEl)
        throw new Error('ReactFlow elementi tapılmadı. Tree view-da olduğunuzdan əmin olun.');

    // 1. UI gizlət
    const UI_SELS = ['.react-flow__controls','.react-flow__minimap','.react-flow__attribution','.react-flow__panel'];
    const hiddenEls = [];
    UI_SELS.forEach(sel =>
        rfWrapper.querySelectorAll(sel).forEach(el => {
            hiddenEls.push([el, el.style.visibility]);
            el.style.visibility = 'hidden';
        })
    );

    // 2. Bounds
    const bounds = getNodesDataBounds();
    if (!bounds) throw new Error('Node tapılmadı. Expand All ilə node-ları açın.');

    const PADDING   = 48;
    const contentW  = (bounds.maxX - bounds.minX) + PADDING * 2;
    const contentH  = (bounds.maxY - bounds.minY) + PADDING * 2;
    const MAX_SIDE  = 16000;
    const PIXEL_RATIO = 2;
    const captureScale = Math.min(1, MAX_SIDE / (contentW * PIXEL_RATIO), MAX_SIDE / (contentH * PIXEL_RATIO));
    const tx = -(bounds.minX - PADDING) * captureScale;
    const ty = -(bounds.minY - PADDING) * captureScale;
    const captureW = Math.round(contentW * captureScale);
    const captureH = Math.round(contentH * captureScale);

    // 3. Viewport sıfırla
    const savedTransform  = viewportEl.style.transform;
    const savedTransition = viewportEl.style.transition;
    const savedOverflow   = rfWrapper.style.overflow;
    const savedW          = rfWrapper.style.width;
    const savedH          = rfWrapper.style.height;

    viewportEl.style.transition = 'none';
    viewportEl.style.transform  = `translate(${tx}px, ${ty}px) scale(${captureScale})`;
    rfWrapper.style.overflow    = 'visible';
    rfWrapper.style.width       = `${captureW}px`;
    rfWrapper.style.height      = `${captureH}px`;

    await waitFrame();
    await wait(150);

    // 4. Capture
    let dataUrl;
    try {
        dataUrl = await toPng(rfWrapper, {
            backgroundColor: darkMode ? '#0f172a' : '#e7ebf1',
            pixelRatio: PIXEL_RATIO,
            cacheBust:  true,
            width:  captureW,
            height: captureH,
        });
    } finally {
        viewportEl.style.transition = savedTransition;
        viewportEl.style.transform  = savedTransform;
        rfWrapper.style.overflow    = savedOverflow;
        rfWrapper.style.width       = savedW;
        rfWrapper.style.height      = savedH;
        hiddenEls.forEach(([el, prev]) => { el.style.visibility = prev; });
        await waitFrame();
    }

    // Real pixel ölçüsü (pixelRatio nəzərə alınmaqla)
    const imgW = captureW * PIXEL_RATIO;
    const imgH = captureH * PIXEL_RATIO;

    return { dataUrl, imgW, imgH };
};

// ─────────────────────────────────────────────────────────────────────────────
// PNG Export
// ─────────────────────────────────────────────────────────────────────────────
export const exportToPNG = async ({ darkMode, selectedCompany, setExportLoading }) => {
    try {
        setExportLoading('png');
        const { dataUrl } = await captureFullChart(darkMode);
        const link = document.createElement('a');
        link.download = `org-chart-${selectedCompany || 'all'}-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('PNG export xətası:', err);
        alert(`PNG export uğursuz oldu: ${err.message}`);
    } finally {
        setExportLoading(null);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF Export — jsPDF ilə real .pdf faylı
// ─────────────────────────────────────────────────────────────────────────────
export const exportToPDF = async ({ darkMode, selectedCompany, setExportLoading, summary }) => {
    try {
        setExportLoading('pdf');

        // jsPDF dynamic import (package.json-da "jspdf" olmalıdır)
        const { jsPDF } = await import('jspdf');

        const { dataUrl, imgW, imgH } = await captureFullChart(darkMode);

        const companyLabel = (!selectedCompany || selectedCompany === 'ALL')
            ? 'All Companies' : selectedCompany;

        // ── Səhifə ölçüsü: A3 landscape ─────────────────────────────────────
        // jsPDF unit: mm. A3 landscape = 420 × 297 mm
        const PAGE_W = 420, PAGE_H = 297;
        const MARGIN  = 10; // mm
        const HEADER_H = 18; // mm — başlıq hündürlüyü
        const FOOTER_H = 8;  // mm
        const STATS_H  = summary ? 8 : 0; // mm

        const chartAreaW = PAGE_W - MARGIN * 2;
        const chartAreaH = PAGE_H - MARGIN * 2 - HEADER_H - FOOTER_H - STATS_H - 4;

        // Chart image-ni chartArea-ya sığdır (aspect ratio qoru)
        const aspect = imgW / imgH;
        let drawW = chartAreaW, drawH = chartAreaW / aspect;
        if (drawH > chartAreaH) { drawH = chartAreaH; drawW = chartAreaH * aspect; }
        const drawX = MARGIN + (chartAreaW - drawW) / 2; // mərkəzlə

        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });

        // ── Şrift ───────────────────────────────────────────────────────────
        pdf.setFont('helvetica');

        // ── Header ──────────────────────────────────────────────────────────
        // Sol tərəf: başlıq xətti
        pdf.setDrawColor(35, 70, 168);
        pdf.setLineWidth(0.8);
        pdf.line(MARGIN, MARGIN + HEADER_H - 1, PAGE_W - MARGIN, MARGIN + HEADER_H - 1);

        // Başlıq mətni
        pdf.setFontSize(16);
        pdf.setTextColor(35, 70, 168);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Organizational Chart', MARGIN, MARGIN + 7);

        pdf.setFontSize(9);
        pdf.setTextColor(79, 87, 114);
        pdf.setFont('helvetica', 'normal');
        pdf.text(companyLabel, MARGIN, MARGIN + 13);

        // Sağ tərəf: tarix
        const dateStr = new Date().toLocaleDateString('az-AZ',
            { year: 'numeric', month: 'long', day: 'numeric' });
        pdf.setFontSize(8);
        pdf.setTextColor(122, 130, 154);
        pdf.text(dateStr,    PAGE_W - MARGIN, MARGIN + 7,  { align: 'right' });
        pdf.text('Almet HRIS', PAGE_W - MARGIN, MARGIN + 12, { align: 'right' });

        // ── Stats bar ────────────────────────────────────────────────────────
        let cursorY = MARGIN + HEADER_H + 2;

        if (summary) {
            const statParts = [
                { label: 'Employees',   value: summary.totalEmployees  || 0 },
                { label: 'Managers',    value: summary.totalManagers   || 0 },
                summary.totalVacancies  > 0 && { label: 'Vacant',      value: summary.totalVacancies },
                summary.totalDepartments > 0 && { label: 'Departments', value: summary.totalDepartments },
            ].filter(Boolean);

            pdf.setFillColor(241, 245, 249);
            pdf.roundedRect(MARGIN, cursorY, chartAreaW, 6, 1.5, 1.5, 'F');

            let statX = MARGIN + 4;
            pdf.setFontSize(8);
            statParts.forEach(({ label, value }, i) => {
                pdf.setTextColor(79, 87, 114);
                pdf.setFont('helvetica', 'normal');
                pdf.text(`${label}: `, statX, cursorY + 4.2);
                const labelW = pdf.getTextWidth(`${label}: `);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 41, 59);
                pdf.text(String(value), statX + labelW, cursorY + 4.2);
                const valW = pdf.getTextWidth(String(value));
                statX += labelW + valW + 8;

                if (i < statParts.length - 1) {
                    pdf.setDrawColor(203, 213, 225);
                    pdf.setLineWidth(0.2);
                    pdf.line(statX - 4, cursorY + 1.5, statX - 4, cursorY + 5);
                }
            });

            cursorY += STATS_H + 2;
        }

        // ── Chart image ──────────────────────────────────────────────────────
        // Çərçivə
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(drawX - 1, cursorY - 1, drawW + 2, drawH + 2, 2, 2);

        pdf.addImage(dataUrl, 'PNG', drawX, cursorY, drawW, drawH, '', 'FAST');

        // ── Footer ───────────────────────────────────────────────────────────
        const footerY = PAGE_H - MARGIN - 2;
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.line(MARGIN, footerY - 3, PAGE_W - MARGIN, footerY - 3);

        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.setFont('helvetica', 'normal');
        const generatedAt = new Date().toLocaleString('az-AZ');
        pdf.text(
            `Generated by Almet HRIS  •  ${generatedAt}`,
            PAGE_W / 2, footerY,
            { align: 'center' }
        );

        // ── Yüklə ────────────────────────────────────────────────────────────
        const fileName = `org-chart-${selectedCompany || 'all'}-${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);

    } catch (err) {
        console.error('PDF export xətası:', err);
        alert(`PDF export uğursuz oldu: ${err.message}`);
    } finally {
        setExportLoading(null);
    }
};