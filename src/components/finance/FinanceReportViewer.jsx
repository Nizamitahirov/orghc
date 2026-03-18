// components/finance/FinanceReportViewer.jsx
"use client";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const C = {
  primary: "#1a3c5e",
  accent:  "#c8992a",
  bg:      "#f4f6f9",
  card:    "#ffffff",
  border:  "#e2e8f0",
  text:    "#1e293b",
  muted:   "#64748b",
  pos:     "#16a34a",
  neg:     "#dc2626",
};
const PALETTE = ["#1a3c5e","#c8992a","#2563eb","#16a34a","#9333ea","#ea580c","#0891b2","#be185d"];

const SHEET_ICONS = { pl: "📈", bs: "⚖️", cf: "💵", general: "📋" };
const SHEET_LABELS = { pl: "P&L", bs: "Balance Sheet", cf: "Cash Flow", general: "Data" };

function fmt(v) {
  const n = Number(v);
  if (isNaN(n)) return v;
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (Math.abs(n) >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function isNum(v) {
  if (v === "" || v === null || v === undefined) return false;
  return !isNaN(Number(String(v).replace(/,/g, "")));
}

// ── KPI Cards ──────────────────────────────────────────────
function KPICards({ kpis }) {
  const entries = Object.entries(kpis).slice(0, 5);
  if (!entries.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(entries.length, 5)}, 1fr)`, gap: 10, marginBottom: 16 }}>
      {entries.map(([label, value], i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", borderLeft: `3px solid ${i % 2 === 0 ? C.primary : C.accent}` }}>
          <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: Number(value) < 0 ? C.neg : C.text, marginTop: 4 }}>{fmt(value)}</div>
        </div>
      ))}
    </div>
  );
}

// ── Chart ──────────────────────────────────────────────────
function SheetChart({ headers, rows }) {
  const [type, setType] = useState("bar");

  const { data, numCols } = useMemo(() => {
    const numIdxs = headers.map((_, i) => i).filter(i => {
      const vals = rows.map(r => r[i]).filter(v => v !== "");
      return vals.length > 0 && vals.filter(v => isNum(v)).length / vals.length > 0.5;
    });
    const labelIdx = headers.findIndex((_, i) => !numIdxs.includes(i));
    if (labelIdx === -1 || !numIdxs.length) return { data: [], numCols: [] };

    const d = rows.slice(0, 20).map(r => {
      const obj = { _label: String(r[labelIdx] ?? "").slice(0, 20) };
      numIdxs.forEach(i => { obj[headers[i]] = Number(String(r[i]).replace(/,/g, "")) || 0; });
      return obj;
    }).filter(d => d._label);

    return { data: d, numCols: numIdxs.map(i => headers[i]) };
  }, [headers, rows]);

  if (data.length < 2) return <div style={{ fontSize: 11, color: C.muted, textAlign: "center", padding: 24 }}>Chart üçün kifayət qədər məlumat yoxdur</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["bar","📊 Bar"],["line","📈 Line"],["pie","🥧 Pie"]].map(([t, label]) => (
          <button key={t} onClick={() => setType(t)} style={{ padding: "4px 12px", fontSize: 10, borderRadius: 20, border: `1px solid ${type === t ? C.primary : C.border}`, background: type === t ? C.primary : "#fff", color: type === t ? "#fff" : C.muted, cursor: "pointer" }}>{label}</button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        {type === "bar" ? (
          <BarChart data={data} margin={{ top: 4, right: 16, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="_label" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 9 }} tickFormatter={fmt} />
            <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {numCols.slice(0, 4).map((col, i) => (
              <Bar key={col} dataKey={col} fill={PALETTE[i % PALETTE.length]} radius={[3,3,0,0]} />
            ))}
          </BarChart>
        ) : type === "line" ? (
          <LineChart data={data} margin={{ top: 4, right: 16, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="_label" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 9 }} tickFormatter={fmt} />
            <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {numCols.slice(0, 4).map((col, i) => (
              <Line key={col} dataKey={col} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        ) : (
          <PieChart>
            <Pie data={data.slice(0, 8)} dataKey={numCols[0]} nameKey="_label" cx="50%" cy="50%" outerRadius={100}
              label={({ _label, percent }) => `${_label} ${(percent * 100).toFixed(0)}%`}>
              {data.slice(0, 8).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip formatter={fmt} contentStyle={{ fontSize: 11 }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// ── Table ──────────────────────────────────────────────────
function DataTable({ headers, rows }) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const PER = 20;

  const filtered = useMemo(() => {
    if (!search) return rows;
    return rows.filter(r => r.some(c => String(c).toLowerCase().includes(search.toLowerCase())));
  }, [rows, search]);

  const pages = Math.ceil(filtered.length / PER);
  const visible = filtered.slice(page * PER, page * PER + PER);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: C.muted }}>{filtered.length} sətir</span>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Axtar..."
          style={{ fontSize: 11, padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", width: 180 }}
        />
      </div>
      <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${C.border}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: C.primary }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: "8px 10px", color: "#fff", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: `1px solid ${C.border}` }}>
                {headers.map((_, ci) => {
                  const val = row[ci] ?? "";
                  const num = isNum(val) && val !== "";
                  const n   = Number(String(val).replace(/,/g, ""));
                  return (
                    <td key={ci} style={{ padding: "6px 10px", color: num ? (n < 0 ? C.neg : C.text) : C.text, fontWeight: num ? 500 : 400, textAlign: num ? "right" : "left", whiteSpace: "nowrap" }}>
                      {num ? fmt(val) : String(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={headers.length} style={{ padding: 20, textAlign: "center", color: C.muted, fontSize: 11 }}>Nəticə tapılmadı</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 8, alignItems: "center" }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "3px 8px", fontSize: 10, background: page === 0 ? C.border : C.primary, color: page === 0 ? C.muted : "#fff", border: "none", borderRadius: 4, cursor: page === 0 ? "default" : "pointer" }}>‹ Əvvəl</button>
          <span style={{ fontSize: 10, color: C.muted }}>{page + 1} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1} style={{ padding: "3px 8px", fontSize: 10, background: page === pages - 1 ? C.border : C.primary, color: page === pages - 1 ? C.muted : "#fff", border: "none", borderRadius: 4, cursor: page === pages - 1 ? "default" : "pointer" }}>Sonra ›</button>
        </div>
      )}
    </div>
  );
}

// ── Sheet panel ────────────────────────────────────────────
function SheetPanel({ sheet }) {
  const [tab, setTab] = useState("table");
  const { sheet_name, sheet_type, headers, rows, kpis } = sheet;

  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 16 }}>
      {/* Sheet header */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{SHEET_ICONS[sheet_type]}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{sheet_name}</div>
            <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{SHEET_LABELS[sheet_type]} · {rows.length} sətir · {headers.length} sütun</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["table","chart"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "4px 12px", fontSize: 10, borderRadius: 20, border: `1px solid ${tab === t ? C.primary : C.border}`, background: tab === t ? C.primary : "#fff", color: tab === t ? "#fff" : C.muted, cursor: "pointer" }}>
              {t === "table" ? "📋 Cədvəl" : "📊 Chart"}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ padding: "14px 16px 0" }}>
        <KPICards kpis={kpis} />
      </div>

      {/* Tab content */}
      <div style={{ padding: "0 16px 16px" }}>
        {tab === "table"
          ? <DataTable headers={headers} rows={rows} />
          : <SheetChart headers={headers} rows={rows} />
        }
      </div>
    </div>
  );
}

// ── Main viewer ────────────────────────────────────────────
export default function FinanceReportViewer({ report }) {
  const [activeSheet, setActiveSheet] = useState(null); // null = all

  const visibleSheets = activeSheet === null
    ? report.sheets
    : report.sheets.filter(s => s.id === activeSheet);

  return (
    <div style={{ padding: 20 }}>
      {/* Report title */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.primary, margin: 0 }}>{report.name}</h2>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
          {report.uploaded_by_name} · {new Date(report.uploaded_at).toLocaleDateString("az-AZ", { day:"2-digit", month:"long", year:"numeric" })} · {report.sheets.length} sheet
        </div>
      </div>

      {/* Sheet tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <button
          onClick={() => setActiveSheet(null)}
          style={{ padding: "5px 12px", fontSize: 10, borderRadius: 20, border: `1px solid ${activeSheet === null ? C.primary : C.border}`, background: activeSheet === null ? C.primary : "#fff", color: activeSheet === null ? "#fff" : C.muted, cursor: "pointer" }}
        >
          Hamısı
        </button>
        {report.sheets.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSheet(s.id)}
            style={{ padding: "5px 12px", fontSize: 10, borderRadius: 20, border: `1px solid ${activeSheet === s.id ? C.primary : C.border}`, background: activeSheet === s.id ? C.primary : "#fff", color: activeSheet === s.id ? "#fff" : C.muted, cursor: "pointer" }}
          >
            {SHEET_ICONS[s.sheet_type]} {s.sheet_name}
          </button>
        ))}
      </div>

      {/* Sheets */}
      {visibleSheets.map(s => <SheetPanel key={s.id} sheet={s} />)}
    </div>
  );
}