

// ═══════════════════════════════════════════════════════════════
// 2. CompetencyTab.jsx — tam fayl
// ═══════════════════════════════════════════════════════════════
"use client";
import { useState, useEffect } from "react";
import { competencyBonusConfigService } from "@/services/bonusService";
import { behavioralGroupsApi, leadershipMainGroupsApi } from "@/services/competencyApi";
import { Plus, Trash2, Save, Brain, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/Toast";
import SearchableDropdown from "@/components/common/SearchableDropdown";

export default function CompetencyTab({ bonusYear, dark }) {
  const { showSuccess, showError } = useToast();

  const [configs,      setConfigs]      = useState([]);
  const [behavGroups,  setBehavGroups]  = useState([]);
  const [leaderGroups, setLeaderGroups] = useState([]);
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState({ competency_type: "BEHAVIORAL", group_name: "", weight: "" });
  const [saving,       setSaving]       = useState(null);
  const [formError,    setFormError]    = useState("");
  const [loading,      setLoading]      = useState(true);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const inp   = dark
    ? "bg-[#0b0e16] border-white/[0.08] text-white focus:border-almet-steel-blue/50"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-almet-sapphire";
  const rowBg = dark ? "bg-white/[0.02] border-white/[0.06]" : "bg-gray-50 border-gray-200";

  const loadConfigs = async () => {
    const { data } = await competencyBonusConfigService.list(bonusYear.id);
    setConfigs(Array.isArray(data) ? data : (data.results ?? []));
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadConfigs();
        const [bRes, lRes] = await Promise.all([
          behavioralGroupsApi.getAll(),
          leadershipMainGroupsApi.getAll(),
        ]);
        setBehavGroups(Array.isArray(bRes) ? bRes : (bRes.results ?? []));
        setLeaderGroups(Array.isArray(lRes) ? lRes : (lRes.results ?? []));
      } finally { setLoading(false); }
    };
    init();
  }, [bonusYear.id]);

  const handleTypeChange = (type) => setForm({ ...form, competency_type: type, group_name: "" });

  const addedNames = new Set(
    configs.filter((c) => c.competency_type === form.competency_type).map((c) => c.group_name)
  );
  const availableGroups = (form.competency_type === "BEHAVIORAL" ? behavGroups : leaderGroups)
    .filter((g) => !addedNames.has(g.name));
  const dropdownOptions = availableGroups.map((g) => ({ value: g.name, label: g.name, id: g.id }));

  const handleCreate = async () => {
    if (!form.group_name) return setFormError("Please select a group.");
    if (!form.weight)     return setFormError("Please enter a weight.");
    setFormError("");
    try {
      await competencyBonusConfigService.create({ ...form, bonus_year: bonusYear.id });
      setShowForm(false);
      setForm({ competency_type: "BEHAVIORAL", group_name: "", weight: "" });
      await loadConfigs();
      showSuccess("Competency group added.");
    } catch { showError("Failed to add group."); }
  };

  // ── KÖHNƏ handleToggle silinir ──────────────────────────────
  // YENİ: type-level toggle ────────────────────────────────────
  const handleToggleType = async (type, currentAnyEnabled) => {
    // Əgər en az 1 enabled varsa → hamısını disable et; yoxsa → hamısını enable et
    const newVal = !currentAnyEnabled;
    setSaving(`type-${type}`);
    try {
      await competencyBonusConfigService.toggleType(bonusYear.id, type, newVal);
      await loadConfigs();
      showSuccess(`${type} competencies ${newVal ? "enabled" : "disabled"}.`);
    } catch { showError("Failed to toggle."); }
    finally { setSaving(null); }
  };

  const handleWeightSave = async (cfg, newWeight) => {
    setSaving(`w-${cfg.id}`);
    try {
      await competencyBonusConfigService.update(cfg.id, { weight: newWeight });
      await loadConfigs();
      showSuccess("Weight updated.");
    } catch { showError("Failed to update weight."); }
    finally { setSaving(null); }
  };

  const handleDelete = async (cfg) => {
    if (!confirm(`Remove "${cfg.group_name}" from bonus config?`)) return;
    setSaving(`d-${cfg.id}`);
    try {
      // Silmək əvəzinə disable (köhnə davranış saxlanır)
      await competencyBonusConfigService.update(cfg.id, { is_enabled: false });
      await loadConfigs();
      showSuccess(`"${cfg.group_name}" disabled.`);
    } catch { showError("Failed to remove group."); }
    finally { setSaving(null); }
  };

  const totalWeight = configs
    .filter((c) => c.is_enabled)
    .reduce((s, c) => s + parseFloat(c.weight || 0), 0);

  if (loading) return <LoadingSpinner message="Loading competency config…" />;

  // ── Section: type-level toggle düyməsi əlavə edildi ─────────
  const Section = ({ title, type, sourceGroups }) => {
    const items       = configs.filter((c) => c.competency_type === type);
    const activeCount = items.filter((i) => i.is_enabled).length;
    const anyEnabled  = activeCount > 0;
    const typeToggling = saving === `type-${type}`;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h3 className={`text-sm font-bold ${text}`}>{title}</h3>

          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border
            ${dark ? "bg-white/[0.04] border-white/[0.08] text-[#8a9bb8]" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
            {activeCount} active
          </span>

          <span className={`text-[11px] ${muted}`}>
            · {sourceGroups.length} available
          </span>

          {/* ── Global type toggle ── */}
          {items.length > 0 && (
            <button
              onClick={() => handleToggleType(type, anyEnabled)}
              disabled={typeToggling}
              className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all disabled:opacity-50
                ${anyEnabled
                  ? dark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                         : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  : dark ? "border-white/[0.08] text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/[0.04]"
                         : "border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              {anyEnabled
                ? <><ToggleRight size={14} /> Disable All</>
                : <><ToggleLeft  size={14} /> Enable All</>
              }
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className={`text-sm py-5 px-4 rounded-xl border-2 border-dashed text-center
            ${dark ? "border-white/[0.06] text-gray-600" : "border-gray-200 text-gray-400"}`}>
            No groups configured. Click <b className={text}>+ Add Group</b> to pick from {title}.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((cfg) => (
              <CompetencyRow
                key={cfg.id}
                cfg={cfg}
                // toggle per-row artıq yoxdur — yalnız weight edit + delete
                onWeightSave={handleWeightSave}
                onDelete={handleDelete}
                saving={saving}
                dark={dark} text={text} sub={sub} muted={muted} rowBg={rowBg} inp={inp}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${dark ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-200"}`}>
            <Brain size={18} className="text-indigo-400" />
          </div>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${text}`}>Competency Bonus Config</h2>
            <p className={`text-xs mt-1 ${sub}`}>
              Toggle competency groups and assign weights.
              {totalWeight > 0 && (
                <span className="ml-2 font-bold text-almet-steel-blue">
                  Total active: {totalWeight.toFixed(1)}%
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold transition-all shadow-lg shadow-almet-sapphire/25 hover:-translate-y-0.5"
        >
          <Plus size={15} />
          Add Group
        </button>
      </div>

      <Section title="Behavioral Competencies" type="BEHAVIORAL" sourceGroups={behavGroups} />
      <Section title="Leadership Competencies" type="LEADERSHIP" sourceGroups={leaderGroups} />

      {/* Add Group Modal — dəyişmədi */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden
            ${dark ? "bg-[#0e1119] border-white/[0.08]" : "bg-white border-gray-200"}`}>
            <div className={`px-6 py-4 border-b ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                  <Brain size={14} className="text-indigo-400" />
                </div>
                <h3 className={`text-base font-bold ${text}`}>Add Competency Group</h3>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={`text-xs font-semibold block mb-2 ${sub}`}>Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["BEHAVIORAL", "LEADERSHIP"].map((t) => (
                    <button key={t} onClick={() => handleTypeChange(t)}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition-all
                        ${form.competency_type === t
                          ? "bg-almet-sapphire border-almet-sapphire text-white shadow-md shadow-almet-sapphire/20"
                          : dark ? "border-white/[0.08] text-gray-400 hover:border-almet-steel-blue/40 hover:text-white"
                                 : "border-gray-200 text-gray-600 hover:border-almet-sapphire/40 hover:bg-almet-mystic"}`}
                    >
                      {t === "BEHAVIORAL" ? "Behavioral" : "Leadership"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`text-xs font-semibold block mb-2 ${sub}`}>
                  Group <span className={`ml-1 font-normal ${muted}`}>({availableGroups.length} available)</span>
                </label>
                <SearchableDropdown
                  options={dropdownOptions} value={form.group_name}
                  onChange={(val) => setForm({ ...form, group_name: val ?? "" })}
                  placeholder="— Select group —" searchPlaceholder="Search groups…"
                  darkMode={dark} allowUncheck={false}
                />
              </div>
              <div>
                <label className={`text-xs font-semibold block mb-2 ${sub}`}>Bonus Weight (%)</label>
                <div className="relative">
                  <input type="number" min={0} max={100} step={0.5} placeholder="e.g. 10"
                    value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className={`w-full px-4 py-2.5 pr-9 rounded-xl border text-sm outline-none transition ${inp}`}
                  />
                  <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${muted}`}>%</span>
                </div>
              </div>
            </div>
            {formError && (
              <div className="mx-6 mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle size={13} className="text-rose-400 mt-0.5 shrink-0" />
                <p className="text-xs text-rose-400">{formError}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 px-6 pb-6">
              <button onClick={() => { setShowForm(false); setFormError(""); }}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition
                  ${dark ? "border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.05]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                Cancel
              </button>
              <button onClick={handleCreate}
                className="px-5 py-2.5 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-semibold transition-all shadow-lg shadow-almet-sapphire/20">
                Add Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CompetencyRow — onToggle prop silindi, yalnız weight + delete ──────────
function CompetencyRow({ cfg, onWeightSave, onDelete, saving, dark, text, sub, muted, rowBg, inp }) {
  const [weight, setWeight] = useState(cfg.weight);
  const isDirty = String(weight) !== String(cfg.weight);

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all
      ${cfg.is_enabled ? rowBg : dark ? "bg-white/[0.01] border-white/[0.04] opacity-50" : "bg-gray-50/50 border-gray-100 opacity-50"}`}>

      {/* Enabled indicator — read-only dot (toggle artıq type-level-dədir) */}
      <div className={`w-2 h-2 rounded-full shrink-0
        ${cfg.is_enabled ? "bg-emerald-500" : dark ? "bg-white/20" : "bg-gray-300"}`} />

      {/* Name */}
      <span className={`flex-1 text-xs font-semibold truncate ${cfg.is_enabled ? text : muted}`}>
        {cfg.group_name}
      </span>

      {/* Type badge */}
      <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold shrink-0 border
        ${cfg.competency_type === "LEADERSHIP"
          ? dark ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-200"
          : dark ? "bg-sky-500/10 text-sky-400 border-sky-500/20"         : "bg-sky-50 text-sky-600 border-sky-200"
        }`}>
        {cfg.competency_type === "LEADERSHIP" ? "Leadership" : "Behavioral"}
      </span>

      {/* Weight input */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative">
          <input
            type="number" min={0} max={100} step={0.5}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={!cfg.is_enabled}
            className={`w-20 px-2 py-1.5 pr-6 rounded-xl border text-sm text-center outline-none transition
              disabled:opacity-40 ${inp}
              ${isDirty ? (dark ? "border-almet-steel-blue/50" : "border-almet-sapphire/50") : ""}`}
          />
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${muted}`}>%</span>
        </div>
        {isDirty && (
          <button
            onClick={() => onWeightSave(cfg, weight)}
            disabled={saving === `w-${cfg.id}`}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white disabled:opacity-50 transition-all shadow-sm"
          >
            <Save size={11} />
            {saving === `w-${cfg.id}` ? "…" : "Save"}
          </button>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(cfg)}
        disabled={!!saving}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0
          ${dark ? "text-gray-600 hover:text-rose-400 hover:bg-rose-500/10" : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"}
          disabled:opacity-40`}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}