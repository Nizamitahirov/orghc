// components/performance/PerformanceAnalyticsDashboard.jsx
// Requires: npm install xlsx

import { useState, useEffect, useMemo } from 'react';
import XLSX from 'xlsx-js-style';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Award, Users, Target, BarChart3, Loader,
  User, AlertCircle, Info, Download, Star,
  Building2, Briefcase, Trophy, AlertTriangle, Layers,
  ChevronDown, Filter, X, HelpCircle
} from 'lucide-react';
import SearchableDropdown from '@/components/common/SearchableDropdown';

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  primary:   '#6b9fd4',   // soft cornflower mavi
  secondary: '#9b8fd6',   // lavender-purple, yüngül
  success:   '#6dbfa0',   // sage-mint, sakit yaşıl
  warning:   '#e8b86d',   // warm honey, yüngül sarı
  danger:    '#e08a8a',   // dusty rose-red, mülayim
  info:      '#6ab8c8',   // soft teal-sky
  neutral:   '#9daab6',   // cool grey-blue
  grades: {
    'E++': '#6dbfa0',     // soft emerald (success ilə uyğun)
    'E+':  '#85cfb8',     // light mint
    'E':   '#6b9fd4',     // soft blue (primary ilə uyğun)
    'E-':  '#e8b86d',     // soft amber (warning ilə uyğun)
    'E--': '#e08a8a',     // soft red (danger ilə uyğun)
  },
};

const GRADE_ORDER = ['E++', 'E+', 'E', 'E-', 'E--'];
const GRADE_LABELS = {
  'E++': 'Outstanding (E++)',
  'E+':  'Good (E+)',
  'E':   'Average (E)',
  'E-':  'Below Average (E-)',
  'E--': 'Poor (E--)',
};

const gc  = (g) => C.grades[g] || C.neutral;
const pct = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : Math.round(n * 10) / 10; };

// Tailwind utility funksiyaları — soft tonlara uyğunlaşdırılıb
const scoreColor = (v) =>
  v >= 90 ? 'text-teal-600'   :   // əvvəl emerald-600
  v >= 70 ? 'text-blue-500'   :   // əvvəl almet-sapphire
  v >= 50 ? 'text-amber-500'  :   // əvvəl amber-600
            'text-rose-400';       // əvvəl red-600 → daha soft rose

const scoreBg = (v) =>
  v >= 90 ? 'bg-teal-50 border-teal-200'   :
  v >= 70 ? 'bg-blue-50 border-blue-200'   :
  v >= 50 ? 'bg-amber-50 border-amber-200' :
            'bg-rose-50 border-rose-200';
// ─── Excel export (structured, multi-sheet) ────────────────────────────────
const applyHeaderStyle = (ws, range) => {
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: range.s.r, c });
    if (!ws[addr]) continue;
    ws[addr].s = {
      fill: { fgColor: { rgb: '1E3A5F' } },
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top:    { style: 'thin', color: { rgb: '95B3D7' } },
        bottom: { style: 'thin', color: { rgb: '95B3D7' } },
        left:   { style: 'thin', color: { rgb: '95B3D7' } },
        right:  { style: 'thin', color: { rgb: '95B3D7' } },
      },
    };
  }
};

const applyDataStyles = (ws, range) => {
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const fill = r % 2 === 0
      ? { fgColor: { rgb: 'DEEAF1' } }
      : { fgColor: { rgb: 'FFFFFF' } };
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: 'z' };
      ws[addr].s = {
        fill,
        font: { sz: 10 },
        alignment: { vertical: 'center', wrapText: false },
        border: {
          top:    { style: 'thin', color: { rgb: 'BDD7EE' } },
          bottom: { style: 'thin', color: { rgb: 'BDD7EE' } },
          left:   { style: 'thin', color: { rgb: 'BDD7EE' } },
          right:  { style: 'thin', color: { rgb: 'BDD7EE' } },
        },
      };
    }
  }
};

const autoColWidths = (ws, headers) => {
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 14) }));
};

const makeSheet = (headers, rows) => {
  // Build array-of-arrays so we control exact header text
  const aoa = [headers, ...rows.map(r => headers.map((_, i) => r[i] ?? ''))];
  const ws  = XLSX.utils.aoa_to_sheet(aoa);
  const range = XLSX.utils.decode_range(ws['!ref']);
  applyHeaderStyle(ws, range);
  applyDataStyles(ws, range);
  autoColWidths(ws, headers);
  ws['!sheetView'] = [{ freezeRows: 1 }];
  return ws;
};


