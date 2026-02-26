"use client";
/**
 * CompetencyTab
 * - Behavioral group names come from  GET /competency/behavioral-groups/
 * - Leadership group names come from  GET /competency/leadership-main-groups/
 * - On "Add Group" the admin picks from a dropdown — no manual typing.
 * - Each row: ON/OFF toggle  |  group name  |  type badge  |  weight input  |  delete
 */
import { useState, useEffect } from "react";
import { competencyBonusConfigService } from "@/services/bonusService";
import { behavioralGroupsApi, leadershipMainGroupsApi } from "@/services/competencyApi";
import { Plus, Trash2, Save } from "lucide-react";

export default function CompetencyTab({ bonusYear, dark }) {
  const [configs, setConfigs]         = useState([]);
  const [behavGroups, setBehavGroups] = useState([]);   // from competency API
  const [leaderGroups, setLeaderGroups] = useState([]); // from competency API
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ competency_type: "BEHAVIORAL", group_name: "", weight: "" });
  const [saving, setSaving]           = useState(null);
  const [formError, setFormError]     = useState("");

  const text  = dark ? "text-white"    : "text-gray-900";
  const sub   = dark ? "text-gray-400" : "text-gray-500";
  const input = dark
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white focus:border-almet-steel-blue"
    : "bg-white border-gray-300 text-gray-900 focus:border-almet-sapphire";
  const rowBg = dark ? "bg-[#0f0f0f] border-[#1f1f1f]" : "bg-gray-50 border-gray-200";

  // ── Load configs + competency group lists ──────────────────
  const loadConfigs = () =>
    competencyBonusConfigService.list(bonusYear.id).then(({ data }) =>
      setConfigs(Array.isArray(data) ? data : (data.results ?? []))
    );

  useEffect(() => {
    loadConfigs();
    behavioralGroupsApi.getAll().then((res) => {
      const list = Array.isArray(res) ? res : (res.results ?? []);
      setBehavGroups(list);
    });
    leadershipMainGroupsApi.getAll().then((res) => {
      const list = Array.isArray(res) ? res : (res.results ?? []);
      setLeaderGroups(list);
    });
  }, [bonusYear.id]);

  // Reset group_name when type changes
  const handleTypeChange = (type) =>
    setForm({ ...form, competency_type: type, group_name: "" });

  // Available groups for the selected type (exclude already-added ones)
  const addedNames = new Set(
    configs
      .filter((c) => c.competency_type === form.competency_type)
      .map((c) => c.group_name)
  );

  const availableGroups =
    form.competency_type === "BEHAVIORAL"
      ? behavGroups.filter((g) => !addedNames.has(g.name))
      : leaderGroups.filter((g) => !addedNames.has(g.name));

  // ── CRUD handlers ──────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.group_name) return setFormError("Please select a group.");
    if (!form.weight)     return setFormError("Please enter a weight.");
    setFormError("");
    await competencyBonusConfigService.create({ ...form, bonus_year: bonusYear.id });
    setShowForm(false);
    setForm({ competency_type: "BEHAVIORAL", group_name: "", weight: "" });
    loadConfigs();
  };

  const handleToggle = async (cfg) => {
    setSaving(cfg.id);
    await competencyBonusConfigService.toggle(cfg.id);
    await loadConfigs();
    setSaving(null);
  };

  const handleWeightSave = async (cfg, newWeight) => {
    setSaving(`w-${cfg.id}`);
    await competencyBonusConfigService.update(cfg.id, { weight: newWeight });
    await loadConfigs();
    setSaving(null);
  };

  const handleDelete = async (cfg) => {
    if (!confirm(`Remove "${cfg.group_name}" from bonus config?`)) return;
    setSaving(`d-${cfg.id}`);
    // Use a DELETE endpoint if available, otherwise disable
    try {
      await competencyBonusConfigService.update(cfg.id, { is_enabled: false });
    } catch { /* ignore */ }
    await loadConfigs();
    setSaving(null);
  };

  const totalWeight = configs
    .filter((c) => c.is_enabled)
    .reduce((s, c) => s + parseFloat(c.weight || 0), 0);

  // ── Section renderer ───────────────────────────────────────
  const Section = ({ title, type, sourceGroups }) => {
    const items = configs.filter((c) => c.competency_type === type);
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className={`text-sm font-semibold ${text}`}>{title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full
            ${dark ? "bg-[#1f1f1f] text-gray-400" : "bg-gray-100 text-gray-500"}`}>
            {items.filter((i) => i.is_enabled).length} active
          </span>
          <span className={`text-xs ${sub}`}>
            — {sourceGroups.length} groups available from API
          </span>
        </div>

        {items.length === 0 ? (
          <div className={`text-sm ${sub} py-3 px-4 rounded-xl border border-dashed
            ${dark ? "border-[#2a2a2a]" : "border-gray-300"}`}>
            No groups configured yet. Click <b>+ Add Group</b> to pick from existing {title}.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((cfg) => (
              <CompetencyRow
                key={cfg.id}
                cfg={cfg}
                onToggle={handleToggle}
                onWeightSave={handleWeightSave}
                onDelete={handleDelete}
                saving={saving}
                dark={dark} text={text} sub={sub} rowBg={rowBg} input={input}
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className={`text-base font-semibold ${text}`}>Competency Bonus Config</h2>
          <p className={`text-sm mt-0.5 ${sub}`}>
            Toggle competency groups on/off and assign their weight in bonus calculation.
            {totalWeight > 0 && (
              <span className="ml-2 font-medium text-almet-steel-blue">
                Total active weight: {totalWeight.toFixed(1)}%
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(""); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-medium transition"
        >
          <Plus size={14} /> Add Group
        </button>
      </div>

      <Section title="Behavioral Competencies" type="BEHAVIORAL" sourceGroups={behavGroups} />
      <Section title="Leadership Competencies" type="LEADERSHIP" sourceGroups={leaderGroups} />

      {/* ── Add Group Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6
            ${dark ? "bg-[#111] border-[#1f1f1f]" : "bg-white border-gray-200"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${text}`}>Add Competency Group</h3>

            <div className="space-y-3">
              {/* Type selector */}
              <div>
                <label className={`text-xs font-medium block mb-1 ${sub}`}>Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["BEHAVIORAL", "LEADERSHIP"].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTypeChange(t)}
                      className={`py-2 rounded-lg border text-xs font-medium transition
                        ${form.competency_type === t
                          ? "bg-almet-sapphire border-almet-sapphire text-white"
                          : dark ? "border-[#2a2a2a] text-gray-400 hover:border-almet-steel-blue" : "border-gray-300 text-gray-600 hover:border-almet-sapphire"
                        }`}
                    >
                      {t === "BEHAVIORAL" ? "Behavioral" : "Leadership"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group dropdown — from API */}
              <div>
                <label className={`text-xs font-medium block mb-1 ${sub}`}>
                  Group
                  <span className={`ml-1 font-normal ${sub}`}>
                    ({availableGroups.length} available)
                  </span>
                </label>
                <select
                  value={form.group_name}
                  onChange={(e) => setForm({ ...form, group_name: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${input}`}
                >
                  <option value="">— Select group —</option>
                  {availableGroups.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                  {availableGroups.length === 0 && (
                    <option disabled>All groups already added</option>
                  )}
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className={`text-xs font-medium block mb-1 ${sub}`}>Bonus Weight (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0} max={100} step={0.5}
                    placeholder="e.g. 10"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className={`flex-1 px-3 py-2.5 rounded-lg border text-sm outline-none ${input}`}
                  />
                  <span className={`text-sm ${sub}`}>%</span>
                </div>
              </div>
            </div>

            {formError && (
              <p className="mt-3 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{formError}</p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowForm(false)}
                className={`px-4 py-2 rounded-lg border text-sm transition
                  ${dark ? "border-[#2a2a2a] text-gray-400 hover:text-white" : "border-gray-300 text-gray-600"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-sm font-medium transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Row component ─────────────────────────────────────────────
function CompetencyRow({ cfg, onToggle, onWeightSave, onDelete, saving, dark, text, sub, rowBg, input }) {
  const [weight, setWeight] = useState(cfg.weight);
  const isDirty = String(weight) !== String(cfg.weight);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${rowBg}`}>
      {/* Toggle */}
      <button
        onClick={() => onToggle(cfg)}
        disabled={saving === cfg.id}
        title={cfg.is_enabled ? "Click to disable" : "Click to enable"}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0
          ${cfg.is_enabled ? "bg-green-500" : dark ? "bg-[#2a2a2a]" : "bg-gray-300"}
          disabled:opacity-50`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200
          ${cfg.is_enabled ? "left-[calc(100%-22px)]" : "left-0.5"}`} />
      </button>

      {/* Name */}
      <span className={`flex-1 text-sm truncate ${cfg.is_enabled ? text : sub}`}>
        {cfg.group_name}
      </span>

      {/* Type badge */}
      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0
        ${cfg.competency_type === "LEADERSHIP"
          ? dark ? "bg-purple-500/20 text-purple-400" : "bg-purple-50 text-purple-600"
          : dark ? "bg-blue-500/20 text-blue-400"   : "bg-blue-50 text-blue-600"
        }`}>
        {cfg.competency_type === "LEADERSHIP" ? "Leadership" : "Behavioral"}
      </span>

      {/* Weight input */}
      <div className="flex items-center gap-1.5">
        <input
          type="number" min={0} max={100} step={0.5}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          disabled={!cfg.is_enabled}
          className={`w-20 px-2 py-1.5 rounded-lg border text-sm text-center outline-none transition
            disabled:opacity-40 ${input}`}
        />
        <span className={`text-xs ${sub}`}>%</span>
        {isDirty && (
          <button
            onClick={() => onWeightSave(cfg, weight)}
            disabled={saving === `w-${cfg.id}`}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-almet-sapphire hover:bg-almet-cloud-burst text-white disabled:opacity-50 transition"
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
        className={`p-1.5 rounded-lg transition shrink-0
          ${sub} hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40`}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}