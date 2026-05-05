// src/app/settings/asset-management/page.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { categoryService, batchService, assetService } from "@/services/assetService";
import { useToast } from "@/components/common/Toast";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Pagination from "@/components/common/Pagination";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import {
  Tag, Package, Plus, Edit2, Trash2, Loader,
  X, Search, AlertCircle, ArrowLeft, Layers,
  ArrowRightLeft, Hash, Eye, Upload,
} from "lucide-react";
// page.jsx içindəki AssetDetailModal-ı bu ilə əvəz et

import AssetAssignmentHistory from "@/components/assets/AssetAssignmentHistory";
// ── Shared ────────────────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-steel-blue/50 focus:border-almet-steel-blue transition-colors placeholder:text-gray-400";

const ModalShell = ({ title, subtitle, onClose, children, footer, wide }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
    <div className={`bg-white dark:bg-gray-900 rounded-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] ${wide ? "max-w-2xl" : "max-w-md"}`}>
      <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 space-y-4 overflow-y-auto flex-1">{children}</div>
      {footer && (
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  </div>
);

const ErrBox = ({ msg }) =>
  msg ? (
    <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
      <AlertCircle size={15} className="mt-0.5 shrink-0" /> {msg}
    </div>
  ) : null;

const BtnPrimary = ({ children, onClick, disabled, loading }) => (
  <button onClick={onClick} disabled={disabled}
    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-almet-cloud-burst hover:bg-almet-sapphire text-white text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm shadow-almet-cloud-burst/20">
    {loading && <Loader size={14} className="animate-spin" />}{children}
  </button>
);

const BtnOutline = ({ children, onClick }) => (
  <button onClick={onClick}
    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    {children}
  </button>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  IN_STOCK:           { label: "In Stock",            cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  ASSIGNED:           { label: "Pending Acceptance",  cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800" },
  IN_USE:             { label: "In Use",              cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800" },
  NEED_CLARIFICATION: { label: "Needs Clarification", cls: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 ring-1 ring-purple-200 dark:ring-purple-800" },
  IN_REPAIR:          { label: "In Repair",           cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800" },
  OUT_OF_SERVICE:     { label: "Out of Service",      cls: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800" },
  ARCHIVED:           { label: "Archived",            cls: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] ?? { label: status, cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${s.cls}`}>{s.label}</span>;
};

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIES TAB
// ══════════════════════════════════════════════════════════════════════════════
const CategoryModal = ({ item, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: item?.name ?? "", description: item?.description ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!item;

  const submit = async () => {
    if (!form.name.trim()) return setError("Name is required.");
    setLoading(true); setError("");
    try {
      isEdit
        ? await categoryService.update(item.id, form)
        : await categoryService.create(form);
      onSuccess(isEdit ? "Category updated." : "Category created.");
    } catch (e) { setError(e.response?.data?.message ?? "Failed to save category."); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell
      title={isEdit ? "Edit Category" : "Add Category"}
      subtitle={isEdit ? "Update category details." : "Create a new asset category."}
      onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit} disabled={loading} loading={loading}>{isEdit ? "Save Changes" : "Create Category"}</BtnPrimary></>}
    >
      <ErrBox msg={error} />
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Category Name <span className="text-red-500">*</span>
        </label>
        <input className={inputCls} value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Laptops" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Description (optional)</label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Brief description of this category…" />
      </div>
    </ModalShell>
  );
};

const CategoriesTab = () => {
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await categoryService.list({ page_size: 200 }); setCategories(res.results ?? res); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await categoryService.remove(deleteTarget.id); showSuccess("Category deleted."); setDeleteTarget(null); load(); }
    catch { showError("Delete failed."); }
    finally { setDeleting(false); }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-steel-blue/50 focus:border-almet-steel-blue transition-colors placeholder:text-gray-400" />
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-cloud-burst hover:bg-almet-sapphire text-white text-sm font-semibold transition-colors shadow-sm shadow-almet-cloud-burst/20">
          <Plus size={14} /> Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-36"><Loader size={20} className="animate-spin text-almet-steel-blue" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 text-gray-400 gap-2"><Tag size={22} className="opacity-30" /><p className="text-sm">No categories found</p></div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map(cat => (
              <div key={cat.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-almet-mystic dark:bg-almet-cloud-burst/10 flex items-center justify-center">
                    <Tag size={14} className="text-almet-cloud-burst dark:text-almet-steel-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{cat.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditItem(cat)} className="p-2 rounded-lg text-gray-400 hover:text-almet-cloud-burst hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/10 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(cat)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd  && <CategoryModal onClose={() => setShowAdd(false)} onSuccess={msg => { setShowAdd(false); showSuccess(msg); load(); }} />}
      {editItem && <CategoryModal item={editItem} onClose={() => setEditItem(null)} onSuccess={msg => { setEditItem(null); showSuccess(msg); load(); }} />}
      <ConfirmationModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        type="danger" title="Delete Category" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} confirmText="Delete" />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BATCHES TAB
// ══════════════════════════════════════════════════════════════════════════════
const PAGE_SIZE_BATCHES = 10;

const BatchCreateModal = ({ categories, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    asset_name: "", category: "", unit_price: "",
    purchase_date: new Date().toISOString().split("T")[0],
    useful_life_years: 5, supplier: "", purchase_order_number: "",
    notes: "", serial_numbers_raw: "", quantity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const parseSerials = raw => raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

  const submit = async () => {
    if (!form.asset_name.trim()) return setError("Asset name is required.");
    if (!form.category)          return setError("Category is required.");
    if (!form.unit_price || parseFloat(form.unit_price) <= 0) return setError("Valid unit price is required.");
    if (!form.purchase_date)     return setError("Purchase date is required.");

    const serials = parseSerials(form.serial_numbers_raw);
    const qty     = parseInt(form.quantity) || 0;
    if (!serials.length && !qty) return setError("Enter serial numbers or a quantity.");

    setLoading(true); setError("");
    try {
      const payload = {
        asset_name: form.asset_name, category: parseInt(form.category),
        unit_price: parseFloat(form.unit_price), purchase_date: form.purchase_date,
        useful_life_years: parseInt(form.useful_life_years),
        supplier: form.supplier, purchase_order_number: form.purchase_order_number,
        notes: form.notes,
      };
      if (serials.length) payload.serial_numbers = serials;
      else payload.quantity = qty;

      await batchService.create(payload);
      const count = serials.length || qty;
      onSuccess(`Batch created with ${count} asset(s).`);
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d === "string" ? d : JSON.stringify(d?.serial_numbers ?? d?.non_field_errors ?? d?.error ?? d) ?? "Failed to create batch.");
    } finally { setLoading(false); }
  };

  const parsedCount = parseSerials(form.serial_numbers_raw).length;
  const hasSerials  = parsedCount > 0;

  return (
    <ModalShell title="Create Batch" subtitle="Register a new batch of assets in the inventory."
      onClose={onClose} wide
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit} disabled={loading} loading={loading}>Create Batch</BtnPrimary></>}
    >
      <ErrBox msg={error} />

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Asset Name <span className="text-red-500">*</span>
        </label>
        <input className={inputCls} value={form.asset_name}
          onChange={e => set("asset_name", e.target.value)} placeholder="e.g. Dell XPS 15" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Category <span className="text-red-500">*</span></label>
          <SearchableDropdown options={categories.map(c => ({ value: String(c.id), label: c.name }))}
            value={form.category} onChange={v => set("category", v ?? "")} placeholder="Select…" allowUncheck={false} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Unit Price ($) <span className="text-red-500">*</span></label>
          <input type="number" min={0} step="0.01" className={inputCls}
            value={form.unit_price} onChange={e => set("unit_price", e.target.value)} placeholder="0.00" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Purchase Date <span className="text-red-500">*</span></label>
          <input type="date" className={inputCls} value={form.purchase_date}
            onChange={e => set("purchase_date", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Useful Life (years)</label>
          <input type="number" min={1} className={inputCls} value={form.useful_life_years}
            onChange={e => set("useful_life_years", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Supplier</label>
          <input className={inputCls} value={form.supplier}
            onChange={e => set("supplier", e.target.value)} placeholder="Vendor name" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Purchase Order #</label>
          <input className={inputCls} value={form.purchase_order_number}
            onChange={e => set("purchase_order_number", e.target.value)} placeholder="PO-2024-001" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</label>
        <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes}
          onChange={e => set("notes", e.target.value)} />
      </div>

      {/* Serial numbers OR quantity — one is required */}
      <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Asset Count <span className="text-red-500">*</span>
          <span className="font-normal normal-case text-gray-400 ml-1">— fill one of the two options below</span>
        </p>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Serial Numbers
            <span className="text-gray-400 ml-1">(one per line or comma-separated)</span>
          </label>
          <textarea
            className={`${inputCls} resize-none font-mono ${hasSerials ? "border-almet-steel-blue ring-1 ring-almet-steel-blue/30" : ""}`}
            rows={3}
            value={form.serial_numbers_raw}
            onChange={e => { set("serial_numbers_raw", e.target.value); if (e.target.value) set("quantity", ""); }}
            placeholder={"SN-001\nSN-002\nSN-003"}
            disabled={!hasSerials && !!form.quantity}
          />
          {hasSerials && (
            <p className="text-xs text-almet-sapphire dark:text-almet-steel-blue font-medium mt-1.5">
              ✓ {parsedCount} serial number(s) — quantity will be {parsedCount}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Quantity only
            <span className="text-gray-400 ml-1">(serial numbers will be auto-generated)</span>
          </label>
          <input
            type="number" min={1} className={`${inputCls} ${form.quantity && !hasSerials ? "border-almet-steel-blue ring-1 ring-almet-steel-blue/30" : ""}`}
            value={form.quantity}
            onChange={e => { set("quantity", e.target.value); if (e.target.value) set("serial_numbers_raw", ""); }}
            placeholder="e.g. 10"
            disabled={hasSerials}
          />
          {form.quantity && !hasSerials && parseInt(form.quantity) > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              Serial numbers will be auto-generated as BATCH-XXXXXX-001, -002, …
            </p>
          )}
        </div>
      </div>
    </ModalShell>
  );
};
const BatchEditModal = ({ batch, categories, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    asset_name:            batch.asset_name ?? "",
    category:              String(batch.category ?? ""),
    unit_price:            batch.unit_price ?? "",
    purchase_date:         batch.purchase_date ?? "",
    useful_life_years:     batch.useful_life_years ?? 5,
    supplier:              batch.supplier ?? "",
    purchase_order_number: batch.purchase_order_number ?? "",
    notes:                 batch.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.asset_name.trim()) return setError("Asset name is required.");
    if (!form.category)          return setError("Category is required.");
    if (!form.unit_price || parseFloat(form.unit_price) <= 0)
      return setError("Valid unit price is required.");
    setLoading(true); setError("");
    try {
      await batchService.patch(batch.id, {
        asset_name:            form.asset_name,
        category:              parseInt(form.category),
        unit_price:            parseFloat(form.unit_price),
        purchase_date:         form.purchase_date || undefined,
        useful_life_years:     parseInt(form.useful_life_years),
        supplier:              form.supplier,
        purchase_order_number: form.purchase_order_number,
        notes:                 form.notes,
      });
      onSuccess("Batch updated.");
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d === "string" ? d : d?.message ?? "Failed to update batch.");
    } finally { setLoading(false); }
  };

  return (
    <ModalShell
      title={`Edit Batch — ${batch.batch_number}`}
      subtitle="Update batch details. Serial numbers cannot be changed here."
      onClose={onClose}
      wide
      footer={
        <>
          <BtnOutline onClick={onClose}>Cancel</BtnOutline>
          <BtnPrimary onClick={submit} disabled={loading} loading={loading}>Save Changes</BtnPrimary>
        </>
      }
    >
      <ErrBox msg={error} />
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Asset Name <span className="text-red-500">*</span>
        </label>
        <input className={inputCls} value={form.asset_name}
          onChange={e => set("asset_name", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Category <span className="text-red-500">*</span></label>
          <SearchableDropdown
            options={categories.map(c => ({ value: String(c.id), label: c.name }))}
            value={form.category} onChange={v => set("category", v ?? "")}
            placeholder="Select…" allowUncheck={false} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Unit Price <span className="text-red-500">*</span></label>
          <input type="number" min={0} step="0.01" className={inputCls}
            value={form.unit_price} onChange={e => set("unit_price", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Purchase Date</label>
          <input type="date" className={inputCls} value={form.purchase_date}
            onChange={e => set("purchase_date", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Useful Life (years)</label>
          <input type="number" min={1} className={inputCls} value={form.useful_life_years}
            onChange={e => set("useful_life_years", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Supplier</label>
          <input className={inputCls} value={form.supplier}
            onChange={e => set("supplier", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Purchase Order #</label>
          <input className={inputCls} value={form.purchase_order_number}
            onChange={e => set("purchase_order_number", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</label>
        <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes}
          onChange={e => set("notes", e.target.value)} />
      </div>
    </ModalShell>
  );
};

const BatchesTab = ({ categories }) => {
  const { showSuccess, showError } = useToast();
  const [batches, setBatches]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [totalCount, setTotal]        = useState(0);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [showCreate, setShowCreate]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await batchService.list({ page, page_size: PAGE_SIZE_BATCHES, ...(search && { search }) });
      setBatches(res.results ?? res); setTotal(res.count ?? (res.results ?? res).length);
    } catch { } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await batchService.remove(deleteTarget.id); showSuccess("Batch deleted."); setDeleteTarget(null); load(); }
    catch (e) { showError(e.response?.data?.message ?? "Delete failed."); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search batches…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-steel-blue/50 focus:border-almet-steel-blue transition-colors placeholder:text-gray-400" />
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-cloud-burst hover:bg-almet-sapphire text-white text-sm font-semibold transition-colors shadow-sm shadow-almet-cloud-burst/20">
          <Plus size={14} /> Create Batch
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-36"><Loader size={20} className="animate-spin text-almet-steel-blue" /></div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 text-gray-400 gap-2"><Package size={22} className="opacity-30" /><p className="text-sm">No batches found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50">
                  {["Batch #", "Asset Name", "Category", "Qty", "Available", "Unit Price", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-5 py-3.5 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {batches.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-almet-sapphire dark:text-almet-steel-blue">{b.batch_number}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{b.asset_name}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{b.category_name}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{b.initial_quantity}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${b.available_quantity === 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>{b.available_quantity}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">${parseFloat(b.unit_price ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${b.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditTarget(b)} className="p-2 rounded-lg text-gray-400 hover:text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/20 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(b)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={Math.ceil(totalCount / PAGE_SIZE_BATCHES)} totalItems={totalCount} itemsPerPage={PAGE_SIZE_BATCHES} onPageChange={setPage} />

      {showCreate && <BatchCreateModal categories={categories} onClose={() => setShowCreate(false)} onSuccess={msg => { setShowCreate(false); showSuccess(msg); load(); }} />}
      {editTarget && <BatchEditModal batch={editTarget} categories={categories} onClose={() => setEditTarget(null)} onSuccess={msg => { setEditTarget(null); showSuccess(msg); load(); }} />}
      <ConfirmationModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        type="danger" title="Delete Batch" message={`Delete batch "${deleteTarget?.batch_number}"? All associated assets must be unassigned first.`} confirmText="Delete" />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ASSETS TAB  (köçürülmüş /assets/page.jsx + əlavə əməliyyatlar)
// ══════════════════════════════════════════════════════════════════════════════
const PAGE_SIZE_ASSETS = 15;

const EDITABLE_STATUSES = [
  { value: "IN_STOCK",       label: "In Stock" },
  { value: "IN_REPAIR",      label: "In Repair" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" },
  { value: "ARCHIVED",       label: "Archived" },
];

const ALL_STATUS_OPTIONS = [
  { value: "all",                label: "All Statuses" },
  { value: "IN_STOCK",           label: "In Stock" },
  { value: "IN_USE",             label: "In Use" },
  { value: "ASSIGNED",           label: "Pending Acceptance" },
  { value: "NEED_CLARIFICATION", label: "Needs Clarification" },
  { value: "IN_REPAIR",          label: "In Repair" },
  { value: "OUT_OF_SERVICE",     label: "Out of Service" },
  { value: "ARCHIVED",           label: "Archived" },
];

// ── Add Assets Modal (köçürülmüş) ─────────────────────────────────────────────
const AddAssetModal = ({ batches, onClose, onSuccess }) => {
  const [form, setForm] = useState({ existing_batch_id: "", serial_numbers_raw: "", quantity: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const parseSerials = raw => raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

  const submit = async () => {
    if (!form.existing_batch_id) return setError("Please select a batch.");
    const serials = parseSerials(form.serial_numbers_raw);
    const qty     = parseInt(form.quantity) || 0;
    if (!serials.length && !qty) return setError("Enter serial numbers or a quantity.");
    setLoading(true); setError("");
    try {
      const payload = serials.length ? { serial_numbers: serials } : { quantity: qty };
      await batchService.addAssets(form.existing_batch_id, payload);
      onSuccess(`${serials.length || qty} asset(s) added to batch.`);
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d === "string" ? d : JSON.stringify(d?.serial_numbers ?? d?.non_field_errors ?? d?.error ?? d) ?? "Failed.");
    } finally { setLoading(false); }
  };

  const parsedCount = parseSerials(form.serial_numbers_raw).length;
  const hasSerials  = parsedCount > 0;
  const selectedBatch = batches.find(b => String(b.id) === form.existing_batch_id);

  return (
    <ModalShell title="Add Assets to Batch" subtitle="Add more units to an existing batch." onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit} disabled={loading} loading={loading}>Add Assets</BtnPrimary></>}>
      <ErrBox msg={error} />

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Batch <span className="text-red-500">*</span>
        </label>
        <SearchableDropdown
          options={batches.map(b => ({ value: String(b.id), label: `${b.batch_number} — ${b.asset_name}` }))}
          value={form.existing_batch_id} onChange={v => set("existing_batch_id", v ?? "")}
          placeholder="Choose batch…" allowUncheck={false} />
        {selectedBatch && (
          <p className="text-xs text-gray-400 mt-1.5">
            Currently {selectedBatch.initial_quantity} unit(s) — {selectedBatch.available_quantity} available
          </p>
        )}
      </div>

      <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          New Units <span className="text-red-500">*</span>
          <span className="font-normal normal-case text-gray-400 ml-1">— fill one of the two options</span>
        </p>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Serial Numbers <span className="text-gray-400">(one per line or comma-separated)</span>
          </label>
          <textarea
            className={`${inputCls} resize-none font-mono ${hasSerials ? "border-almet-steel-blue ring-1 ring-almet-steel-blue/30" : ""}`}
            rows={3} value={form.serial_numbers_raw}
            onChange={e => { set("serial_numbers_raw", e.target.value); if (e.target.value) set("quantity", ""); }}
            placeholder={"SN-001\nSN-002\nSN-003"}
            disabled={!hasSerials && !!form.quantity}
          />
          {hasSerials && (
            <p className="text-xs text-almet-sapphire dark:text-almet-steel-blue font-medium mt-1.5">
              ✓ {parsedCount} serial number(s) detected
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Quantity only <span className="text-gray-400">(serial numbers auto-generated)</span>
          </label>
          <input type="number" min={1}
            className={`${inputCls} ${form.quantity && !hasSerials ? "border-almet-steel-blue ring-1 ring-almet-steel-blue/30" : ""}`}
            value={form.quantity}
            onChange={e => { set("quantity", e.target.value); if (e.target.value) set("serial_numbers_raw", ""); }}
            placeholder="e.g. 5" disabled={hasSerials} />
        </div>
      </div>
    </ModalShell>
  );
};

// ── Bulk Upload Modal (köçürülmüş) ────────────────────────────────────────────
const BulkUploadModal = ({ onClose, onSuccess }) => {
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    if (!file) return setError("Please select a file.");
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await assetService.bulkUpload(file);
      setResult(res);
      if (res.imported > 0) onSuccess(`${res.imported} batch(es) imported successfully.`);
    } catch (e) { const d = e.response?.data; setError(typeof d === "string" ? d : d?.error ?? "Import failed."); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title="Bulk Import Assets" subtitle="Upload an Excel or CSV file to import multiple batches at once." onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>{result ? "Close" : "Cancel"}</BtnOutline>{!result && <BtnPrimary onClick={submit} disabled={loading} loading={loading}>Import</BtnPrimary>}</>}>
      <ErrBox msg={error} />
      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{result.imported}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Imported</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{result.failed}</p>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">Failed</p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-40 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Errors</p>
              {result.errors.map((e, i) => <p key={i} className="text-xs text-red-500">{e}</p>)}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-almet-mystic dark:bg-almet-cloud-burst/10 border border-almet-steel-blue/20 rounded-xl p-4">
            <p className="text-xs font-semibold text-almet-cloud-burst dark:text-almet-steel-blue mb-1">Required columns</p>
            <p className="text-xs font-mono text-almet-sapphire dark:text-almet-bali-hai">asset_name, category, quantity, unit_price, purchase_date</p>
            <p className="text-xs font-semibold text-almet-cloud-burst dark:text-almet-steel-blue mt-2.5 mb-1">Optional</p>
            <p className="text-xs font-mono text-almet-sapphire dark:text-almet-bali-hai">useful_life_years, supplier</p>
          </div>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 cursor-pointer hover:border-almet-steel-blue hover:bg-almet-mystic/30 transition-all">
            <Upload size={28} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Click to upload file</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Excel (.xlsx, .xls) or CSV — max 10 MB</p>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            {file && <p className="mt-3 text-xs text-almet-sapphire dark:text-almet-steel-blue font-medium">{file.name}</p>}
          </label>
        </>
      )}
    </ModalShell>
  );
};



const AssetDetailModal = ({ assetId, onClose }) => {
  const [asset, setAsset]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details"); // "details" | "history"

  useEffect(() => {
    assetService.detail(assetId).then(setAsset).catch(console.error).finally(() => setLoading(false));
  }, [assetId]);

  const Row = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-400 dark:text-gray-500 w-36 shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-gray-800 dark:text-gray-200 text-right">{value ?? "—"}</span>
    </div>
  );

  return (
    <ModalShell title="Asset Details" onClose={onClose} footer={<BtnOutline onClick={onClose}>Close</BtnOutline>}>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader size={20} className="animate-spin text-almet-steel-blue" />
        </div>
      ) : !asset ? (
        <p className="text-sm text-gray-400 text-center py-8">Asset not found.</p>
      ) : (
        <div className="space-y-4">
          {/* Asset header card */}
          <div className="bg-almet-mystic dark:bg-almet-cloud-burst/10 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-almet-cloud-burst/10 dark:bg-almet-cloud-burst/30 rounded-xl p-3">
              <Package size={20} className="text-almet-cloud-burst dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{asset.asset_name}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{asset.asset_number}</p>
            </div>
            <div className="ml-auto"><StatusBadge status={asset.status} /></div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {[
              { id: "details", label: "Details" },
              { id: "history", label: "Assignment History" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all
                  ${activeTab === id
                    ? "bg-white dark:bg-gray-900 text-almet-cloud-burst dark:text-almet-steel-blue shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Details tab */}
          {activeTab === "details" && (
            <div>
              <Row label="Serial Number" value={asset.serial_number} />
              <Row label="Category"      value={asset.category?.name} />
              <Row label="Batch"         value={asset.batch?.batch_number} />
              <Row label="Assigned To"   value={asset.assigned_to?.full_name} />
              <Row label="Useful Life"   value={asset.batch?.useful_life_years ? `${asset.batch.useful_life_years} years` : null} />
              <Row label="Created"       value={asset.created_at ? new Date(asset.created_at).toLocaleDateString("en-GB") : null} />

              {asset.active_assignment && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Active Assignment
                  </p>
                  <Row label="Employee"  value={asset.active_assignment.employee?.full_name} />
                  <Row label="Check-out" value={asset.active_assignment.check_out_date} />
                  <Row label="Condition" value={asset.active_assignment.condition_out} />
                  <Row label="Accepted"  value={asset.active_assignment.accepted_at
                    ? new Date(asset.active_assignment.accepted_at).toLocaleDateString("en-GB")
                    : "Not yet accepted"} />
                  <Row label="Duration"  value={`${asset.active_assignment.duration_days} day(s)`} />
                </div>
              )}

              {asset.clarification && (
                <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">
                    Clarification
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{asset.clarification.reason}</p>
                  {asset.clarification.response && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                      Response: {asset.clarification.response}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* History tab */}
          {activeTab === "history" && (
            <AssetAssignmentHistory assetId={assetId} />
          )}
        </div>
      )}
    </ModalShell>
  );
};

// ── Edit Serial Modal ─────────────────────────────────────────────────────────
const EditSerialModal = ({ asset, onClose, onSuccess }) => {
  const [serial, setSerial]   = useState(asset.serial_number ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    if (!serial.trim()) return setError("Serial number cannot be empty.");
    setLoading(true); setError("");
    try { await assetService.update(asset.id, { serial_number: serial.trim() }); onSuccess("Serial number updated."); }
    catch (e) { const d = e.response?.data; setError(typeof d === "string" ? d : d?.serial_number?.[0] ?? d?.error ?? "Update failed."); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title="Edit Serial Number" subtitle={`${asset.asset_name} · ${asset.asset_number}`} onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit} disabled={loading} loading={loading}>Save</BtnPrimary></>}>
      <ErrBox msg={error} />
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Serial Number <span className="text-red-500">*</span></label>
        <input className={inputCls} value={serial} onChange={e => setSerial(e.target.value)} placeholder="e.g. SN-001" />
      </div>
    </ModalShell>
  );
};

// ── Edit Status Modal ─────────────────────────────────────────────────────────
const EditStatusModal = ({ asset, onClose, onSuccess }) => {
  const [status, setStatus]   = useState(asset.status);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const canEdit = !["IN_USE", "ASSIGNED", "NEED_CLARIFICATION"].includes(asset.status);

  const submit = async () => {
    setLoading(true); setError("");
    try { await assetService.update(asset.id, { status }); onSuccess("Status updated."); }
    catch (e) { const d = e.response?.data; setError(typeof d === "string" ? d : d?.status?.[0] ?? d?.error ?? "Update failed."); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell title="Change Status" subtitle={`${asset.asset_name} · ${asset.asset_number}`} onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit} disabled={loading || !canEdit} loading={loading}>Update Status</BtnPrimary></>}>
      <ErrBox msg={error} />
      {!canEdit && (
        <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          This asset is currently assigned. Check it in first before changing status.
        </div>
      )}
      <div className="space-y-2">
        {EDITABLE_STATUSES.map(s => (
          <label key={s.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
            ${status === s.value ? "border-almet-steel-blue bg-almet-mystic dark:bg-almet-cloud-burst/10 dark:border-almet-steel-blue" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}
            ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}>
            <input type="radio" name="status" value={s.value} checked={status === s.value}
              onChange={() => canEdit && setStatus(s.value)} className="accent-almet-cloud-burst" disabled={!canEdit} />
            <StatusBadge status={s.value} />
          </label>
        ))}
      </div>
    </ModalShell>
  );
};





const BulkStatusModal = ({ selectedIds, onClose, onSuccess }) => {
  const [targetStatus, setTargetStatus] = useState("IN_REPAIR");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const submit = async () => {
    setLoading(true); setError("");
    try {
      await Promise.all(
        selectedIds.map(id => assetService.update(id, { status: targetStatus }))
      );
      onSuccess(
        `${selectedIds.length} asset(s) updated to "${EDITABLE_STATUSES.find(s => s.value === targetStatus)?.label}".`
      );
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d === "string" ? d : d?.error ?? "Bulk update failed.");
    } finally { setLoading(false); }
  };

  return (
    <ModalShell
      title={`Bulk Status Update (${selectedIds.length} assets)`}
      subtitle="Set the same status for all selected assets."
      onClose={onClose}
      footer={
        <>
          <BtnOutline onClick={onClose}>Cancel</BtnOutline>
          <BtnPrimary onClick={submit} disabled={loading} loading={loading}>
            Apply to All
          </BtnPrimary>
        </>
      }
    >
      <ErrBox msg={error} />

      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-almet-mystic dark:bg-almet-cloud-burst/10 border border-almet-steel-blue/20 rounded-xl px-4 py-3 text-xs text-almet-cloud-burst dark:text-almet-steel-blue">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        Only assets with statuses In Stock, In Repair, Out of Service, or Archived can be bulk-edited.
        Assigned and in-use assets are excluded automatically.
      </div>

      <div className="space-y-2">
        {EDITABLE_STATUSES.map(s => (
          <label
            key={s.value}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
              ${targetStatus === s.value
                ? "border-almet-steel-blue bg-almet-mystic dark:bg-almet-cloud-burst/10 dark:border-almet-steel-blue"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
          >
            <input
              type="radio"
              name="bulk_status"
              value={s.value}
              checked={targetStatus === s.value}
              onChange={() => setTargetStatus(s.value)}
              className="accent-almet-cloud-burst"
            />
            <StatusBadge status={s.value} />
          </label>
        ))}
      </div>
    </ModalShell>
  );
};
// ── Assets Tab ────────────────────────────────────────────────────────────────
const AssetsTab = ({ categories, batches, refreshBatches }) => {
  const { showSuccess, showError } = useToast();
  const [assets, setAssets]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [totalCount, setTotalCount]   = useState(0);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter]     = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds]       = useState([]);

  const [showAdd,            setShowAdd]            = useState(false);
  const [showUpload,         setShowUpload]         = useState(false);
  const [detailId,           setDetailId]           = useState(null);
  const [editSerialAsset,    setEditSerialAsset]    = useState(null);
  const [editStatusAsset,    setEditStatusAsset]    = useState(null);
  const [showBulkStatus,     setShowBulkStatus]     = useState(false);
  const [deleteTarget,       setDeleteTarget]       = useState(null);
  const [deleting,           setDeleting]           = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, page_size: PAGE_SIZE_ASSETS,
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      };
      const res = await assetService.list(params);
      setAssets(res.results ?? res);
      setTotalCount(res.count ?? (res.results ?? res).length);
      setSelectedIds([]);
    } catch { } finally { setLoading(false); }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);


const BULK_EDITABLE_STATUSES = ["IN_STOCK", "IN_REPAIR", "OUT_OF_SERVICE", "ARCHIVED"];

const isSelectable  = a => BULK_EDITABLE_STATUSES.includes(a.status);
const selectableIds = assets.filter(isSelectable).map(a => a.id);

const toggleSelect = id => {
  const asset = assets.find(a => a.id === id);
  if (!asset || !isSelectable(asset)) return;   // assigned/in-use asset-ləri seçmə
  setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
};

const allSelected = selectableIds.length > 0 && selectableIds.every(id => selectedIds.includes(id));
const toggleAll   = () => setSelectedIds(allSelected ? [] : selectableIds);

  const handleDelete = async () => {
    setDeleting(true);
    try { await assetService.remove(deleteTarget.id); showSuccess("Asset deleted."); setDeleteTarget(null); load(); }
    catch (e) { const d = e.response?.data; showError(typeof d === "string" ? d : d?.error ?? "Delete failed."); }
    finally { setDeleting(false); }
  };

  const onModalSuccess = msg => {
    setShowAdd(false); setShowUpload(false);
    setEditSerialAsset(null); setEditStatusAsset(null);
    setShowBulkStatus(false);
    showSuccess(msg); load();
    refreshBatches();
  };

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map(c => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or serial number…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-steel-blue/50 focus:border-almet-steel-blue transition-colors placeholder:text-gray-400" />
        </div>
        <div className="w-44">
          <SearchableDropdown options={ALL_STATUS_OPTIONS} value={statusFilter}
            onChange={v => { setStatusFilter(v ?? "all"); setPage(1); }} placeholder="All Statuses" allowUncheck={false} />
        </div>
        <div className="w-48">
          <SearchableDropdown options={categoryOptions} value={categoryFilter}
            onChange={v => { setCategoryFilter(v ?? "all"); setPage(1); }} placeholder="All Categories" allowUncheck={false} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Upload size={14} /> Import
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-almet-cloud-burst hover:bg-almet-sapphire text-white text-sm font-semibold transition-colors shadow-sm shadow-almet-cloud-burst/20">
            <Plus size={14} /> Add to Batch
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-almet-mystic dark:bg-almet-cloud-burst/10 border border-almet-steel-blue/20 rounded-xl px-4 py-3">

<span className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-steel-blue">
  {selectedIds.length} selected
  {selectableIds.length < assets.length && (
    <span className="font-normal text-gray-400 ml-1.5">
      ({assets.length - selectableIds.length} asset(s) cannot be bulk-edited)
    </span>
  )}
</span>
          <div className="flex-1" />
          <button onClick={() => setShowBulkStatus(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-almet-cloud-burst hover:bg-almet-sapphire text-white transition-colors">
            <Layers size={14} /> Bulk Status Update
          </button>
          <button onClick={() => setSelectedIds([])} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-800 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader size={24} className="animate-spin text-almet-steel-blue" />
            <p className="text-sm text-gray-400">Loading assets…</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5"><Package size={28} className="opacity-40" /></div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No assets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50">
                  <th className="px-5 py-3.5 w-10">
                    <input type="checkbox" className="accent-almet-cloud-burst w-4 h-4 rounded cursor-pointer" checked={allSelected} onChange={toggleAll} />
                  </th>
                  {["Asset #", "Asset Name", "Serial No.", "Category", "Batch", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-5 py-3.5 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {assets.map(a => (
                  <tr key={a.id} className={`hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors ${selectedIds.includes(a.id) ? "bg-almet-mystic/40 dark:bg-almet-cloud-burst/5" : ""}`}>
                    <td className="px-5 py-4">

<input
  type="checkbox"
  className="accent-almet-cloud-burst w-4 h-4 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
  checked={selectedIds.includes(a.id)}
  onChange={() => toggleSelect(a.id)}
  disabled={!isSelectable(a)}
  title={!isSelectable(a) ? `Cannot bulk-edit assets with status: ${a.status}` : ""}
/>                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-almet-sapphire dark:text-almet-steel-blue">{a.asset_number}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{a.asset_name}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-400">{a.serial_number ?? "—"}</span>
                        <button onClick={() => setEditSerialAsset(a)} title="Edit serial"
                          className="p-1 rounded text-gray-300 hover:text-almet-cloud-burst hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/10 transition-colors">
                          <Hash size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{a.category_name}</td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-400">{a.batch_number ?? "—"}</td>
                    <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailId(a.id)} title="View details"
                          className="p-2 rounded-lg text-gray-400 hover:text-almet-cloud-burst hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/10 transition-colors">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setEditStatusAsset(a)} title="Change status"
                          className="p-2 rounded-lg text-gray-400 hover:text-almet-cloud-burst hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/10 transition-colors">
                          <Edit2 size={14} />
                        </button>
                    
                        {a.status === "IN_STOCK" && (
                          <button onClick={() => setDeleteTarget(a)} title="Delete"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={Math.ceil(totalCount / PAGE_SIZE_ASSETS)}
        totalItems={totalCount} itemsPerPage={PAGE_SIZE_ASSETS} onPageChange={setPage} />

      {/* Modals */}
      {showAdd            && <AddAssetModal batches={batches} onClose={() => setShowAdd(false)} onSuccess={onModalSuccess} />}
      {showUpload         && <BulkUploadModal onClose={() => setShowUpload(false)} onSuccess={onModalSuccess} />}
      {detailId           && <AssetDetailModal assetId={detailId} onClose={() => setDetailId(null)} />}
      {editSerialAsset    && <EditSerialModal asset={editSerialAsset} onClose={() => setEditSerialAsset(null)} onSuccess={onModalSuccess} />}
      {editStatusAsset    && <EditStatusModal asset={editStatusAsset} onClose={() => setEditStatusAsset(null)} onSuccess={onModalSuccess} />}
      {showBulkStatus     && <BulkStatusModal selectedIds={selectedIds} onClose={() => setShowBulkStatus(false)} onSuccess={onModalSuccess} />}

      <ConfirmationModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        type="danger" title="Delete Asset" message={`Delete "${deleteTarget?.asset_name}" (${deleteTarget?.asset_number})? This cannot be undone.`} confirmText="Delete" />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
export default function AssetSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab]   = useState("categories");
  const [categories, setCategories] = useState([]);
  const [batches, setBatches]       = useState([]);

  const loadCategories = useCallback(() =>
    categoryService.list({ page_size: 200 }).then(r => setCategories(r.results ?? r)).catch(console.error), []);

  const loadBatches = useCallback(() =>
    batchService.list({ page_size: 500 }).then(r => setBatches(r.results ?? r)).catch(console.error), []);

  useEffect(() => { loadCategories(); loadBatches(); }, []);

  const TABS = [
    { id: "categories", label: "Categories", icon: Tag },
    { id: "batches",    label: "Batches",    icon: Package },
    { id: "assets",     label: "Assets",     icon: Layers },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8  mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => router.push("/settings/asset-mng")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Configuration</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Manage categories, batches, and individual asset records</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all
                ${activeTab === id ? "bg-white dark:bg-gray-900 text-almet-cloud-burst dark:text-almet-steel-blue shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "batches"    && <BatchesTab categories={categories} />}
        {activeTab === "assets"     && <AssetsTab categories={categories} batches={batches} refreshBatches={loadBatches} />}
      </div>
    </DashboardLayout>
  );
}