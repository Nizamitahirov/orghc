
// ─────────────────────────────────────────────────────────────
// components/bonus/common/BonusYearSelector.jsx
// ─────────────────────────────────────────────────────────────
"use client";
export default function BonusYearSelector({ years, selected, onChange, dark }) {
  const input = dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white"
    : "bg-white border-gray-300 text-gray-900";

  const list = Array.isArray(years) ? years : [];

  return (
    <select
      value={selected?.id || ""}
      onChange={(e) => {
        const y = list.find((yr) => yr.id === parseInt(e.target.value));
        if (y) onChange(y);
      }}
      className={`px-3 py-1.5 rounded-lg border text-sm outline-none ${input}`}
    >
      {list.map((y) => (
        <option key={y.id} value={y.id}>
          {y.year} {y.is_active ? "✓" : ""} {y.is_locked ? "🔒" : ""}
        </option>
      ))}
    </select>
  );
}

