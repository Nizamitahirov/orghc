/**
 * exportTurnoverExcel.js
 * Generates a styled Excel workbook matching the Almet Turnover Report template.
 * Uses xlsx-js-style (already in package.json).
 */
import XLSXStyle from "xlsx-js-style";

// ── Colours ───────────────────────────────────────────────────────────────────
const BLUE_HEADER  = "253360"; // Almet cloud-burst
const TEAL_HEADER  = "1D9E75";
const AMBER        = "EF9F27";
const CORAL        = "D85A30";
const LIGHT_GRAY   = "F5F5F5";
const WHITE        = "FFFFFF";
const GREEN_LOW    = "C6EFCE";  // Excel-style green fill (low %)
const RED_HIGH     = "FFC7CE";  // Excel-style red fill (high %)
const GREEN_TEXT   = "276221";
const RED_TEXT     = "9C0006";

const EXIT_TYPES = [
  { code: "voluntary_resignation",  label: "Voluntary Resignation" },
  { code: "termination",            label: "Termination" },
  { code: "end_of_internship",      label: "End of Internship" },
  { code: "probation_period_failed",label: "Probation Period Failed" },
];

// ── Style helpers ─────────────────────────────────────────────────────────────
function cell(v, style = {}) {
  return { v, t: typeof v === "number" ? "n" : "s", s: style };
}

function headerCell(v, bgColor = BLUE_HEADER, fgColor = WHITE, bold = true) {
  return cell(v, {
    fill: { fgColor: { rgb: bgColor } },
    font: { bold, color: { rgb: fgColor }, sz: 9 },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top:    { style: "thin", color: { rgb: "CCCCCC" } },
      bottom: { style: "thin", color: { rgb: "CCCCCC" } },
      left:   { style: "thin", color: { rgb: "CCCCCC" } },
      right:  { style: "thin", color: { rgb: "CCCCCC" } },
    },
  });
}

function dataCell(v, align = "right", bold = false, fillRgb = null) {
  return cell(v, {
    fill: fillRgb ? { fgColor: { rgb: fillRgb } } : { fgColor: { rgb: WHITE } },
    font: { sz: 9, bold, color: { rgb: "000000" } },
    alignment: { horizontal: align, vertical: "center" },
    border: {
      top:    { style: "thin", color: { rgb: "E0E0E0" } },
      bottom: { style: "thin", color: { rgb: "E0E0E0" } },
      left:   { style: "thin", color: { rgb: "E0E0E0" } },
      right:  { style: "thin", color: { rgb: "E0E0E0" } },
    },
  });
}

function pctFill(pctNum) {
  // Returns fill color based on percentage value
  if (pctNum === 0) return WHITE;
  if (pctNum >= 80) return RED_HIGH;
  if (pctNum >= 50) return "FFD9B3"; // light orange
  return GREEN_LOW;
}

function pctTextColor(pctNum) {
  if (pctNum >= 80) return RED_TEXT;
  if (pctNum >= 50) return "8B4000";
  if (pctNum > 0)   return GREEN_TEXT;
  return "000000";
}

function pctCell(pctNum) {
  const fill   = pctFill(pctNum);
  const fgRgb  = pctTextColor(pctNum);
  const text   = pctNum === 0 ? "0%" : `${pctNum}%`;
  return cell(text, {
    fill: { fgColor: { rgb: fill } },
    font: { sz: 9, bold: pctNum > 0, color: { rgb: fgRgb } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top:    { style: "thin", color: { rgb: "E0E0E0" } },
      bottom: { style: "thin", color: { rgb: "E0E0E0" } },
      left:   { style: "thin", color: { rgb: "E0E0E0" } },
      right:  { style: "thin", color: { rgb: "E0E0E0" } },
    },
  });
}

function emptyCell() {
  return cell("", { fill: { fgColor: { rgb: WHITE } } });
}

