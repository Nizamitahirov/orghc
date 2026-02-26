// ─────────────────────────────────────────────────────────────
// components/bonus/main/CompanyTargetEvalSection.jsx
// Ümumi şirkət hədəfi qiymətləndirməsi (işçiyə görə deyil)
// ─────────────────────────────────────────────────────────────
"use client";
import { useState, useEffect } from "react";
import {
  companyTargetService,
  targetEvaluationService,
} from "@/services/bonusService";
import api from "@/services/api";

export default function CompanyTargetEvalSection({ bonusYear, dark }) {
  const [targets, setTargets]         = useState([]);
  const [evaluations, setEvaluations] = useState({});  // target_id → eval object
  const [scales, setScales]           = useState([]);
  const [saving, setSaving]           = useState(null);

  const text  = dark ? "text-white"    : "text-gray-900";
  const sub   = dark ? "text-gray-400" : "text-gray-500";
  const input = dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white"
    : "bg-white border-gray-300 text-gray-900";

  useEffect(() => {
    // Load targets, evaluations and evaluation scales in parallel
    Promise.all([
      companyTargetService.list(bonusYear.id),
      targetEvaluationService.list(bonusYear.id),
      api.get("/performance/evaluation-scales/"),      // mövcud endpoint
    ]).then(([t, ev, sc]) => {
      setTargets(t.data);
      setScales(sc.data);
      // Map target_id → evaluation
      const evMap = {};
      ev.data.forEach((e) => { evMap[e.company_target] = e; });
      setEvaluations(evMap);
    });
  }, [bonusYear.id]);

  const handleSave = async (target, ratingId, notes) => {
    setSaving(target.id);
    const existing = evaluations[target.id];
    try {
      if (existing) {
        await targetEvaluationService.update(existing.id, {
          rating: ratingId, notes,
        });
      } else {
        await targetEvaluationService.create({
          bonus_year: bonusYear.id,
          company_target: target.id,
          rating: ratingId,
          notes,
        });
      }
      const { data } = await targetEvaluationService.list(bonusYear.id);
      const evMap = {};
      data.forEach((e) => { evMap[e.company_target] = e; });
      setEvaluations(evMap);
    } finally {
      setSaving(null);
    }
  };

  if (!targets.length) return null;

  return (
    <div>
      <h2 className={`text-sm font-semibold mb-3 ${text}`}>
        Company Target Evaluations
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {targets.map((target) => {
          const ev = evaluations[target.id];
          return (
            <TargetEvalCard
              key={target.id}
              target={target}
              evaluation={ev}
              scales={scales}
              saving={saving === target.id}
              onSave={handleSave}
              dark={dark} text={text} sub={sub} input={input}
            />
          );
        })}
      </div>
    </div>
  );
}

function TargetEvalCard({ target, evaluation, scales, saving, onSave, dark, text, sub, input }) {
  const [ratingId, setRatingId] = useState(evaluation?.rating || "");
  const [notes, setNotes]       = useState(evaluation?.notes || "");
  const isDirty = ratingId !== (evaluation?.rating || "") || notes !== (evaluation?.notes || "");

  const cardBg = dark ? "bg-[#0f0f0f] border-[#1f1f1f]" : "bg-gray-50 border-gray-200";

  return (
    <div className={`rounded-lg border p-3 ${cardBg}`}>
      <p className={`text-sm font-medium mb-2 ${text}`}>{target.name}</p>
      <select
        value={ratingId}
        onChange={(e) => setRatingId(e.target.value)}
        className={`w-full px-2 py-1.5 rounded border text-sm outline-none mb-2 ${input}`}
      >
        <option value="">— Select Rating —</option>
        {scales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.range_min}–{s.range_max}%)
          </option>
        ))}
      </select>
      <input
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={`w-full px-2 py-1 rounded border text-xs outline-none mb-2 ${input}`}
      />
      {isDirty && (
        <button
          onClick={() => onSave(target, parseInt(ratingId), notes)}
          disabled={saving || !ratingId}
          className="w-full py-1 rounded bg-blue-600 hover:bg-blue-700 text-white
            text-xs font-medium disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      )}
      {evaluation?.rating_name && !isDirty && (
        <span className="inline-block px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">
          {evaluation.rating_name}
        </span>
      )}
    </div>
  );
}