const exportPerformanceExcel = ({
  withPerf, bfStats, unitStats, posStats, topList, botList, gradeDist, kpis, selectedYear
}) => {
  try {
    const wb = XLSX.utils.book_new();

    // ── Shared border ────────────────────────────────────────────────────
    const border = {
      top:    { style: 'thin', color: { rgb: 'BDD7EE' } },
      bottom: { style: 'thin', color: { rgb: 'BDD7EE' } },
      left:   { style: 'thin', color: { rgb: 'BDD7EE' } },
      right:  { style: 'thin', color: { rgb: 'BDD7EE' } },
    };

    // ── Cell style factories ──────────────────────────────────────────────
    const headerStyle = {
      font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 11, name: 'Calibri' },
      fill:      { fgColor: { rgb: '2E5FA3' } },   // medium-blue (matches screenshot)
      alignment: { horizontal: 'left', vertical: 'center', wrapText: false },
      border,
    };

    const dataStyle = (rowIdx, alignRight = false) => ({
      font:      { sz: 10, name: 'Calibri' },
      fill:      { fgColor: { rgb: rowIdx % 2 === 0 ? 'FFFFFF' : 'DCE6F1' } },
      alignment: { horizontal: alignRight ? 'right' : 'left', vertical: 'center' },
      border,
    });

    // ── sc: set cell ─────────────────────────────────────────────────────
    const sc = (ws, addr, v, s) => {
      ws[addr] = { v, t: typeof v === 'number' ? 'n' : 's', s };
    };

    // ── makeTableSheet ────────────────────────────────────────────────────
    // headers: string[]
    // rows: any[][]
    // rightCols: indices of numeric/right-aligned cols
    // colWidths: wch values
    const makeTableSheet = (sheetName, headers, rows, rightCols = [], colWidths = []) => {
      const ws  = {};
      const R   = rows.length;       // data rows count
      const C   = headers.length;

      // Write header row (row index 0)
      headers.forEach((h, c) => {
        sc(ws, XLSX.utils.encode_cell({ r: 0, c }), h, headerStyle);
      });

      // Write data rows
      rows.forEach((row, ri) => {
        row.forEach((val, c) => {
          const right = rightCols.includes(c);
          sc(ws, XLSX.utils.encode_cell({ r: ri + 1, c }), val ?? '', dataStyle(ri, right));
        });
      });

      // Sheet ref
      ws['!ref'] = `A1:${XLSX.utils.encode_cell({ r: R, c: C - 1 })}`;

      // AutoFilter (gives the dropdown arrows like in screenshot)
      ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_cell({ r: 0, c: C - 1 })}` };

      // Column widths
      ws['!cols'] = colWidths.length
        ? colWidths.map(w => ({ wch: w }))
        : headers.map(h => ({ wch: Math.max(String(h).length + 4, 12) }));

      // Freeze top row
      ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' };

      // Row heights: header taller
      ws['!rows'] = [{ hpt: 22 }, ...Array(R).fill({ hpt: 18 })];

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    };

    // ── 1. SUMMARY ───────────────────────────────────────────────────────
    const wsSummary = {};

    const sectionTitle = (text) => ({
      font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 12, name: 'Calibri' },
      fill:      { fgColor: { rgb: '1E3A5F' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border,
    });
    const kpiLabel = {
      font:      { bold: true, color: { rgb: '1E3A5F' }, sz: 10, name: 'Calibri' },
      fill:      { fgColor: { rgb: 'D6E4F0' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border,
    };
    const kpiVal = (i) => ({
      font:      { sz: 10, name: 'Calibri' },
      fill:      { fgColor: { rgb: i % 2 === 0 ? 'EBF5FB' : 'FFFFFF' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border,
    });

    const merges = [];

    // Row 1: Report title
    sc(wsSummary, 'A1', `Performance Analytics Report — ${selectedYear}`, {
      font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 14, name: 'Calibri' },
      fill:      { fgColor: { rgb: '1E3A5F' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border,
    });
    ['B1','C1','D1','E1'].forEach(a => sc(wsSummary, a, '', { fill: { fgColor: { rgb: '1E3A5F' } }, border }));
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });

    // Row 2: Generated
    sc(wsSummary, 'A2', 'Generated', kpiLabel);
    sc(wsSummary, 'B2', new Date().toLocaleString('en-GB'), kpiVal(0));
    ['C2','D2','E2'].forEach(a => sc(wsSummary, a, '', kpiVal(0)));

    // Row 3: blank
    sc(wsSummary, 'A3', '', {});

    // Row 4: KPI section
    sc(wsSummary, 'A4', '  KEY PERFORMANCE INDICATORS', sectionTitle());
    ['B4','C4','D4','E4'].forEach(a => sc(wsSummary, a, '', { fill: { fgColor: { rgb: '1E3A5F' } }, border }));
    merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: 4 } });

    // Row 5: KPI table header
    ['KPI Metric', 'Value', '', '', ''].forEach((h, c) => {
      sc(wsSummary, XLSX.utils.encode_cell({ r: 4, c }), h, headerStyle);
    });

    const kpiRows = [
      ['Employees with Performance Data', kpis?.total ?? 0],
      ['Average Objectives Score',        `${(kpis?.avgObj  ?? 0).toFixed(1)}%`],
      ['Average Competencies Score',      `${(kpis?.avgComp ?? 0).toFixed(1)}%`],
      ['Average Overall Score',           `${(kpis?.avgOvr  ?? 0).toFixed(1)}%`],
    ];
    kpiRows.forEach(([label, val], i) => {
      sc(wsSummary, `A${6 + i}`, label, kpiLabel);
      sc(wsSummary, `B${6 + i}`, val,   kpiVal(i));
      ['C','D','E'].forEach(col => sc(wsSummary, `${col}${6 + i}`, '', kpiVal(i)));
    });

    // Row 11: blank
    sc(wsSummary, 'A11', '', {});

    // Row 12: Grade section
    sc(wsSummary, 'A12', '  GRADE DISTRIBUTION', sectionTitle());
    ['B12','C12','D12','E12'].forEach(a => sc(wsSummary, a, '', { fill: { fgColor: { rgb: '1E3A5F' } }, border }));
    merges.push({ s: { r: 11, c: 0 }, e: { r: 11, c: 4 } });

    // Row 13: grade table header
    ['Grade', 'Count', 'Actual %', 'Expected %', 'Variance %'].forEach((h, c) => {
      sc(wsSummary, XLSX.utils.encode_cell({ r: 12, c }), h, headerStyle);
    });

    const gradeLabels = { 'E++':'Outstanding','E+':'Good','E':'Average','E-':'Below Average','E--':'Poor' };
    gradeDist.forEach((g, i) => {
      const row  = 14 + i;
      const even = i % 2 === 0;
      const base = { font: { sz: 10, name: 'Calibri' }, fill: { fgColor: { rgb: even ? 'EBF5FB' : 'FFFFFF' } }, alignment: { horizontal: 'left', vertical: 'center' }, border };
      const num  = { ...base, alignment: { horizontal: 'center', vertical: 'center' } };
      const variance = (g.actual - g.norm).toFixed(1);
      const varNum   = parseFloat(variance);
      const varStyle = {
        ...num,
        font: { bold: true, sz: 10, name: 'Calibri',
          color: { rgb: varNum > 2 ? 'C00000' : varNum < -2 ? '375623' : '1A1A1A' } },
      };

      sc(wsSummary, `A${row}`, `${g.grade}  —  ${gradeLabels[g.grade] || g.grade}`, base);
      sc(wsSummary, `B${row}`, g.count,    num);
      sc(wsSummary, `C${row}`, `${g.actual}%`, num);
      sc(wsSummary, `D${row}`, `${g.norm}%`,   num);
      sc(wsSummary, `E${row}`, `${varNum > 0 ? '+' : ''}${variance}%`, varStyle);
    });

    const lastRow = 14 + gradeDist.length - 1;
    wsSummary['!ref']    = `A1:E${lastRow}`;
    wsSummary['!merges'] = merges;
    wsSummary['!cols']   = [{ wch: 36 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    wsSummary['!rows']   = [{ hpt: 28 }, { hpt: 20 }, { hpt: 8 }, { hpt: 24 }, { hpt: 22 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // ── 2. ALL EMPLOYEES ──────────────────────────────────────────────────
    makeTableSheet(
      'All Employees',
      ['#', 'Employee Name', 'Business Function', 'Unit', 'Position', 'Objectives %', 'Competencies %', 'Overall %', 'Final Rating'],
      withPerf.map((e, i) => [
        i + 1, e.employee_name || e.name,
        e.employee_business_function || '', e.employee_unit || '', e.employee_position_group || '',
        pct(e.objectives_percentage), pct(e.competencies_percentage),
        pct(e.overall_weighted_percentage), e.final_rating || '',
      ]),
      [0, 5, 6, 7],   // right-align numeric cols
      [5, 26, 22, 20, 18, 14, 16, 12, 14]
    );

    // ── 3. BY BUSINESS FUNCTION ───────────────────────────────────────────
    makeTableSheet(
      'By Business Function',
      ['#', 'Business Function', 'Total', 'With Data', 'Avg Obj %', 'Avg Comp %', 'Avg Overall %', 'E++', 'E+', 'E', 'E-', 'E--'],
      bfStats.map((u, i) => [
        i + 1, u.bf, u.total, u.done, u.avgObj, u.avgComp, u.avgOvr,
        u.grades['E++']||0, u.grades['E+']||0, u.grades['E']||0, u.grades['E-']||0, u.grades['E--']||0,
      ]),
      [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      [5, 26, 8, 10, 12, 14, 14, 7, 7, 7, 7, 7]
    );

    // ── 4. BY UNIT ────────────────────────────────────────────────────────
    makeTableSheet(
      'By Unit',
      ['#', 'Unit', 'Total', 'With Data', 'Avg Obj %', 'Avg Comp %', 'Avg Overall %', 'E++', 'E+', 'E', 'E-', 'E--'],
      unitStats.map((u, i) => [
        i + 1, u.unit, u.total, u.done, u.avgObj, u.avgComp, u.avgOvr,
        u.grades['E++']||0, u.grades['E+']||0, u.grades['E']||0, u.grades['E-']||0, u.grades['E--']||0,
      ]),
      [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      [5, 24, 8, 10, 12, 14, 14, 7, 7, 7, 7, 7]
    );

    // ── 5. BY POSITION ────────────────────────────────────────────────────
    makeTableSheet(
      'By Position',
      ['#', 'Position Group', 'Total', 'With Data', 'Avg Obj %', 'Avg Comp %', 'Avg Overall %'],
      posStats.map((u, i) => [i + 1, u.pos, u.total, u.done, u.avgObj, u.avgComp, u.avgOvr]),
      [0, 2, 3, 4, 5, 6],
      [5, 22, 8, 10, 12, 14, 14]
    );

    // ── 6. TOP 10 ─────────────────────────────────────────────────────────
    makeTableSheet(
      'Top 10 Performers',
      ['Rank', 'Employee Name', 'Business Function', 'Unit', 'Position', 'Obj %', 'Comp %', 'Overall %', 'Final Rating'],
      topList.map((e, i) => [
        i === 0 ? '🥇 #1' : i === 1 ? '🥈 #2' : i === 2 ? '🥉 #3' : `#${i + 1}`,
        e.employee_name || e.name,
        e.employee_business_function || '', e.employee_unit || '', e.employee_position_group || '',
        pct(e.objectives_percentage), pct(e.competencies_percentage),
        pct(e.overall_weighted_percentage), e.final_rating || '',
      ]),
      [5, 6, 7],
      [8, 26, 22, 20, 18, 10, 10, 12, 14]
    );

    // ── 7. NEEDS ATTENTION ────────────────────────────────────────────────
    makeTableSheet(
      'Needs Attention',
      ['Rank', 'Employee Name', 'Business Function', 'Unit', 'Position', 'Overall %', 'Final Rating', 'Risk Level'],
      botList.map((e, i) => {
        const v = pct(e.overall_weighted_percentage);
        return [i + 1, e.employee_name || e.name, e.employee_business_function || '', e.employee_unit || '', e.employee_position_group || '', v, e.final_rating || '', v < 50 ? 'High' : v < 70 ? 'Medium' : 'Low'];
      }),
      [0, 5],
      [6, 26, 22, 20, 18, 12, 14, 12]
    );

    XLSX.writeFile(wb, `Performance_Analytics_${selectedYear}.xlsx`, { cellStyles: true });
  } catch (err) {
    console.error('Excel export failed:', err);
    alert('Excel export failed. Please try again.');
  }
};

