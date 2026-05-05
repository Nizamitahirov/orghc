"use client";
/**
 * DeleteExitModal
 *
 * Modal for soft-delete or hard-delete that asks:
 *  1. Exit type: Voluntary Resignation / Termination / End of Internship / Probation Period Failed
 *  2. Termination date
 *  3. Notes / reason
 */
import { useState, useEffect } from "react";
import {
  X, AlertTriangle, Calendar, FileText,
  LogOut, UserX, GraduationCap, Clock,
} from "lucide-react";

const EXIT_TYPES = [
  {
    code: "VOLUNTARY_RESIGNATION",
    label: "Voluntary Resignation",
    description: "Employee resigned voluntarily",
    icon: LogOut,
    color: "blue",
    border: "border-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    code: "TERMINATION",
    label: "Termination",
    description: "Dismissed / end of contract",
    icon: UserX,
    color: "red",
    border: "border-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
  {
    code: "END_OF_INTERNSHIP",
    label: "End of Internship",
    description: "Internship period completed",
    icon: GraduationCap,
    color: "teal",
    border: "border-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
    text: "text-teal-600 dark:text-teal-400",
  },
  {
    code: "PROBATION_PERIOD_FAILED",
    label: "Probation Period Failed",
    description: "Did not pass probation",
    icon: Clock,
    color: "orange",
    border: "border-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
];

export default function DeleteExitModal({
  isOpen,
  onClose,
  onConfirm,
  deleteType = "soft",
  employeeName = "",
  employeeCount = 1,
  isProcessing = false,
}) {
  const [exitType,       setExitType]   = useState("VOLUNTARY_RESIGNATION");
  const [terminationDate, setTermDate]  = useState("");
  const [notes,          setNotes]      = useState("");

  useEffect(() => {
    if (isOpen) {
      setExitType("VOLUNTARY_RESIGNATION");
      setTermDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSoft = deleteType === "soft";
  const label  = employeeCount > 1
    ? `${employeeCount} employees`
    : employeeName || "this employee";

  const selected = EXIT_TYPES.find(t => t.code === exitType) || EXIT_TYPES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onConfirm({ exitType, terminationDate: terminationDate || undefined, notes: notes || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          isSoft ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                 : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        }`}>
          <div className="flex items-center gap-3">
            {isSoft
              ? <UserX className="h-5 w-5 text-orange-500" />
              : <AlertTriangle className="h-5 w-5 text-red-500" />
            }
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {isSoft ? "End Employment" : "Permanent Deletion"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isSoft ? "Record archived & vacant position created" : "Record permanently removed"}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Employee name banner */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
            Ending employment for <strong className="text-gray-900 dark:text-white">{label}</strong>
          </div>

          {/* Exit type grid */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Reason for leaving <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXIT_TYPES.map((type) => {
                const Icon = type.icon;
                const active = exitType === type.code;
                return (
                  <label
                    key={type.code}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      active
                        ? `${type.border} ${type.bg}`
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="exitType"
                      value={type.code}
                      checked={active}
                      onChange={(e) => setExitType(e.target.value)}
                      className="sr-only"
                    />
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${active ? type.text : "text-gray-400"}`} />
                    <div>
                      <p className={`text-xs font-semibold leading-tight ${active ? type.text : "text-gray-600 dark:text-gray-400"}`}>
                        {type.label}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{type.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Date & Notes row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                <Calendar className="inline h-3.5 w-3.5 mr-1" />
                Termination date
              </label>
              <input
                type="date"
                value={terminationDate}
                onChange={(e) => setTermDate(e.target.value)}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                <FileText className="inline h-3.5 w-3.5 mr-1" />
                Notes
                <span className="ml-1 font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details…"
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Hard delete warning */}
          {!isSoft && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-300">
                <strong>Permanent action.</strong> All employee data will be removed. An audit archive record will be created.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                         text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`flex-1 text-sm px-4 py-2.5 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
                isSoft
                  ? "bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300"
                  : "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
              }`}
            >
              {isProcessing ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</>
              ) : (
                isSoft ? "End Employment" : "Delete Permanently"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
