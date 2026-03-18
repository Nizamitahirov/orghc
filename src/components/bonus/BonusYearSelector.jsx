"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar, Lock, CheckCircle } from "lucide-react";

export default function BonusYearSelector({ years, selected, onChange, dark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const list = Array.isArray(years) ? years : [];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all
          ${dark
            ? "bg-[#141414] border-[#2a2a2a] text-white hover:border-[#3a3a3a]"
            : "bg-white border-gray-200 text-almet-cloud-burst hover:border-almet-bali-hai shadow-sm"}`}
      >
        <Calendar size={14} className={dark ? "text-almet-steel-blue" : "text-almet-sapphire"} />
        <span>
          {selected ? selected.year : "Select year"}
        </span>
        {selected?.is_active && (
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold
            ${dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
            Active
          </span>
        )}
        {selected?.is_locked && (
          <Lock size={11} className="text-red-400" />
        )}
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1.5 right-0 z-50 min-w-[180px] rounded-xl border shadow-xl overflow-hidden
            ${dark ? "bg-[#161616] border-[#2a2a2a]" : "bg-white border-gray-200"}`}
        >
          <div className={`px-3 py-2 border-b ${dark ? "border-[#2a2a2a]" : "border-gray-100"}`}>
            <p className={`text-xs font-semibold ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>Bonus Year</p>
          </div>
          <div className="py-1">
            {list.length === 0 && (
              <p className={`text-center py-4 text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>No years available</p>
            )}
            {list.map((y) => {
              const isSelected = selected?.id === y.id;
              return (
                <button
                  key={y.id}
                  onClick={() => { onChange(y); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition
                    ${isSelected
                      ? dark ? "bg-almet-sapphire/20 text-white" : "bg-almet-mystic text-almet-sapphire"
                      : dark ? "text-gray-300 hover:bg-[#1f1f1f]" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <span className="font-semibold">{y.year}</span>
                  <div className="flex items-center gap-1.5">
                    {y.is_active && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold
                        ${dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                        Active
                      </span>
                    )}
                    {y.is_locked && <Lock size={11} className="text-red-400" />}
                    {isSelected && <CheckCircle size={13} className={dark ? "text-almet-steel-blue" : "text-almet-sapphire"} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}