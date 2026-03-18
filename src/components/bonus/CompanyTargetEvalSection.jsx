"use client";
import { useState, useEffect, useRef } from "react";
import {
  companyTargetService,
  targetEvaluationService,
  bonusEvalScaleService,
} from "@/services/bonusService";
import { CheckCircle, Target, ChevronDown, AlertTriangle, Building2, Star, Trash2 } from "lucide-react";

async function fetchBusinessFunctions() {
  const { default: api } = await import("@/services/api");
  const { data } = await api.get("/business-functions/");
  return Array.isArray(data) ? data : (data.results ?? []);
}

// ─── Inline Scale Reference ────────────────────────────────────────────────
function InlineScaleReference({ scales, dark }) {
  const [selected, setSelected] = useState(null);
  if (!scales || scales.length === 0) return null;

  return (
    <div className={`rounded-lg border mb-3 overflow-hidden
      ${dark ? "border-[#2a2a2a] bg-[#111]" : "border-gray-100 bg-gray-50"}`}>
      <div className={`flex items-center gap-1.5 px-3 py-2 border-b
        ${dark ? "border-[#2a2a2a]" : "border-gray-100"}`}>
        <Star size={11} className="text-almet-steel-blue" />
        <span className={`text-xs font-semibold ${dark ? "text-gray-400" : "text-almet-bali-hai"}`}>
          Evaluation Scale
        </span>
        <span className={`text-[10px] ml-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>
          — click to see description
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 px-3 py-2">
        {scales.map((scale) => {
          const isActive = selected?.id === scale.id;
          const isZero   = scale.is_zero_bonus === true;
          return (
            <button
              key={scale.id}
              onClick={() => setSelected(isActive ? null : scale)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all
                ${isActive
                  ? isZero
                    ? "ring-2 ring-red-500 bg-red-500/15 text-red-400"
                    : dark
                      ? "ring-2 ring-almet-steel-blue bg-almet-sapphire/20 text-white"
                      : "ring-2 ring-almet-sapphire bg-almet-mystic text-almet-sapphire"
                  : isZero
                    ? dark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"
                    : dark ? "bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a]"  : "bg-white border border-gray-200 text-almet-cloud-burst hover:bg-almet-mystic"
                }`}
            >
              {isZero && <AlertTriangle size={9} />}
              {scale.name}
              {scale.bonus_salary_pct != null && !isZero && (
                <span className={`ml-0.5 font-normal ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  {scale.bonus_salary_pct}%
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className={`mx-3 mb-2.5 px-3 py-2.5 rounded-lg border text-xs transition-all
          ${selected.is_zero_bonus
            ? dark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"
            : dark ? "bg-almet-sapphire/10 border-almet-sapphire/25 text-almet-bali-hai" : "bg-almet-sapphire/5 border-almet-sapphire/20 text-almet-waterloo"
          }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm">{selected.name}</span>
            <span className={`${dark ? "text-gray-500" : "text-gray-400"}`}>
              {selected.range_min}–{selected.range_max}%
            </span>
            {selected.bonus_salary_pct != null && (
              <span className={`ml-auto font-bold ${selected.is_zero_bonus ? "" : "text-emerald-500"}`}>
                {selected.is_zero_bonus ? "ZERO BONUS" : `${selected.bonus_salary_pct}% of salary`}
              </span>
            )}
          </div>
          <p className={`leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {selected.description || "No description available."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CompanyTargetEvalSection({ bonusYear, dark }) {
  const [targets,     setTargets]     = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [scales,      setScales]      = useState([]);
  const [bfList,      setBfList]      = useState([]);
  const [saving,      setSaving]      = useState(null);
  const [deleting,    setDeleting]    = useState(null); // NEW
  const [collapsed,   setCollapsed]   = useState(false);
  const [activeBf,    setActiveBf]    = useState("global");

  const evalKey = (targetId, bfId) => `${targetId}__${bfId ?? "global"}`;

  const evalMap = Object.fromEntries(
    evaluations.map((e) => [evalKey(e.company_target, e.business_function ?? "global"), e])
  );

  const loadEvaluations = async (yearId) => {
    const { data } = await targetEvaluationService.list(yearId);
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    setEvaluations(list);
  };

  useEffect(() => {
    Promise.all([
      companyTargetService.list(bonusYear.id),
      targetEvaluationService.list(bonusYear.id),
      bonusEvalScaleService.list(),
      fetchBusinessFunctions(),
    ]).then(([t, ev, sc, bf]) => {
      setTargets(Array.isArray(t.data) ? t.data : (t.data?.results ?? []));
      setScales(Array.isArray(sc.data) ? sc.data : (sc.data?.results ?? []));
      setBfList(bf);
      const evList = Array.isArray(ev.data) ? ev.data : (ev.data?.results ?? []);
      setEvaluations(evList);
    });
  }, [bonusYear.id]);

  const handleSave = async (target, ratingId, notes, bfId) => {
    const key      = evalKey(target.id, bfId);
    const existing = evalMap[key];
    setSaving(`${target.id}-${bfId ?? "g"}`);
    try {
      const payload = {
        bonus_year:        bonusYear.id,
        company_target:    target.id,
        rating:            ratingId || null,
        notes,
        business_function: bfId ?? null,
      };
      if (existing) {
        await targetEvaluationService.update(existing.id, payload);
      } else {
        await targetEvaluationService.create(payload);
      }
      await loadEvaluations(bonusYear.id);
    } finally {
      setSaving(null);
    }
  };

  // NEW: evaluation sil (rating-i təmizlə)
  const handleDelete = async (target, bfId) => {
    const key      = evalKey(target.id, bfId);
    const existing = evalMap[key];
    if (!existing) return;
    const deleteKey = `${target.id}-${bfId ?? "g"}`;
    setDeleting(deleteKey);
    try {
      await targetEvaluationService.delete(existing.id);
      await loadEvaluations(bonusYear.id);
    } finally {
      setDeleting(null);
    }
  };

  if (!targets.length) return null;

  const tabs = [
    { id: "global", label: "Global", sub: "Applies to all BFs without specific rating" },
    ...bfList.map((bf) => ({ id: bf.id, label: bf.code || bf.name, sub: bf.name })),
  ];

  const evaluatedCount = evaluations.filter((e) => e.rating).length;
  const hasZeroRating  = evaluations.some((e) => {
    if (!e.rating) return false;
    const sc = scales.find((s) => String(s.id) === String(e.rating));
    return sc?.is_zero_bonus === true;
  });

  return (
    <div className={`rounded-2xl border
      ${dark ? "bg-[#0f0f0f] border-[#1e1e1e]" : "bg-white border-gray-200 shadow-sm"}`}>

      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={`w-full flex items-center justify-between px-4 py-3 transition
          ${dark ? "hover:bg-[#141414]" : "hover:bg-gray-50/70"}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${dark ? "bg-almet-sapphire/20" : "bg-almet-mystic"}`}>
            <Target size={15} className="text-almet-steel-blue" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
              Company Target Evaluations
            </p>
            <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-almet-bali-hai"}`}>
              {evaluatedCount} rating(s) across {tabs.length} scope(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasZeroRating && (
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
              ${dark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-600 border border-red-200"}`}>
              <AlertTriangle size={11} /> Zero Bonus Active
            </span>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${collapsed ? "-rotate-90" : ""} ${dark ? "text-gray-500" : "text-gray-400"}`}
          />
        </div>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className={`border-t ${dark ? "border-[#1e1e1e]" : "border-gray-100"}`}>

          {/* BF Tab strip */}
          <div className="flex gap-1 px-4 pt-3 pb-0 overflow-x-auto">
            {tabs.map((t) => {
              const isActive  = activeBf === t.id;
              const ratedHere = targets.filter((tgt) => {
                const ev = evalMap[evalKey(tgt.id, t.id === "global" ? "global" : t.id)];
                return ev?.rating;
              }).length;
              const hasZeroHere = targets.some((tgt) => {
                const ev = evalMap[evalKey(tgt.id, t.id === "global" ? "global" : t.id)];
                if (!ev?.rating) return false;
                const sc = scales.find((s) => String(s.id) === String(ev.rating));
                return sc?.is_zero_bonus;
              });
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveBf(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl border-b-2 text-xs font-semibold whitespace-nowrap transition-all
                    ${isActive
                      ? dark  ? "border-almet-steel-blue text-white bg-[#141414]"
                              : "border-almet-sapphire text-almet-sapphire bg-almet-mystic/50"
                      : dark  ? "border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#141414]"
                              : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {t.id === "global" ? <Target size={12} /> : <Building2 size={12} />}
                  {t.label}
                  {ratedHere > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none
                      ${hasZeroHere
                        ? "bg-red-500/20 text-red-400"
                        : dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                      }`}>
                      {ratedHere}/{targets.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scope description */}
          <div className="px-4 pt-2 pb-1">
            <p className={`text-[11px] ${dark ? "text-gray-600" : "text-gray-400"}`}>
              {activeBf === "global"
                ? "Global ratings apply to employees whose business function has no specific rating set."
                : `Ratings here apply only to employees in "${tabs.find((t) => t.id === activeBf)?.sub}".`
              }
            </p>
          </div>

          {/* InlineScaleReference */}
          <div className="px-5 pt-3">
            <InlineScaleReference scales={scales} dark={dark} />
          </div>

          {/* Cards */}
          <div className="px-5 pb-5 pt-1">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {targets.map((target) => {
                const bfIdForKey = activeBf === "global" ? "global" : activeBf;
                const evaluation = evalMap[evalKey(target.id, bfIdForKey)];
                const deleteKey  = `${target.id}-${activeBf === "global" ? "g" : activeBf}`;
                return (
                  <TargetCard
                    key={`${target.id}-${activeBf}`}
                    target={target}
                    evaluation={evaluation}
                    scales={scales}
                    saving={saving === deleteKey}
                    deleting={deleting === deleteKey}
                    onSave={(t, rId, notes) =>
                      handleSave(t, rId, notes, activeBf === "global" ? null : activeBf)
                    }
                    onDelete={(t) =>
                      handleDelete(t, activeBf === "global" ? null : activeBf)
                    }
                    dark={dark}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RatingDropdown ─────────────────────────────────────────────────────────
function RatingDropdown({ scales, value, onChange, dark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const selected  = scales.find((s) => String(s.id) === String(value));
  const isZeroSel = selected?.is_zero_bonus === true;
  const base       = dark ? "bg-[#1a1a1a] border-[#2e2e2e] text-white"    : "bg-gray-50 border-gray-200 text-gray-900";
  const zeroBorder = dark ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-red-300 bg-red-50 text-red-600";

  return (
    <div ref={ref} className="relative mb-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm outline-none transition font-medium
          ${isZeroSel ? zeroBorder : base}
          ${dark ? "hover:border-[#3e3e3e]" : "hover:border-almet-bali-hai"}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {isZeroSel && <AlertTriangle size={13} className="shrink-0" />}
          {selected ? (
            <>
              <span className="font-semibold">{selected.name}</span>
              <span className={`text-xs shrink-0 ${isZeroSel ? "font-bold uppercase tracking-wide" : "opacity-60"}`}>
                {isZeroSel ? "— ZERO BONUS" : selected.bonus_salary_pct != null ? `— ${selected.bonus_salary_pct}%` : "— no % set"}
              </span>
            </>
          ) : (
            <span className={dark ? "text-gray-500" : "text-gray-400"}>— Select rating —</span>
          )}
        </span>
        <ChevronDown size={13} className={`transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""} ${dark ? "text-gray-500" : "text-gray-400"}`} />
      </button>

      {open && (
        <div className={`absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border shadow-xl
          ${dark ? "bg-[#161616] border-[#2e2e2e]" : "bg-white border-gray-200"}`}>
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm transition
              ${dark ? "text-gray-500 hover:bg-[#1f1f1f]" : "text-gray-400 hover:bg-gray-50"}`}
          >
            — Select rating —
          </button>
          {scales.map((s) => {
            const isZero     = s.is_zero_bonus === true;
            const isSelected = String(s.id) === String(value);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { onChange(String(s.id)); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition
                  ${isSelected
                    ? isZero
                      ? dark ? "bg-red-500/20 text-red-400"     : "bg-red-50 text-red-600"
                      : dark ? "bg-almet-sapphire/20 text-white" : "bg-almet-mystic text-almet-sapphire"
                    : isZero
                      ? dark ? "text-red-400/80 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"
                      : dark ? "text-gray-300 hover:bg-[#1f1f1f]"    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  {isZero && <AlertTriangle size={12} className="shrink-0" />}
                  {s.name}
                </span>
                <span className={`text-xs font-bold shrink-0 ${isZero ? dark ? "text-red-400" : "text-red-500" : dark ? "text-gray-500" : "text-gray-400"}`}>
                  {isZero ? "ZERO BONUS" : s.bonus_salary_pct != null ? `${s.bonus_salary_pct}%` : "no % set"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TargetCard ─────────────────────────────────────────────────────────────
function TargetCard({ target, evaluation, scales, saving, deleting, onSave, onDelete, dark }) {
  const [ratingId,   setRatingId]   = useState(evaluation?.rating ? String(evaluation.rating) : "");
  const [notes,      setNotes]      = useState(evaluation?.notes  ?? "");
  const [confirmDel, setConfirmDel] = useState(false); // NEW

  useEffect(() => {
    setRatingId(evaluation?.rating ? String(evaluation.rating) : "");
    setNotes(evaluation?.notes ?? "");
    setConfirmDel(false);
  }, [evaluation?.id, evaluation?.rating, evaluation?.notes]);

  const isDirty    = ratingId !== String(evaluation?.rating ?? "") || notes !== (evaluation?.notes ?? "");
  const isRated    = Boolean(evaluation?.rating);
  const selScale   = scales.find((s) => String(s.id) === ratingId);
  const isZero     = selScale?.is_zero_bonus === true;
  const savedScale = isRated ? scales.find((s) => String(s.id) === String(evaluation.rating)) : null;
  const savedIsZero = savedScale?.is_zero_bonus === true;

  const inp = dark
    ? "bg-[#1a1a1a] border-[#2e2e2e] text-white placeholder-gray-600 focus:border-almet-steel-blue"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire focus:bg-white";

  return (
    <div className={`rounded-xl border p-3 transition
      ${savedIsZero && !isDirty
        ? dark ? "bg-[#111] border-red-500/30"       : "bg-red-50/40 border-red-200"
        : isRated && !isDirty
          ? dark ? "bg-[#111] border-emerald-500/20" : "bg-emerald-50/30 border-emerald-200"
          : dark ? "bg-[#111] border-[#1e1e1e]"      : "bg-white border-gray-100 shadow-sm"}`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={`text-sm font-semibold leading-snug ${dark ? "text-white" : "text-almet-cloud-burst"}`}>
          {target.name}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {/* DELETE button — yalnız saved evaluation varsa göstər */}
          {isRated && !isDirty && (
            confirmDel ? (
              // Confirm state
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(target); setConfirmDel(false); }}
                  disabled={deleting}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition
                    ${dark ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                >
                  {deleting ? "…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition
                    ${dark ? "bg-[#2a2a2a] text-gray-400 hover:bg-[#333]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDel(true)}
                title="Delete evaluation"
                className={`p-1 rounded-lg transition opacity-0 group-hover:opacity-100
                  ${dark ? "hover:bg-red-500/15 text-gray-600 hover:text-red-400" : "hover:bg-red-50 text-gray-300 hover:text-red-500"}`}
                style={{ opacity: 0.5 }}
              >
                <Trash2 size={13} />
              </button>
            )
          )}
          {savedIsZero && !isDirty && !confirmDel && <AlertTriangle size={15} className="text-red-500" />}
          {isRated && !isDirty && !savedIsZero && !confirmDel && <CheckCircle size={15} className="text-emerald-500" />}
        </div>
      </div>

      {savedIsZero && !isDirty && (
        <div className={`mb-2 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5
          ${dark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-600"}`}>
          <AlertTriangle size={11} />
          This rating zeroes out all employee bonuses
        </div>
      )}

      <RatingDropdown scales={scales} value={ratingId} onChange={setRatingId} dark={dark} />

      {selScale && isDirty && (
        <div className={`mb-2 px-3 py-2 rounded-lg text-xs flex items-center justify-between
          ${isZero
            ? dark ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/30" : "bg-red-50 text-red-600 ring-1 ring-red-200"
            : dark ? "bg-almet-sapphire/15 text-almet-steel-blue"        : "bg-almet-mystic text-almet-sapphire"}`}
        >
          <span className="font-semibold flex items-center gap-1.5">
            {isZero && <AlertTriangle size={11} />}
            {selScale.name}
          </span>
          {isZero
            ? <span className="font-bold uppercase tracking-wide text-xs">All bonuses → 0</span>
            : selScale.bonus_salary_pct != null ? <span className="font-bold">{selScale.bonus_salary_pct}%</span> : null
          }
        </div>
      )}

      <input
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition mb-2.5 ${inp}`}
      />

      {isDirty && (
        <button
          onClick={() => onSave(target, ratingId ? parseInt(ratingId) : null, notes)}
          disabled={saving || !ratingId}
          className={`w-full py-2 rounded-lg text-white text-xs font-semibold disabled:opacity-50 transition
            ${isZero ? "bg-red-600 hover:bg-red-700" : dark ? "bg-almet-sapphire hover:bg-almet-steel-blue" : "bg-almet-sapphire hover:bg-almet-astral"}`}
        >
          {saving ? "Saving…" : isZero ? "⚠ Save — This will zero all bonuses" : "Save Rating"}
        </button>
      )}
    </div>
  );
}