const exportGroupExcel = (data, labelKey, sheetName, selectedYear) => {
  import('xlsx').then(XLSX => {
    const wb = XLSX.utils.book_new();
    const headers = [
      '#', sheetName, 'Total Employees', 'With Data',
      'Avg Objectives %', 'Avg Competencies %', 'Avg Overall %',
      'E++', 'E+', 'E', 'E-', 'E--',
    ];
    const rows = data.map((u, i) => [
      i + 1, u[labelKey], u.total, u.done,
      u.avgObj, u.avgComp, u.avgOvr,
      u.grades?.['E++'] || 0, u.grades?.['E+'] || 0, u.grades?.['E'] || 0,
      u.grades?.['E-'] || 0, u.grades?.['E--'] || 0,
    ]);
    XLSX.utils.book_append_sheet(wb, makeSheet(XLSX, headers, rows), sheetName);
    XLSX.writeFile(wb, `${sheetName.replace(/\s+/g,'_')}_${selectedYear}.xlsx`, { cellStyles: true });
  });
};



const GradeBadge = ({ grade, showLabel = false }) => {
  if (!grade || grade === 'N/A') return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: gc(grade) + '20', color: gc(grade) }}>
      {showLabel ? (GRADE_LABELS[grade] || grade) : grade}
    </span>
  );
};