// ── Sheet 1: Raw Data ─────────────────────────────────────────────────────────
function buildRawSheet(rawData, year) {
  const ws = {};
  const headers = ["COMPANY", "GRADE", "NAME", "JOB TITLE", "HIRE DATE", "TERMINATION DATE", "REASON FOR LEAVING"];
  const colWidths = [20, 8, 30, 30, 12, 16, 22];

  // Title row
  ws["A1"] = headerCell(`TURNOVER ${year} — RAW DATA`, BLUE_HEADER, WHITE);
  for (let c = 1; c < headers.length; c++) {
    ws[String.fromCharCode(65 + c) + "1"] = headerCell("", BLUE_HEADER, WHITE);
  }

  // Header row
  headers.forEach((h, c) => {
    ws[String.fromCharCode(65 + c) + "2"] = headerCell(h, "38587d", WHITE);
  });

  // Data rows
  rawData.forEach((row, r) => {
    const rIdx = r + 3;
    const bgFill = r % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${rIdx}`] = dataCell(row.company,          "left",  false, bgFill);
    ws[`B${rIdx}`] = dataCell(row.grade,             "center",false, bgFill);
    ws[`C${rIdx}`] = dataCell(row.name,              "left",  false, bgFill);
    ws[`D${rIdx}`] = dataCell(row.job_title,         "left",  false, bgFill);
    ws[`E${rIdx}`] = dataCell(row.hire_date,         "center",false, bgFill);
    ws[`F${rIdx}`] = dataCell(row.termination_date,  "center",false, bgFill);
    ws[`G${rIdx}`] = dataCell(row.exit_type_label,   "left",  false, bgFill);
  });

  const maxRow = rawData.length + 2;
  ws["!ref"] = `A1:G${maxRow}`;
  ws["!cols"] = colWidths.map(w => ({ wch: w }));
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
  return ws;
}

// ── Sheet 2: By Companies ─────────────────────────────────────────────────────
function buildByCompanySheet(byCompany, totalLeavers, year) {
  const ws = {};
  let r = 0;

  // Title block (merged)
  const titleText = `TOTAL TURNOVER ${year}\nBY COMPANIES`;
  ws[`A${r + 1}`] = headerCell(titleText, BLUE_HEADER, WHITE);
  ws[`B${r + 1}`] = headerCell("", BLUE_HEADER, WHITE);
  ws[`C${r + 1}`] = headerCell("", BLUE_HEADER, WHITE);
  EXIT_TYPES.forEach((_, i) => {
    const col1 = String.fromCharCode(68 + i * 2);
    const col2 = String.fromCharCode(69 + i * 2);
    ws[`${col1}${r + 1}`] = headerCell("", BLUE_HEADER, WHITE);
    ws[`${col2}${r + 1}`] = headerCell("", BLUE_HEADER, WHITE);
  });
  r++;

  // Exit type header spanning 2 cols each
  EXIT_TYPES.forEach((et, i) => {
    const col = String.fromCharCode(68 + i * 2);
    ws[`${col}${r + 1}`] = headerCell(et.label, "4e7db5", WHITE);
    ws[`${String.fromCharCode(69 + i * 2)}${r + 1}`] = headerCell("", "4e7db5", WHITE);
  });

  r++;
  // Column headers
  ws[`A${r + 1}`] = headerCell("COMPANIES", "38587d", WHITE);
  ws[`B${r + 1}`] = headerCell("#",         "38587d", WHITE);
  ws[`C${r + 1}`] = headerCell("%",         "38587d", WHITE);
  EXIT_TYPES.forEach((_, i) => {
    ws[`${String.fromCharCode(68 + i * 2)}${r + 1}`]     = headerCell("#", "38587d", WHITE);
    ws[`${String.fromCharCode(69 + i * 2)}${r + 1}`] = headerCell("%", "38587d", WHITE);
  });
  r++;

  // Data
  byCompany.forEach((co, idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r + 1}`] = dataCell(co.name, "left", false, bg);
    ws[`B${r + 1}`] = dataCell(co.total, "center", true, bg);
    ws[`C${r + 1}`] = pctCell(co.total_pct);
    EXIT_TYPES.forEach((et, i) => {
      const count = co[et.code] || 0;
      const pct   = co[`${et.code}_pct`] || 0;
      ws[`${String.fromCharCode(68 + i * 2)}${r + 1}`]     = dataCell(count, "center", false, bg);
      ws[`${String.fromCharCode(69 + i * 2)}${r + 1}`] = pctCell(pct);
    });
    r++;
  });

  // Total row
  ws[`A${r + 1}`] = emptyCell();
  ws[`B${r + 1}`] = dataCell(totalLeavers, "center", true);
  ws[`C${r + 1}`] = emptyCell();
  EXIT_TYPES.forEach((_, i) => {
    ws[`${String.fromCharCode(68 + i * 2)}${r + 1}`] = emptyCell();
    ws[`${String.fromCharCode(69 + i * 2)}${r + 1}`] = emptyCell();
  });

  const lastCol = String.fromCharCode(68 + EXIT_TYPES.length * 2 - 1);
  ws["!ref"] = `A1:${lastCol}${r + 1}`;
  ws["!cols"] = [
    { wch: 22 }, { wch: 6 }, { wch: 6 },
    ...EXIT_TYPES.flatMap(() => [{ wch: 6 }, { wch: 7 }]),
  ];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    ...EXIT_TYPES.map((_, i) => ({
      s: { r: 0, c: 3 + i * 2 }, e: { r: 0, c: 4 + i * 2 },
    })),
    ...EXIT_TYPES.map((_, i) => ({
      s: { r: 1, c: 3 + i * 2 }, e: { r: 1, c: 4 + i * 2 },
    })),
  ];
  return ws;
}

