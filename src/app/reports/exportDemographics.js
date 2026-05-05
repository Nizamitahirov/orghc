/**
 * exportDemographics.js
 * Per-section Excel exports for Age, Gender, and Tenure demographics.
 * Uses xlsx-js-style (already in package.json).
 */
import XLSXStyle from "xlsx-js-style";

// ── Colours ────────────────────────────────────────────────────────────────────
const BLUE_HEADER = "253360";
const WHITE       = "FFFFFF";
const LIGHT_GRAY  = "F5F5F5";

// ── Helpers ────────────────────────────────────────────────────────────────────
function cell(v, style = {}) {
  return { v, t: typeof v === "number" ? "n" : "s", s: style };
}
function hdr(v, bg = BLUE_HEADER) {
  return cell(v, {
    fill: { fgColor: { rgb: bg } },
    font: { bold: true, color: { rgb: WHITE }, sz: 9 },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top:    { style: "thin", color: { rgb: "CCCCCC" } },
      bottom: { style: "thin", color: { rgb: "CCCCCC" } },
      left:   { style: "thin", color: { rgb: "CCCCCC" } },
      right:  { style: "thin", color: { rgb: "CCCCCC" } },
    },
  });
}
function dat(v, align = "left", bold = false, bg = WHITE) {
  return cell(v, {
    fill: { fgColor: { rgb: bg } },
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
function emp(bg = WHITE) {
  return cell("", { fill: { fgColor: { rgb: bg } } });
}

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
function demoPct(n, d) { return d ? `${Math.round((n / d) * 100)}%` : "0%"; }

// ── Employee list sheet (appended to every export) ────────────────────────────
function buildEmployeeListSheet(employees, title) {
  const ws = {};
  let r = 0;

  // Title
  ["A","B","C","D","E","F"].forEach(c => { ws[`${c}${r+1}`] = hdr(c === "A" ? title.toUpperCase() : ""); });
  r++;

  // Column headers
  ws[`A${r+1}`] = hdr("NAME",             "38587d");
  ws[`B${r+1}`] = hdr("JOB TITLE",        "38587d");
  ws[`C${r+1}`] = hdr("DEPARTMENT",       "38587d");
  ws[`D${r+1}`] = hdr("BUSINESS FUNCTION","38587d");
  ws[`E${r+1}`] = hdr("GENDER",           "38587d");
  ws[`F${r+1}`] = hdr("START DATE",       "38587d");
  r++;

  employees.forEach((e, idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r+1}`] = dat(e.full_name || e.name || "",            "left",   false, bg);
    ws[`B${r+1}`] = dat(e.job_title || "",                       "left",   false, bg);
    ws[`C${r+1}`] = dat(e.department_name || "",                 "left",   false, bg);
    ws[`D${r+1}`] = dat(e.business_function_name || "",          "left",   false, bg);
    ws[`E${r+1}`] = dat(e.gender === "M" ? "Male" : e.gender === "F" ? "Female" : "Unknown", "center", false, bg);
    ws[`F${r+1}`] = dat(e.start_date || "",                      "center", false, bg);
    r++;
  });

  ws["!ref"]  = `A1:F${r+1}`;
  ws["!cols"] = [{ wch: 30 }, { wch: 28 }, { wch: 22 }, { wch: 22 }, { wch: 10 }, { wch: 12 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
  return ws;
}

// ── Age Demographics sheet ────────────────────────────────────────────────────
function buildAgeSheet(employees) {
  const ws = {};
  const total = employees.length;
  const GEN_ORDER = ["Baby Boomers (60+)","Gen X (44–59)","Millennials (28–43)","Gen Z (18–27)","Gen Alpha (<18)","Unknown"];
  const genMap = {};
  GEN_ORDER.forEach(g => { genMap[g] = 0; });
  employees.forEach(e => {
    const g = getGeneration(getAge(e.date_of_birth));
    genMap[g] = (genMap[g] || 0) + 1;
  });

  const ageBuckets = { "< 25": 0, "25–34": 0, "35–44": 0, "45–54": 0, "55–64": 0, "65+": 0 };
  employees.forEach(e => {
    const a = getAge(e.date_of_birth);
    if (a === null) return;
    if (a < 25) ageBuckets["< 25"]++;
    else if (a < 35) ageBuckets["25–34"]++;
    else if (a < 45) ageBuckets["35–44"]++;
    else if (a < 55) ageBuckets["45–54"]++;
    else if (a < 65) ageBuckets["55–64"]++;
    else ageBuckets["65+"]++;
  });

  const retirementRisk = employees.filter(e => { const a = getAge(e.date_of_birth); return a !== null && a >= 57; }).length;
  const unknown = employees.filter(e => !e.date_of_birth).length;

  let r = 0;
  ["A","B","C"].forEach(c => { ws[`${c}${r+1}`] = hdr(c === "A" ? "AGE DEMOGRAPHICS" : ""); });
  r++;

  ws[`A${r+1}`] = hdr("GENERATION", "38587d");
  ws[`B${r+1}`] = hdr("COUNT",      "38587d");
  ws[`C${r+1}`] = hdr("%",          "38587d");
  r++;

  GEN_ORDER.forEach((gen, idx) => {
    if (!genMap[gen]) return;
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r+1}`] = dat(gen,                    "left",   false, bg);
    ws[`B${r+1}`] = dat(genMap[gen],             "center", true,  bg);
    ws[`C${r+1}`] = dat(demoPct(genMap[gen], total), "center", false, bg);
    r++;
  });

  r++;
  ws[`A${r+1}`] = hdr("AGE GROUP", "38587d");
  ws[`B${r+1}`] = hdr("COUNT",     "38587d");
  ws[`C${r+1}`] = hdr("%",         "38587d");
  r++;

  Object.entries(ageBuckets).forEach(([band, count], idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r+1}`] = dat(band,                    "left",   false, bg);
    ws[`B${r+1}`] = dat(count,                   "center", true,  bg);
    ws[`C${r+1}`] = dat(demoPct(count, total),   "center", false, bg);
    r++;
  });

  r++;
  ws[`A${r+1}`] = hdr("RETIREMENT RISK (age 57+)", "D85A30");
  ws[`B${r+1}`] = dat(retirementRisk, "center", true, retirementRisk > 0 ? "FFC7CE" : WHITE);
  ws[`C${r+1}`] = dat(demoPct(retirementRisk, total), "center", false, retirementRisk > 0 ? "FFC7CE" : WHITE);

  r++;
  ws[`A${r+1}`] = hdr("NO DATE OF BIRTH (Unknown)", "7a829a");
  ws[`B${r+1}`] = dat(unknown, "center", true);
  ws[`C${r+1}`] = dat(demoPct(unknown, total), "center", false);

  ws["!ref"]    = `A1:C${r+1}`;
  ws["!cols"]   = [{ wch: 24 }, { wch: 8 }, { wch: 8 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
  return ws;
}

// ── Gender Demographics sheet ─────────────────────────────────────────────────
function buildGenderSheet(employees) {
  const ws = {};
  const total = employees.length;
  const male   = employees.filter(e => e.gender === "M").length;
  const female = employees.filter(e => e.gender === "F").length;
  const unknown = total - male - female;

  const levelMap = {};
  employees.forEach(e => {
    const lvl = e.position_group_name || "Other";
    if (!levelMap[lvl]) levelMap[lvl] = { Male: 0, Female: 0, Unknown: 0 };
    if (e.gender === "M") levelMap[lvl].Male++;
    else if (e.gender === "F") levelMap[lvl].Female++;
    else levelMap[lvl].Unknown++;
  });

  const bfMap = {};
  employees.forEach(e => {
    const bf = e.business_function_name || "Unknown";
    if (!bfMap[bf]) bfMap[bf] = { Male: 0, Female: 0, Unknown: 0 };
    if (e.gender === "M") bfMap[bf].Male++;
    else if (e.gender === "F") bfMap[bf].Female++;
    else bfMap[bf].Unknown++;
  });

  let r = 0;
  ["A","B","C","D"].forEach(c => { ws[`${c}${r+1}`] = hdr(c === "A" ? "GENDER DEMOGRAPHICS" : ""); });
  r++;

  ws[`A${r+1}`] = hdr("OVERALL",  "38587d");
  ws[`B${r+1}`] = hdr("COUNT",    "38587d");
  ws[`C${r+1}`] = hdr("%",        "38587d");
  ws[`D${r+1}`] = emp();
  r++;

  [["MALE", male, WHITE], ["FEMALE", female, LIGHT_GRAY], ["UNKNOWN", unknown, WHITE]].forEach(([label, count, bg]) => {
    if (!count) return;
    ws[`A${r+1}`] = dat(label, "left", false, bg);
    ws[`B${r+1}`] = dat(count, "center", true, bg);
    ws[`C${r+1}`] = dat(demoPct(count, total), "center", false, bg);
    ws[`D${r+1}`] = emp(bg);
    r++;
  });

  r++;
  ws[`A${r+1}`] = hdr("POSITION GROUP", "4e7db5");
  ws[`B${r+1}`] = hdr("MALE",           "4e7db5");
  ws[`C${r+1}`] = hdr("FEMALE",         "4e7db5");
  ws[`D${r+1}`] = hdr("UNKNOWN",        "4e7db5");
  r++;

  Object.entries(levelMap).forEach(([lvl, v], idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r+1}`] = dat(lvl,      "left",   false, bg);
    ws[`B${r+1}`] = dat(v.Male,   "center", false, bg);
    ws[`C${r+1}`] = dat(v.Female, "center", false, bg);
    ws[`D${r+1}`] = dat(v.Unknown,"center", false, bg);
    r++;
  });

  r++;
  ws[`A${r+1}`] = hdr("BUSINESS FUNCTION", "336fa5");
  ws[`B${r+1}`] = hdr("MALE",              "336fa5");
  ws[`C${r+1}`] = hdr("FEMALE",            "336fa5");
  ws[`D${r+1}`] = hdr("UNKNOWN",           "336fa5");
  r++;

  Object.entries(bfMap).sort((a,b) => (b[1].Male+b[1].Female)-(a[1].Male+a[1].Female)).forEach(([bf, v], idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r+1}`] = dat(bf,       "left",   false, bg);
    ws[`B${r+1}`] = dat(v.Male,   "center", false, bg);
    ws[`C${r+1}`] = dat(v.Female, "center", false, bg);
    ws[`D${r+1}`] = dat(v.Unknown,"center", false, bg);
    r++;
  });

  ws["!ref"]    = `A1:D${r+1}`;
  ws["!cols"]   = [{ wch: 26 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
  return ws;
}

// ── Tenure sheet ──────────────────────────────────────────────────────────────
function buildTenureSheet(employees) {
  const ws = {};
  const total = employees.length;
  const TENURE_ORDER = ["0–1 year","1–3 years","3–5 years","5+ years","Unknown"];
  const tenureMap = {};
  TENURE_ORDER.forEach(t => { tenureMap[t] = 0; });
  employees.forEach(e => { tenureMap[getTenureBand(e.start_date)]++; });

  const tenureYears = employees
    .map(e => e.start_date ? (Date.now() - new Date(e.start_date)) / (1000*60*60*24*365.25) : null)
    .filter(Boolean);
  const avgTenure = tenureYears.length
    ? (tenureYears.reduce((a, b) => a + b, 0) / tenureYears.length).toFixed(1)
    : "—";

  let r = 0;
  ["A","B","C"].forEach(c => { ws[`${c}${r+1}`] = hdr(c === "A" ? "TENURE (SERVICE LENGTH)" : ""); });
  r++;

  ws[`A${r+1}`] = hdr("TENURE BAND", "38587d");
  ws[`B${r+1}`] = hdr("COUNT",       "38587d");
  ws[`C${r+1}`] = hdr("%",           "38587d");
  r++;

  TENURE_ORDER.forEach((band, idx) => {
    if (!tenureMap[band]) return;
    const bg = idx % 2 === 0 ? WHITE : LIGHT_GRAY;
    ws[`A${r+1}`] = dat(band,                        "left",   false, bg);
    ws[`B${r+1}`] = dat(tenureMap[band],              "center", true,  bg);
    ws[`C${r+1}`] = dat(demoPct(tenureMap[band], total), "center", false, bg);
    r++;
  });

  r++;
  ws[`A${r+1}`] = hdr("AVERAGE TENURE (years)", "1D9E75");
  ws[`B${r+1}`] = dat(avgTenure, "center", true);
  ws[`C${r+1}`] = emp();

  ws["!ref"]    = `A1:C${r+1}`;
  ws["!cols"]   = [{ wch: 20 }, { wch: 8 }, { wch: 8 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
  return ws;
}

// ── Public export functions ───────────────────────────────────────────────────
export function exportAgeSection(employees) {
  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, buildAgeSheet(employees), "Age Summary");
  XLSXStyle.utils.book_append_sheet(wb, buildEmployeeListSheet(
    employees.filter(e => getAge(e.date_of_birth) !== null && getAge(e.date_of_birth) >= 57),
    "Retirement Risk Employees (57+)"
  ), "Retirement Risk");
  XLSXStyle.utils.book_append_sheet(wb, buildEmployeeListSheet(employees, "All Active Employees"), "All Employees");
  XLSXStyle.writeFile(wb, `Almet_Age_Demographics_${new Date().getFullYear()}.xlsx`);
}

export function exportGenderSection(employees) {
  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, buildGenderSheet(employees), "Gender Summary");
  XLSXStyle.utils.book_append_sheet(wb, buildEmployeeListSheet(
    employees.filter(e => e.gender !== "M" && e.gender !== "F"),
    "Employees with Unknown Gender"
  ), "Unknown Gender");
  XLSXStyle.utils.book_append_sheet(wb, buildEmployeeListSheet(employees, "All Active Employees"), "All Employees");
  XLSXStyle.writeFile(wb, `Almet_Gender_Demographics_${new Date().getFullYear()}.xlsx`);
}

export function exportTenureSection(employees) {
  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, buildTenureSheet(employees), "Tenure Summary");
  XLSXStyle.utils.book_append_sheet(wb, buildEmployeeListSheet(
    employees.filter(e => !e.start_date),
    "Employees with Unknown Start Date"
  ), "Unknown Start Date");
  XLSXStyle.utils.book_append_sheet(wb, buildEmployeeListSheet(employees, "All Active Employees"), "All Employees");
  XLSXStyle.writeFile(wb, `Almet_Tenure_Distribution_${new Date().getFullYear()}.xlsx`);
}