const GradeLegend = ({ dark }) => (
  <div className={`flex flex-wrap gap-2 text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
    <span className="font-medium mr-1">Grade Scale:</span>
    {GRADE_ORDER.map(g => (
      <span key={g} className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: gc(g) }} />
        {GRADE_LABELS[g]}
      </span>
    ))}
  </div>
);

const Bar1 = ({ value, color = C.primary }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
    <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
  </div>
);

const TTip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg p-3 text-xs`}>
      {label && <p className={`font-semibold mb-1 ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className={dark ? 'text-gray-400' : 'text-gray-500'}>{p.name}:</span>
          <span className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
            {typeof p.value === 'number' ? `${p.value.toFixed(1)}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const Card = ({ dark, children, className = '' }) => (
  <div className={`${dark ? 'bg-almet-cloud-burst border-almet-comet text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-xl border ${className}`}>
    {children}
  </div>
);

const SectionHead = ({ icon: I, title, subtitle, dark }) => (
  <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-2">
      <I className="w-4 h-4 text-almet-sapphire" />
      <span className="text-sm font-semibold">{title}</span>
    </div>
    {subtitle && <p className={`text-xs mt-0.5 ml-6 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
  </div>
);

const InfoBanner = ({ text, dark }) => (
  <div className={`flex items-start gap-2 px-4 py-2.5 rounded-lg text-xs ${dark ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-100'} border`}>
    <HelpCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

const ScorePill = ({ value }) => {
  const col   = value >= 116 ? C.success
               : value >= 101 ? C.primary
               : value >= 91  ? C.info
               : value >= 75  ? C.warning
               :                C.danger;
  const label = value >= 116 ? 'Outstanding'
               : value >= 101 ? 'Good'
               : value >= 91  ? 'Average'
               : value >= 75  ? 'Below Avg'
               :                'Poor';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ background: col + '20', color: col }}>
      {value}% · {label}
    </span>
  );
};

const FilterBar = ({ bfList, unitList, posList, gradeList, fBF, setFBF, fUnit, setFUnit, fPos, setFPos, fGrade, setFGrade, dark }) => {
  const active = [fBF, fUnit, fPos, fGrade].filter(Boolean).length;
  const clear  = () => { setFBF(''); setFUnit(''); setFPos(''); setFGrade(''); };
  const Sel = ({ label, value, onChange, opts }) => (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`appearance-none text-xs pl-3 pr-7 py-1.5 rounded-lg border cursor-pointer
          ${dark ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}
          ${value ? 'border-almet-sapphire font-medium' : ''}`}>
        <option value="">{label}</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-gray-400" />
    </div>
  );
  return (
    <div className={`flex flex-wrap items-center gap-2 p-3 rounded-xl border ${dark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      <span className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Filter:</span>
      <Sel label="All Business Functions" value={fBF}    onChange={setFBF}    opts={bfList}    />
      <Sel label="All Units"              value={fUnit}  onChange={setFUnit}  opts={unitList}  />
      <Sel label="All Positions"          value={fPos}   onChange={setFPos}   opts={posList}   />
      <Sel label="All Grades"             value={fGrade} onChange={setFGrade} opts={gradeList} />
      {active > 0 && (
        <button onClick={clear}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-medium">
          <X className="w-3 h-3" /> Clear Filters ({active})
        </button>
      )}
    </div>
  );
};

export default function PerformanceAnalyticsDashboard({
  employees = [], settings, darkMode, selectedYear,
  onLoadEmployeePerformance, isManager = false, canViewAll = false,
}) {
  const dark = darkMode;

  const [fBF,   setFBF]   = useState('');
  const [fUnit, setFUnit] = useState('');
  const [fPos,  setFPos]  = useState('');
  const [fGrade,setFGrade]= useState('');
  const [tab,   setTab]   = useState('overview');
  const [selId,   setSelId]   = useState(null);
  const [selData, setSelData] = useState(null);
  const [loadEmp, setLoadEmp] = useState(false);

  const bfList    = useMemo(() => [...new Set(employees.map(e => e.employee_business_function || '').filter(Boolean))].sort(), [employees]);
  const unitList  = useMemo(() => [...new Set(employees.map(e => e.employee_unit || '').filter(Boolean))].sort(), [employees]);
  const posList   = useMemo(() => [...new Set(employees.map(e => e.employee_position_group || '').filter(Boolean))].sort(), [employees]);
  const gradeList = useMemo(() => GRADE_ORDER.filter(g => employees.some(e => e.final_rating === g)), [employees]);

  const filtered = useMemo(() => employees.filter(e => {
    if (fBF    && (e.employee_business_function || '') !== fBF)    return false;
    if (fUnit  && (e.employee_unit || '')              !== fUnit)  return false;
    if (fPos   && (e.employee_position_group || '')    !== fPos)   return false;
    if (fGrade && (e.final_rating || '')               !== fGrade) return false;
    return true;
  }), [employees, fBF, fUnit, fPos, fGrade]);

  const withPerf = useMemo(() =>
    filtered.filter(e => pct(e.objectives_percentage) > 0 || pct(e.competencies_percentage) > 0),
    [filtered]);

  const kpis = useMemo(() => {
    if (!withPerf.length) return null;
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    return {
      total:   withPerf.length,
      avgObj:  avg(withPerf.map(e => pct(e.objectives_percentage))),
      avgComp: avg(withPerf.map(e => pct(e.competencies_percentage))),
      avgOvr:  avg(withPerf.map(e => pct(e.overall_weighted_percentage))),
    };
  }, [withPerf]);

  const gradeDist = useMemo(() => {
    if (!settings?.evaluationScale || !withPerf.length) return [];
    const scales = [...settings.evaluationScale].sort((a, b) => b.value - a.value);
    const bell   = { 5: 5, 4: 15, 3: 60, 2: 15, 1: 5 };
    const cnt    = {};
    scales.forEach(s => { cnt[s.name] = 0; });
    withPerf.forEach(e => { const g = e.final_rating; if (g && cnt[g] !== undefined) cnt[g]++; });
    return scales.map(s => ({
      grade:  s.name,
      norm:   bell[s.value] || 0,
      actual: +(cnt[s.name] / withPerf.length * 100).toFixed(1),
      count:  cnt[s.name],
      color:  gc(s.name),
    }));
  }, [withPerf, settings]);

  const buildGroupStats = (keyFn, labelKey) => {
    const map = {};
    employees.forEach(e => {
      const k = keyFn(e) || 'Unknown';
      if (!map[k]) map[k] = { [labelKey]: k, total: 0, done: 0, oS: 0, cS: 0, ovS: 0, grades: {} };
      map[k].total++;
      const o = pct(e.objectives_percentage), c = pct(e.competencies_percentage), v = pct(e.overall_weighted_percentage);
      if (o > 0 || c > 0) {
        map[k].done++; map[k].oS += o; map[k].cS += c; map[k].ovS += v;
        const g = e.final_rating || 'N/A'; map[k].grades[g] = (map[k].grades[g] || 0) + 1;
      }
    });
    return Object.values(map).map(u => ({
      ...u,
      avgObj:  u.done ? +(u.oS / u.done).toFixed(1) : 0,
      avgComp: u.done ? +(u.cS / u.done).toFixed(1) : 0,
      avgOvr:  u.done ? +(u.ovS / u.done).toFixed(1) : 0,
    })).sort((a, b) => b.avgOvr - a.avgOvr);
  };

  const bfStats   = useMemo(() => buildGroupStats(e => e.employee_business_function, 'bf'),   [employees]);
  const unitStats = useMemo(() => buildGroupStats(e => e.employee_unit,              'unit'),  [employees]);
  const posStats  = useMemo(() => buildGroupStats(e => e.employee_position_group,    'pos'),   [employees]);

  const allSorted = useMemo(() => [...filtered.filter(e => pct(e.overall_weighted_percentage) > 0)]
    .sort((a, b) => pct(b.overall_weighted_percentage) - pct(a.overall_weighted_percentage)), [filtered]);


  const topList = useMemo(() =>
    [...filtered.filter(e => pct(e.overall_weighted_percentage) >= 101)]
      .sort((a, b) => pct(b.overall_weighted_percentage) - pct(a.overall_weighted_percentage))
      .slice(0, 10),
    [filtered]);


  const botList = useMemo(() =>
    [...filtered.filter(e => pct(e.overall_weighted_percentage) > 0 && pct(e.overall_weighted_percentage) < 91)]
      .sort((a, b) => pct(a.overall_weighted_percentage) - pct(b.overall_weighted_percentage)) // ən aşağıdan başla
      .slice(0, 5),
    [filtered]);




  useEffect(() => {
    if (!selId) { setSelData(null); return; }
    (async () => {
      setLoadEmp(true);
      try { setSelData(await onLoadEmployeePerformance(selId, selectedYear) || null); }
      catch { setSelData(null); }
      finally { setLoadEmp(false); }
    })();
  }, [selId, selectedYear]);

  const radarData = useMemo(() => {
    if (!selData?.competency_ratings) return [];
    const map = {};
    selData.competency_ratings.forEach(c => {
      const g = c.main_group_name || c.competency_group_name || 'Other';
      if (!map[g]) map[g] = { subject: g, req: 0, actual: 0 };
      map[g].req    += parseFloat(c.required_level) || 0;
      map[g].actual += parseFloat(c.end_year_rating_value) || 0;
    });
    return Object.values(map).map(g => ({
      subject:   g.subject,
      Required:  +g.req.toFixed(1),
      Actual:    +g.actual.toFixed(1),
      Score_pct: g.req > 0 ? Math.round(g.actual / g.req * 100) : 0,
    }));
  }, [selData]);

  const handleExportAll = () => exportPerformanceExcel({ withPerf, bfStats, unitStats, posStats, topList, botList, gradeDist, kpis, selectedYear });

  const TABS = [
    { id: 'overview',  label: 'Overview',         icon: BarChart3 },
    { id: 'bf',        label: 'Business Function', icon: Layers    },
    { id: 'unit',      label: 'By Unit',           icon: Building2 },
    { id: 'position',  label: 'By Position',       icon: Briefcase },
    { id: 'top',       label: 'Top Performers',    icon: Trophy    },
    { id: 'detail',    label: 'Employee',          icon: User      },
  ];

  if (!employees.length) return (
    <div className={`${dark ? 'bg-almet-cloud-burst' : 'bg-white'} rounded-xl p-12 text-center`}>
      <BarChart3 className="w-14 h-14 mx-auto mb-4 text-gray-300" />
      <p className={`font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No performance data available</p>
    </div>
  );

  // ── Reusable group section ─────────────────────────────────────────────
  const GroupSection = ({ data, labelKey, labelHeader, infoText, exportSheetName }) => (
    <div className="space-y-4">
      {infoText && <InfoBanner text={infoText} dark={dark} />}
      <GradeLegend dark={dark} />
      <div className="flex justify-end">
        <button onClick={() => exportGroupExcel(data, labelKey, exportSheetName, selectedYear)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-almet-sapphire text-white hover:opacity-90">
          <Download className="w-3.5 h-3.5" /> Export Excel
        </button>
      </div>

      <Card dark={dark} className="p-5">
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-almet-sapphire" /> Average Score by {labelHeader}
        </h3>
        <p className={`text-xs mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          Each bar represents a 0–100% score. A higher bar means better performance.
        </p>
        <ResponsiveContainer width="100%" height={Math.max(240, data.length * 46)}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" stroke={dark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }} />
            <YAxis dataKey={labelKey} type="category" width={155} stroke={dark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }} />
            <Tooltip content={<TTip dark={dark} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="avgObj"  name="Objectives %"   fill={C.success}   radius={[0, 4, 4, 0]} />
            <Bar dataKey="avgComp" name="Competencies %"  fill={C.secondary} radius={[0, 4, 4, 0]} />
            <Bar dataKey="avgOvr"  name="Overall %"       fill={C.primary}   radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary table */}
      <Card dark={dark} className="overflow-hidden">
        <SectionHead icon={BarChart3} title={`${labelHeader} Summary Table`} dark={dark}
          subtitle="Ranked by average overall score (highest first)" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className={dark ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                {['#', labelHeader, 'Total', 'With Data', 'Avg Obj %', 'Avg Comp %', 'Avg Overall %', 'Grade Distribution'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((u, i) => (
                <tr key={u[labelKey]} className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'} ${i % 2 ? dark ? 'bg-gray-800/30' : 'bg-gray-50/40' : ''}`}>
                  <td className={`px-4 py-2.5 font-bold ${i === 0 ? 'text-amber-500' : dark ? 'text-gray-400' : 'text-gray-500'}`}>#{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium">{u[labelKey]}</td>
                  <td className="px-4 py-2.5 text-center">{u.total}</td>
                  <td className="px-4 py-2.5 text-center">{u.done}</td>
                  {[u.avgObj, u.avgComp, u.avgOvr].map((v, j) => (
                    <td key={j} className="px-4 py-2.5">
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <span className={`w-10 text-right font-semibold ${scoreColor(v)}`}>{v}%</span>
                        <div className="flex-1"><Bar1 value={v} color={[C.success, C.secondary, C.primary][j]} /></div>
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {GRADE_ORDER.filter(g => u.grades?.[g]).map(g => (
                        <span key={g} className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: gc(g) + '20', color: gc(g) }}>
                          {g}: {u.grades[g]}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
            Performance Analytics — {selectedYear}
          </h2>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1 mt-0.5`}>
            <Info className="w-3 h-3" />
            {canViewAll ? `All ${employees.length} employees` : `${employees.length} employees (you + team)`}
            {withPerf.length < employees.length && ` · ${withPerf.length} with performance data`}
          </p>
        </div>
        <button onClick={handleExportAll}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-almet-sapphire text-white hover:opacity-90">
          <Download className="w-3.5 h-3.5" /> Export Full Report (Excel)
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <FilterBar
        bfList={bfList} unitList={unitList} posList={posList} gradeList={gradeList}
        fBF={fBF} setFBF={setFBF} fUnit={fUnit} setFUnit={setFUnit}
        fPos={fPos} setFPos={setFPos} fGrade={fGrade} setFGrade={setFGrade}
        dark={dark}
      />

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className={`grid grid-cols-6 items-center p-2 rounded-xl overflow-x-auto ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {TABS.map(t => {
          const a = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0
                ${a ? 'bg-almet-sapphire text-white shadow-sm' : dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ══ OVERVIEW ═════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-4">
       

          <GradeLegend dark={dark} />

          {/* Grade distribution */}
          {gradeDist.length > 0 && (
            <Card dark={dark} className="p-5">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-almet-sapphire" /> Grade Distribution vs. Bell Curve
              </h3>
              <p className={`text-xs mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                <strong>Expected</strong> shows where employees should ideally land (bell curve). <strong>Actual</strong> shows how they are distributed this year. Large deviations may indicate calibration issues.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={gradeDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="grade" stroke={dark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }} />
                    <YAxis stroke={dark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }} unit="%" />
                    <Tooltip content={<TTip dark={dark} />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="norm"   stroke={C.success} strokeWidth={2} name="Expected %" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="actual" stroke={C.danger}  strokeWidth={2} name="Actual %"   dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={gradeDist.filter(g => g.count > 0)} dataKey="count" nameKey="grade"
                      cx="50%" cy="50%" outerRadius={80} innerRadius={35}
                      label={({ grade, count }) => `${grade}: ${count}`} labelLine={false}>
                      {gradeDist.map((g, i) => <Cell key={i} fill={g.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} employees`, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Grade table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-xs">
                  <thead className={dark ? 'bg-gray-800' : 'bg-gray-50'}>
                    <tr>
                      {['Grade', 'Count', 'Actual %', 'Expected %', 'Variance', 'Assessment'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gradeDist.map((g, i) => {
                      const v    = (g.actual - g.norm).toFixed(1);
                      const note = +v > 5 ? '⚠ Significantly above expected' : +v < -5 ? '⚠ Significantly below expected' : '✓ Within normal range';
                      return (
                        <tr key={g.grade} className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'} ${i % 2 ? dark ? 'bg-gray-800/30' : 'bg-gray-50/40' : ''}`}>
                          <td className="px-4 py-2.5"><GradeBadge grade={g.grade} showLabel /></td>
                          <td className="px-4 py-2.5 font-semibold">{g.count}</td>
                          <td className="px-4 py-2.5 font-semibold">{g.actual}%</td>
                          <td className={`px-4 py-2.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{g.norm}%</td>
                          <td className={`px-4 py-2.5 font-semibold ${+v > 0 ? 'text-red-500' : +v < 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                            {+v > 0 ? '+' : ''}{v}%
                          </td>
                          <td className={`px-4 py-2.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{note}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Scatter */}
          {withPerf.length > 1 && (
            <Card dark={dark} className="p-5">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-almet-sapphire" /> Objectives vs. Competencies Scatter
              </h3>
              <p className={`text-xs mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Each dot = one employee. <strong>Top-right</strong> = high in both (ideal). <strong>Bottom-left</strong> = needs attention. Hover a dot to see the employee's details.
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
                  <XAxis type="number" dataKey="obj"  name="Objectives"   unit="%" domain={[0, 120]} stroke={dark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }}
                    label={{ value: 'Objectives %', position: 'insideBottom', offset: -12, style: { fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' } }} />
                  <YAxis type="number" dataKey="comp" name="Competencies" unit="%" domain={[0, 120]} stroke={dark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }}
                    label={{ value: 'Competencies %', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' } }} />
                  <ZAxis range={[45, 45]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className={`${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg p-3 text-xs`}>
                        <p className="font-semibold mb-2">{d.name}</p>
                        <p>Objectives: <strong>{d.obj}%</strong></p>
                        <p>Competencies: <strong>{d.comp}%</strong></p>
                        <p>Overall: <strong>{d.ovr}%</strong></p>
                        <div className="mt-1"><GradeBadge grade={d.grade} showLabel /></div>
                      </div>
                    );
                  }} />
                  <Scatter
                    data={withPerf.map(e => ({
                      obj: pct(e.objectives_percentage), comp: pct(e.competencies_percentage),
                      ovr: pct(e.overall_weighted_percentage),
                      name: e.employee_name || e.name, grade: e.final_rating || '—',
                    }))}
                    fill={C.primary} fillOpacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* ══ BUSINESS FUNCTION ════════════════════════════════════════════ */}
      {tab === 'bf' && (
        <GroupSection data={bfStats} labelKey="bf" labelHeader="Business Function" exportSheetName="Business Function"
          infoText="Compare average performance scores across business functions. The table is ranked by overall score — highest performing function appears first." />
      )}

      {/* ══ UNIT ═════════════════════════════════════════════════════════ */}
      {tab === 'unit' && (
        <GroupSection data={unitStats} labelKey="unit" labelHeader="Unit" exportSheetName="By Unit"
          infoText="Breakdown of performance by organisational unit. Use grade distribution badges to quickly spot if a unit is skewed toward high or low grades." />
      )}

      {/* ══ POSITION ═════════════════════════════════════════════════════ */}
      {tab === 'position' && (
        <div className="space-y-4">
          <InfoBanner text="Performance comparison by position group. Useful for identifying whether certain roles consistently score higher or lower than others." dark={dark} />
          <GradeLegend dark={dark} />
          <div className="flex justify-end">
            <button onClick={() => exportGroupExcel(posStats, 'pos', 'By Position', selectedYear)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-almet-sapphire text-white hover:opacity-90">
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
          <Card dark={dark} className="p-5">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-almet-sapphire" /> Average Score by Position
            </h3>
            <p className={`text-xs mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              Each bar is on a 0–100% scale. Longer bar = better performance.
            </p>
            <ResponsiveContainer width="100%" height={Math.max(240, posStats.length * 46)}>
              <BarChart data={posStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke={dark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }} />
                <YAxis dataKey="pos" type="category" width={150} stroke={dark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }} />
                <Tooltip content={<TTip dark={dark} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="avgObj"  name="Objectives %"   fill={C.success}   radius={[0, 4, 4, 0]} />
                <Bar dataKey="avgComp" name="Competencies %"  fill={C.secondary} radius={[0, 4, 4, 0]} />
                <Bar dataKey="avgOvr"  name="Overall %"       fill={C.primary}   radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card dark={dark} className="overflow-hidden">
            <SectionHead icon={Briefcase} title="Position Summary Table" dark={dark}
              subtitle="Ranked by average overall score" />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className={dark ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    {['#', 'Position Group', 'Total', 'With Data', 'Avg Obj %', 'Avg Comp %', 'Avg Overall %'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posStats.map((p, i) => (
                    <tr key={p.pos} className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'} ${i % 2 ? dark ? 'bg-gray-800/30' : 'bg-gray-50/40' : ''}`}>
                      <td className={`px-4 py-2.5 font-bold ${i === 0 ? 'text-amber-500' : dark ? 'text-gray-400' : 'text-gray-500'}`}>#{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium">{p.pos}</td>
                      <td className="px-4 py-2.5 text-center">{p.total}</td>
                      <td className="px-4 py-2.5 text-center">{p.done}</td>
                      {[p.avgObj, p.avgComp, p.avgOvr].map((v, j) => (
                        <td key={j} className="px-4 py-2.5">
                          <div className="flex items-center gap-2 min-w-[90px]">
                            <span className={`w-10 text-right font-semibold ${scoreColor(v)}`}>{v}%</span>
                            <div className="flex-1"><Bar1 value={v} color={[C.success, C.secondary, C.primary][j]} /></div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ══ TOP PERFORMERS ═══════════════════════════════════════════════ */}
      {tab === 'top' && (
        <div className="space-y-4">
          <InfoBanner text="Employees ranked by overall weighted score. The 'Needs Attention' table highlights the lowest 5 — consider creating development plans for them." dark={dark} />
          <GradeLegend dark={dark} />

          {/* Top 10 */}
          <Card dark={dark} className="overflow-hidden">
            <SectionHead icon={Trophy} title="Top 10 Performers"
              subtitle={`${selectedYear} — ranked by overall weighted score`} dark={dark} />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className={dark ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    {['Rank', 'Employee', 'Business Function', 'Unit', 'Position', 'Obj %', 'Comp %', 'Overall %', 'Grade'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topList.map((e, i) => (
                    <tr key={e.id} className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'} ${i % 2 ? dark ? 'bg-gray-800/30' : 'bg-gray-50/40' : ''}`}>
                      <td className="px-3 py-2.5 font-bold text-sm">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td className="px-3 py-2.5 font-medium whitespace-nowrap">{e.employee_name || e.name}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{e.employee_business_function || '—'}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{e.employee_unit || '—'}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{e.employee_position_group || '—'}</td>
                      {[pct(e.objectives_percentage), pct(e.competencies_percentage), pct(e.overall_weighted_percentage)].map((v, j) => (
                        <td key={j} className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5 min-w-[70px]">
                            <span className={`w-10 text-right font-semibold ${scoreColor(v)}`}>{v}%</span>
                            <div className="w-12"><Bar1 value={v} color={[C.success, C.secondary, C.primary][j]} /></div>
                          </div>
                        </td>
                      ))}
                      <td className="px-3 py-2.5"><GradeBadge grade={e.final_rating} showLabel /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom 5 — only rendered when list is non-empty (requires 6+ employees) */}
          {botList.length > 0 && (
            <Card dark={dark} className="overflow-hidden">
              <SectionHead icon={AlertTriangle} title="Needs Attention — Bottom 5"
                subtitle="Consider development plans or additional support for these employees" dark={dark} />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className={dark ? 'bg-gray-800' : 'bg-gray-50'}>
                    <tr>
                      {['Employee', 'Business Function', 'Unit', 'Position', 'Overall Score', 'Grade', 'Risk Level'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {botList.map((e, i) => {
                      const v    = pct(e.overall_weighted_percentage);
                      // E-- = 1-74% → High,  E- = 75-90% → Medium
                      const risk = v < 75 ? 'High' : 'Medium';
                      const rc   = risk === 'High'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700';
                      return (
                        <tr key={e.id} className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'} ${i % 2 ? dark ? 'bg-gray-800/30' : 'bg-gray-50/40' : ''}`}>
                          <td className="px-4 py-2.5 font-medium">{e.employee_name || e.name}</td>
                          <td className="px-4 py-2.5 text-gray-500">{e.employee_business_function || '—'}</td>
                          <td className="px-4 py-2.5 text-gray-500">{e.employee_unit || '—'}</td>
                          <td className="px-4 py-2.5 text-gray-500">{e.employee_position_group || '—'}</td>
                          <td className="px-4 py-2.5"><ScorePill value={v} /></td>
                          <td className="px-4 py-2.5"><GradeBadge grade={e.final_rating} showLabel /></td>
                          <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${rc}`}>{risk}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Best per BF */}
          <Card dark={dark} className="p-5">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Top Performer per Business Function
            </h3>
            <p className={`text-xs mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              The highest-scoring employee in each business function.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {bfList.map(bf => {
                const best = employees
                  .filter(e => e.employee_business_function === bf && pct(e.overall_weighted_percentage) > 0)
                  .sort((a, b) => pct(b.overall_weighted_percentage) - pct(a.overall_weighted_percentage))[0];
                if (!best) return null;
                return (
                  <div key={bf} className={`rounded-lg border p-3.5 ${dark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                    <p className="text-xs font-semibold text-almet-sapphire truncate">{bf}</p>
                    <p className={`text-sm font-bold mt-0.5 ${dark ? 'text-white' : 'text-gray-900'}`}>{best.employee_name || best.name}</p>
                    <p className="text-xs text-gray-500">{best.employee_unit || ''} · {best.employee_position_group || ''}</p>
                    <div className="flex items-center justify-between mt-2">
                      <ScorePill value={pct(best.overall_weighted_percentage)} />
                      <GradeBadge grade={best.final_rating} showLabel />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ══ EMPLOYEE DETAIL ══════════════════════════════════════════════ */}
      {tab === 'detail' && (
        <div className="space-y-4">
          <InfoBanner text="Individual employee analysis. Select an employee to view their objective results, competency ratings, and radar chart. Scores are colour-coded: green = excellent, blue = good, amber = average, red = needs improvement." dark={dark} />

          <Card dark={dark} className="p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-almet-sapphire" /> Select Employee
            </h3>
            <SearchableDropdown
              options={employees.filter(e => pct(e.overall_weighted_percentage) > 0).map(e => ({
                value: e.id,
                label: `${e.employee_name || e.name} — ${e.employee_position_group || ''} (${e.employee_business_function || ''} · ${e.employee_unit || ''})`,
              }))}
              value={selId} onChange={setSelId}
              placeholder="— Search employee —" searchPlaceholder="Name, position, unit..."
              darkMode={dark} icon={<User size={13} />} allowUncheck
            />
          </Card>

          {loadEmp && (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-almet-sapphire" />
            </div>
          )}

          {!loadEmp && !selId && (
            <Card dark={dark} className="p-12 text-center">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Select an employee above to view their detailed competency analysis
              </p>
            </Card>
          )}

          {!loadEmp && selId && (() => {
            const emp = employees.find(e => e.id === selId);
            if (!emp) return null;
            return (
              <div className="space-y-4">
                {/* Summary */}
                <Card dark={dark} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{emp.employee_name || emp.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {emp.employee_position_group} · {emp.employee_business_function} · {emp.employee_unit}
                      </p>
                    </div>
                    <GradeBadge grade={emp.final_rating} showLabel />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Objectives',    val: pct(emp.objectives_percentage),        color: C.success,   hint: 'How well the employee achieved their set objectives' },
                      { label: 'Competencies',  val: pct(emp.competencies_percentage),       color: C.secondary, hint: 'How close the employee is to the required competency level' },
                      { label: 'Overall Score', val: pct(emp.overall_weighted_percentage),   color: C.primary,   hint: 'Weighted average of both scores' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-lg p-3 border ${scoreBg(s.val)}`}>
                        <p className="text-xs text-gray-500">{s.label}</p>
                        <p className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.val}%</p>
                        <Bar1 value={s.val} color={s.color} />
                        <p className="text-xs text-gray-400 mt-1">{s.hint}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Radar */}
                {selData && radarData.length > 0 && (
                  <Card dark={dark} className="p-5">
                    <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <Award className="w-4 h-4 text-almet-sapphire" /> Competency Group Radar
                      {selData.metadata?.competency_type && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium
                          ${selData.metadata.competency_type === 'LEADERSHIP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {selData.metadata.competency_type === 'LEADERSHIP' ? 'Leadership' : 'Behavioural'}
                        </span>
                      )}
                    </h3>
                    <p className={`text-xs mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                      The radar shows each competency group's score as a percentage of the required level. <strong>100%</strong> = fully meets the requirement. Below 100% = development area.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                          <PolarGrid stroke={dark ? '#374151' : '#e5e7eb'} />
                          <PolarAngleAxis dataKey="subject" stroke={dark ? '#9ca3af' : '#6b7280'} style={{ fontSize: 11 }}
                            tick={({ x, y, payload, cx, cy }) => {
                              const words = payload.value.split(' ');
                              return (
                                <text x={x} y={y} fill={dark ? '#9ca3af' : '#6b7280'}
                                  textAnchor={x > cx ? 'start' : x < cx ? 'end' : 'middle'}
                                  dominantBaseline="central" fontSize={10}>
                                  {words.map((w, i) => <tspan key={i} x={x} dy={i === 0 ? 0 : 12}>{w}</tspan>)}
                                </text>
                              );
                            }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={dark ? '#4b5563' : '#d1d5db'} style={{ fontSize: 9 }} />
                          <Radar name="Score %" dataKey="Score_pct"
                            stroke={C.primary} fill={C.primary} fillOpacity={0.45} strokeWidth={2} />
                          <Tooltip formatter={v => [`${v}%`, 'Score']} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                        </RadarChart>
                      </ResponsiveContainer>

                      {/* Group table */}
                      <div className="overflow-y-auto max-h-72">
                        <table className="w-full text-xs">
                          <thead className={`${dark ? 'bg-gray-800' : 'bg-gray-50'} sticky top-0`}>
                            <tr>
                              {['Group', 'Required', 'Actual', 'Score %', 'Level'].map(h => (
                                <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {radarData.map(g => {
                              const lvl = g.Score_pct >= 100 ? 'Exceeds' : g.Score_pct >= 80 ? 'Meets' : g.Score_pct >= 60 ? 'Developing' : 'Below';
                              const lvlC = g.Score_pct >= 100 ? 'text-emerald-600' : g.Score_pct >= 80 ? 'text-almet-sapphire' : g.Score_pct >= 60 ? 'text-amber-600' : 'text-red-600';
                              return (
                                <tr key={g.subject} className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                                  <td className="px-3 py-2 font-medium">{g.subject}</td>
                                  <td className="px-3 py-2 text-gray-500">{g.Required}</td>
                                  <td className="px-3 py-2">{g.Actual}</td>
                                  <td className="px-3 py-2 font-bold" style={{ color: g.Score_pct >= 90 ? C.success : g.Score_pct >= 70 ? C.primary : g.Score_pct >= 50 ? C.warning : C.danger }}>
                                    {g.Score_pct}%
                                  </td>
                                  <td className={`px-3 py-2 text-xs font-medium ${lvlC}`}>{lvl}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Individual competencies */}
                {selData?.competency_ratings?.length > 0 && (
                  <Card dark={dark} className="p-5">
                    <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-almet-sapphire" /> Individual Competency Ratings
                    </h3>
                    <p className={`text-xs mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <strong>Required</strong> = minimum level for this role. <strong>Actual</strong> = employee's achieved level.
                      <strong> Gap</strong>: positive (+) means exceeds requirement; negative (−) means below requirement.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className={dark ? 'bg-gray-800' : 'bg-gray-50'}>
                          <tr>
                            {['Group', 'Competency', 'Required', 'Rating', 'Actual', 'Gap', 'Status'].map(h => (
                              <th key={h} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selData.competency_ratings.map((c, i) => {
                            const req = parseFloat(c.required_level) || 0;
                            const act = parseFloat(c.end_year_rating_value) || 0;
                            const gap = act - req;
                            const pctS  = req > 0 ? Math.round(act / req * 100) : 0;
                            const st    = pctS >= 100 ? '✓ Exceeds' : pctS >= 80 ? '~ Meets' : '✗ Needs Development';
                            const stCls = pctS >= 100 ? 'text-emerald-600' : pctS >= 80 ? 'text-amber-600' : 'text-red-600';
                            return (
                              <tr key={i} className={`border-t ${dark ? 'border-gray-700' : 'border-gray-100'} ${i % 2 ? dark ? 'bg-gray-800/30' : 'bg-gray-50/40' : ''}`}>
                                <td className="px-3 py-2 text-gray-500">{c.main_group_name || c.competency_group_name || '—'}</td>
                                <td className="px-3 py-2 font-medium">{c.competency_name}</td>
                                <td className="px-3 py-2 text-center text-gray-500">{req || '—'}</td>
                                <td className="px-3 py-2">
                                  {c.end_year_rating_name ? <GradeBadge grade={c.end_year_rating_name} showLabel /> : <span className="text-gray-400">—</span>}
                                </td>
                                <td className="px-3 py-2 text-center font-semibold">{act || '—'}</td>
                                <td className="px-3 py-2 text-center">
                                  {req > 0 ? (
                                    <span className={`font-bold ${gap > 0 ? 'text-emerald-600' : gap < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                      {gap > 0 ? `+${gap}` : gap}
                                    </span>
                                  ) : '—'}
                                </td>
                                <td className={`px-3 py-2 text-xs font-medium ${stCls}`}>{st}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {!loadEmp && selId && !selData && (
                  <Card dark={dark} className="p-10 text-center">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-400" />
                    <p className="text-xs text-red-500 font-medium">No performance detail found for this employee</p>
                  </Card>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}