// ── Sheet 3: By Grade/Hierarchy ───────────────────────────────────────────────
function buildByGradeSheet(byGrade, totalLeavers, year) {
  const ws = {};
  let r = 0;

  // Title
  ws[`A${r + 1}`] = headerCell(`TOTAL TURNOVER ${year}\nBY HIERARCHY`, BLUE_HEADER, WHITE);
  ["B","C","D","E","F","G"].forEach(c => {
    ws[`${c}${r + 1}`] = headerCell("", BLUE_HEADER, WHITE);
  });
  r++;

  // Exit type headers
  ws[`A${r + 1}`] = headerCell("GRADES",               "38587d", WHITE);
  ws[`B${r + 1}`] = headerCell("#",                    "38587d", WHITE);
  ws[`C${r + 1}`] = headerCell("%",                    "38587d", WHITE);
  EXIT_TYPES.forEach((et, i) => {
    ws[`${String.fromCharCode(68 + i)}${r + 1}`] = headerCell(et.label, "4e7db5", WHITE);
  });
  r++;

  byGrade.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r + 1}`] = dataCell(row.grade,      "left",   true,  bg);
    ws[`B${r + 1}`] = dataCell(row.total,      "center", false, bg);
    ws[`C${r + 1}`] = pctCell(row.total_pct);
    EXIT_TYPES.forEach((et, i) => {
      const v = row[et.code] || 0;
      ws[`${String.fromCharCode(68 + i)}${r + 1}`] = v > 0
        ? dataCell(v, "center", false, bg)
        : dataCell("",  "center", false, bg);
    });
    r++;
  });

  // Total
  ws[`A${r + 1}`] = emptyCell();
  ws[`B${r + 1}`] = dataCell(totalLeavers, "center", true);
  ["C","D","E","F","G"].forEach(c => { ws[`${c}${r + 1}`] = emptyCell(); });

  ws["!ref"] = `A1:G${r + 1}`;
  ws["!cols"] = [{ wch: 10 }, { wch: 6 }, { wch: 6 }, ...EXIT_TYPES.map(() => ({ wch: 20 }))];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
  return ws;
}

// ── Sheet 4: By Reason ────────────────────────────────────────────────────────
function buildByReasonSheet(byReason, totalLeavers, year) {
  const ws = {};
  let r = 0;

  ws[`A${r + 1}`] = headerCell(`TOTAL TURNOVER ${year}\nBY REASON OF DEPARTURE`, BLUE_HEADER, WHITE);
  ws[`B${r + 1}`] = headerCell("", BLUE_HEADER, WHITE);
  ws[`C${r + 1}`] = headerCell("", BLUE_HEADER, WHITE);
  r++;

  ws[`A${r + 1}`] = headerCell("REASON",         "38587d", WHITE);
  ws[`B${r + 1}`] = headerCell("#",              "38587d", WHITE);
  ws[`C${r + 1}`] = headerCell("%",              "38587d", WHITE);
  r++;

  byReason.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r + 1}`] = dataCell(row.label,           "left",   false, bg);
    ws[`B${r + 1}`] = dataCell(row.count,           "center", true,  bg);
    ws[`C${r + 1}`] = pctCell(row.pct);
    r++;
  });

  // Total
  ws[`A${r + 1}`] = emptyCell();
  ws[`B${r + 1}`] = dataCell(totalLeavers, "center", true);
  ws[`C${r + 1}`] = emptyCell();

  ws["!ref"] = `A1:C${r + 1}`;
  ws["!cols"] = [{ wch: 28 }, { wch: 8 }, { wch: 8 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
  return ws;
}

// ── Demographic helpers (mirrors reports/page.jsx) ────────────────────────────
function getAge(dob) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}
function getGeneration(age) {
  if (age === null) return "Unknown";
  if (age >= 60) return "Baby Boomers (60+)";
  if (age >= 44) return "Gen X (44–59)";
  if (age >= 28) return "Millennials (28–43)";
  if (age >= 18) return "Gen Z (18–27)";
  return "Gen Alpha (<18)";
}
function getTenureBand(startDate) {
  if (!startDate) return "Unknown";
  const y = (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (y < 1) return "0–1 year";
  if (y < 3) return "1–3 years";
  if (y < 5) return "3–5 years";
  return "5+ years";
}
function demoPct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

// ── Sheet 5: Age Demographics ─────────────────────────────────────────────────
function buildAgeDemoSheet(employees) {
  const ws = {};
  const total = employees.length;

  const GEN_ORDER = ["Baby Boomers (60+)", "Gen X (44–59)", "Millennials (28–43)", "Gen Z (18–27)", "Gen Alpha (<18)", "Unknown"];
  const genMap = {};
  GEN_ORDER.forEach(g => { genMap[g] = 0; });
  employees.forEach(e => {
    const g = getGeneration(getAge(e.date_of_birth));
    genMap[g] = (genMap[g] || 0) + 1;
  });

  const retirementRisk = employees.filter(e => { const a = getAge(e.date_of_birth); return a !== null && a >= 57; }).length;

  let r = 0;
  ws[`A${r+1}`] = headerCell("AGE DEMOGRAPHICS", BLUE_HEADER, WHITE);
  ws[`B${r+1}`] = headerCell("", BLUE_HEADER, WHITE);
  ws[`C${r+1}`] = headerCell("", BLUE_HEADER, WHITE);
  r++;

  ws[`A${r+1}`] = headerCell("GENERATION", "38587d", WHITE);
  ws[`B${r+1}`] = headerCell("COUNT",      "38587d", WHITE);
  ws[`C${r+1}`] = headerCell("%",          "38587d", WHITE);
  r++;

  GEN_ORDER.filter(g => genMap[g] > 0).forEach((gen, idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r+1}`] = dataCell(gen,                    "left",   false, bg);
    ws[`B${r+1}`] = dataCell(genMap[gen],             "center", true,  bg);
    ws[`C${r+1}`] = dataCell(`${demoPct(genMap[gen], total)}%`, "center", false, bg);
    r++;
  });

  r++;
  ws[`A${r+1}`] = headerCell("RETIREMENT RISK (age 57+)", "D85A30", WHITE);
  ws[`B${r+1}`] = dataCell(retirementRisk,                 "center", true);
  ws[`C${r+1}`] = dataCell(`${demoPct(retirementRisk, total)}%`, "center", false, retirementRisk > 0 ? RED_HIGH : WHITE);

  ws["!ref"] = `A1:C${r+1}`;
  ws["!cols"] = [{ wch: 22 }, { wch: 8 }, { wch: 8 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
  return ws;
}

// ── Sheet 6: Gender Demographics ─────────────────────────────────────────────
function buildGenderDemoSheet(employees) {
  const ws = {};
  const total = employees.length;

  const maleTotal   = employees.filter(e => e.gender === "M").length;
  const femaleTotal = employees.filter(e => e.gender === "F").length;
  const unknownTotal = total - maleTotal - femaleTotal;

  const levelMap = {};
  employees.forEach(e => {
    const lvl = e.position_group_name || "Other";
    if (!levelMap[lvl]) levelMap[lvl] = { Male: 0, Female: 0, Unknown: 0 };
    if (e.gender === "M") levelMap[lvl].Male++;
    else if (e.gender === "F") levelMap[lvl].Female++;
    else levelMap[lvl].Unknown++;
  });

  let r = 0;
  ws[`A${r+1}`] = headerCell("GENDER DEMOGRAPHICS", BLUE_HEADER, WHITE);
  ws[`B${r+1}`] = headerCell("", BLUE_HEADER, WHITE);
  ws[`C${r+1}`] = headerCell("", BLUE_HEADER, WHITE);
  ws[`D${r+1}`] = headerCell("", BLUE_HEADER, WHITE);
  r++;

  // Overall section
  ws[`A${r+1}`] = headerCell("OVERALL GENDER RATIO", "38587d", WHITE);
  ws[`B${r+1}`] = headerCell("COUNT", "38587d", WHITE);
  ws[`C${r+1}`] = headerCell("%",     "38587d", WHITE);
  ws[`D${r+1}`] = headerCell("",      "38587d", WHITE);
  r++;

  [["Male", maleTotal], ["Female", femaleTotal], ["Unknown", unknownTotal]].forEach(([label, count], idx) => {
    if (count === 0) return;
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r+1}`] = dataCell(label,                         "left",   false, bg);
    ws[`B${r+1}`] = dataCell(count,                         "center", true,  bg);
    ws[`C${r+1}`] = dataCell(`${demoPct(count, total)}%`,   "center", false, bg);
    ws[`D${r+1}`] = emptyCell();
    r++;
  });

  r++;
  // By level section
  ws[`A${r+1}`] = headerCell("GENDER BY POSITION GROUP", "4e7db5", WHITE);
  ws[`B${r+1}`] = headerCell("Male",   "4e7db5", WHITE);
  ws[`C${r+1}`] = headerCell("Female", "4e7db5", WHITE);
  ws[`D${r+1}`] = headerCell("Total",  "4e7db5", WHITE);
  r++;

  Object.entries(levelMap).forEach(([lvl, v], idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    const lvlTotal = v.Male + v.Female + v.Unknown;
    ws[`A${r+1}`] = dataCell(lvl,       "left",   false, bg);
    ws[`B${r+1}`] = dataCell(v.Male,    "center", false, bg);
    ws[`C${r+1}`] = dataCell(v.Female,  "center", false, bg);
    ws[`D${r+1}`] = dataCell(lvlTotal,  "center", true,  bg);
    r++;
  });

  ws["!ref"] = `A1:D${r+1}`;
  ws["!cols"] = [{ wch: 24 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
  return ws;
}

// ── Sheet 7: Tenure Distribution ──────────────────────────────────────────────
function buildTenureSheet(employees) {
  const ws = {};
  const total = employees.length;

  const TENURE_ORDER = ["0–1 year", "1–3 years", "3–5 years", "5+ years", "Unknown"];
  const tenureMap = {};
  TENURE_ORDER.forEach(t => { tenureMap[t] = 0; });
  employees.forEach(e => {
    const b = getTenureBand(e.start_date);
    tenureMap[b] = (tenureMap[b] || 0) + 1;
  });

  const tenureYears = employees
    .map(e => e.start_date ? (Date.now() - new Date(e.start_date)) / (1000*60*60*24*365.25) : null)
    .filter(Boolean);
  const avgTenure = tenureYears.length
    ? (tenureYears.reduce((a, b) => a + b, 0) / tenureYears.length).toFixed(1)
    : "—";

  let r = 0;
  ws[`A${r+1}`] = headerCell("TENURE (SERVICE LENGTH)", BLUE_HEADER, WHITE);
  ws[`B${r+1}`] = headerCell("", BLUE_HEADER, WHITE);
  ws[`C${r+1}`] = headerCell("", BLUE_HEADER, WHITE);
  r++;

  ws[`A${r+1}`] = headerCell("TENURE BAND", "38587d", WHITE);
  ws[`B${r+1}`] = headerCell("COUNT",       "38587d", WHITE);
  ws[`C${r+1}`] = headerCell("%",           "38587d", WHITE);
  r++;

  TENURE_ORDER.filter(t => tenureMap[t] > 0).forEach((band, idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r+1}`] = dataCell(band,                           "left",   false, bg);
    ws[`B${r+1}`] = dataCell(tenureMap[band],                "center", true,  bg);
    ws[`C${r+1}`] = dataCell(`${demoPct(tenureMap[band], total)}%`, "center", false, bg);
    r++;
  });

  r++;
  ws[`A${r+1}`] = headerCell("AVERAGE TENURE (years)", "1D9E75", WHITE);
  ws[`B${r+1}`] = dataCell(avgTenure, "center", true);
  ws[`C${r+1}`] = emptyCell();

  ws["!ref"] = `A1:C${r+1}`;
  ws["!cols"] = [{ wch: 20 }, { wch: 8 }, { wch: 8 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
  return ws;
}

// ── Main export function ──────────────────────────────────────────────────────
export function exportTurnoverReport(turnoverData, year, employees = []) {
  const wb = XLSXStyle.utils.book_new();

  // Sheet 1: Raw Data
  const ws1 = buildRawSheet(turnoverData.raw_data || [], year);
  XLSXStyle.utils.book_append_sheet(wb, ws1, "Raw Data");

  // Sheet 2: By Companies
  const ws2 = buildByCompanySheet(turnoverData.by_company || [], turnoverData.total_leavers || 0, year);
  XLSXStyle.utils.book_append_sheet(wb, ws2, "By Company");

  // Sheet 3: By Hierarchy
  const ws3 = buildByGradeSheet(turnoverData.by_grade || [], turnoverData.total_leavers || 0, year);
  XLSXStyle.utils.book_append_sheet(wb, ws3, "By Hierarchy");

  // Sheet 4: By Reason
  const ws4 = buildByReasonSheet(turnoverData.by_reason || [], turnoverData.total_leavers || 0, year);
  XLSXStyle.utils.book_append_sheet(wb, ws4, "By Reason");

  // Demographic sheets (active employees only)
  const active = employees.filter(e => !e.is_deleted);
  if (active.length > 0) {
    const ws5 = buildAgeDemoSheet(active);
    XLSXStyle.utils.book_append_sheet(wb, ws5, "Age Demographics");

    const ws6 = buildGenderDemoSheet(active);
    XLSXStyle.utils.book_append_sheet(wb, ws6, "Gender Demographics");

    const ws7 = buildTenureSheet(active);
    XLSXStyle.utils.book_append_sheet(wb, ws7, "Tenure Distribution");
  }

  XLSXStyle.writeFile(wb, `Almet_HR_Report_${year}.xlsx`);
}
