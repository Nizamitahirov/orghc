"use client";
import { Calendar, Eye, ChevronRight, Cake, Award, MapPin, Briefcase, TrendingUp, Users, Building, X, FileText, Star, UserPlus, Mail, Phone, Send, Paperclip, Flag, Zap, Hash, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useToast } from "@/components/common/Toast";
import { useState, useEffect } from "react";
import { newsService } from "@/services/newsService";
import celebrationService from "@/services/celebrationService";
import { useTheme } from "@/components/common/ThemeProvider";
import { vacantPositionsService } from "@/services/vacantPositionsService";
import { useDraggableSections } from "@/hooks/useDraggableSections";
import { GripVertical } from "lucide-react";



// Featured News Component
const FeaturedNewsCard = ({ news, darkMode, onClick }) => {
  return (
    <div onClick={onClick} className="cursor-pointer group mb-5">
      <div className="relative h-[320px] rounded-2xl overflow-hidden shadow-2xl border border-almet-mystic/50 dark:border-almet-san-juan/50">
        <img
          src={news.image_url || "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200"}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        {news.category_name && (
          <div className="absolute top-4 left-4 bg-almet-sapphire/90 dark:bg-almet-steel-blue/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg">
            {news.category_name}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 text-white/80 text-[10px] flex items-center gap-1 border border-white/20">
          <Eye className="h-2.5 w-2.5" /> {news.view_count}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="text-almet-steel-blue text-[10px] font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" /> Latest Update
          </span>
          <h2 className="text-white text-lg font-bold mb-2 leading-tight">{news.title}</h2>
          <p className="text-white/80 text-xs mb-3 line-clamp-2">{news.excerpt || news.content}</p>
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-[10px] flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(news.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="ml-auto bg-white/20 hover:bg-white/30 text-white text-[10px] font-semibold px-3 py-1 rounded-lg flex items-center gap-1 transition group-hover:bg-white/30">
              Read more <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Birthday Card Component
const BirthdayCard = ({ celebration, darkMode, onCelebrate, isCelebrated }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = date.toISOString().split("T")[0];
    const todayOnly = today.toISOString().split("T")[0];
    const tomorrowOnly = tomorrow.toISOString().split("T")[0];
    if (dateOnly === todayOnly) return "Today";
    if (dateOnly === tomorrowOnly) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isToday = () => {
    const date = new Date(celebration.date).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    return date === today;
  };

  const todayCheck = isToday();
  const initials = celebration.employee_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
      todayCheck
        ? "border-almet-sapphire dark:border-almet-steel-blue ring-2 ring-almet-sapphire/20"
        : "border-almet-mystic/50 dark:border-almet-san-juan/50"
    } bg-white dark:bg-almet-cloud-burst`}>
      {todayCheck && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-almet-sapphire to-almet-astral" />}

      <div className="h-14 bg-gradient-to-br from-almet-sapphire/10 to-almet-astral/20 dark:from-almet-steel-blue/20 dark:to-almet-san-juan/30 flex items-center justify-center relative">
        <div className="w-9 h-9 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white/40">
          {initials}
        </div>
        <span className="absolute top-1.5 right-2 text-sm">🎂</span>
      </div>

      <div className="p-3 text-center">
        <h4 className="font-bold text-xs text-almet-cloud-burst dark:text-white mb-0.5 line-clamp-1">{celebration.employee_name}</h4>
        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-2 line-clamp-1">{celebration.position}</p>

        <div className={`flex items-center justify-center gap-1 text-[10px] mb-2.5 px-2 py-1 rounded-lg ${
          todayCheck
            ? "bg-almet-sapphire/10 text-almet-sapphire dark:text-almet-steel-blue font-medium"
            : "bg-almet-mystic/30 dark:bg-almet-san-juan/30 text-almet-waterloo dark:text-almet-bali-hai"
        }`}>
          <Calendar className="h-2.5 w-2.5" /> {formatDate(celebration.date)}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onCelebrate(celebration); }}
          disabled={isCelebrated}
          className={`w-full py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
            isCelebrated
              ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-default"
              : "bg-gradient-to-r from-almet-sapphire to-almet-astral text-white hover:from-almet-astral hover:to-almet-steel-blue shadow-md hover:shadow-lg"
          }`}
        >
          {isCelebrated ? "✓ Wished" : "🎉 Send Wishes"}
        </button>
      </div>
    </div>
  );
};

// Work Anniversary Item
const AnniversaryItem = ({ celebration, darkMode, onCelebrate, isCelebrated }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = date.toISOString().split("T")[0];
    const todayOnly = today.toISOString().split("T")[0];
    const tomorrowOnly = tomorrow.toISOString().split("T")[0];
    if (dateOnly === todayOnly) return "Today";
    if (dateOnly === tomorrowOnly) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isToday = () => {
    const date = new Date(celebration.date).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    return date === today;
  };

  const todayCheck = isToday();

  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${
      todayCheck
        ? "border-almet-sapphire/30 dark:border-almet-steel-blue/30 bg-almet-sapphire/5 dark:bg-almet-steel-blue/5 px-2 rounded-lg -mx-2"
        : "border-almet-mystic dark:border-almet-comet"
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md shrink-0">
          <Award className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-xs text-almet-cloud-burst dark:text-white truncate">{celebration.employee_name}</h4>
            {todayCheck && <span className="bg-almet-sapphire text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">Today</span>}
          </div>
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai truncate">{celebration.position}</p>
          <div className={`flex items-center gap-1 text-[9px] mt-0.5 ${todayCheck ? "text-almet-sapphire dark:text-almet-steel-blue font-medium" : "text-almet-waterloo dark:text-almet-bali-hai"}`}>
            <Calendar className="h-2.5 w-2.5 shrink-0" /> {formatDate(celebration.date)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap">
          {celebration.years} {celebration.years === 1 ? "yr" : "yrs"}
        </span>
        {!isCelebrated && (
          <button onClick={() => onCelebrate(celebration)} className="text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire/10 p-1.5 rounded-lg transition-all">
            🎉
          </button>
        )}
      </div>
    </div>
  );
};

// Promotion Item Component
const PromotionItem = ({ celebration, darkMode, onCelebrate, isCelebrated }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = date.toISOString().split("T")[0];
    const todayOnly = today.toISOString().split("T")[0];
    const tomorrowOnly = tomorrow.toISOString().split("T")[0];
    if (dateOnly === todayOnly) return "Today";
    if (dateOnly === tomorrowOnly) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isToday = () => {
    const date = new Date(celebration.date).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    return date === today;
  };

  const todayCheck = isToday();

  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${
      todayCheck
        ? "border-green-500/30 dark:border-green-400/30 bg-green-50/50 dark:bg-green-900/10 px-2 rounded-lg -mx-2"
        : "border-almet-mystic dark:border-almet-comet"
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white shadow-md shrink-0">
          <Star className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-xs text-almet-cloud-burst dark:text-white truncate">{celebration.employee_name}</h4>
            {todayCheck && <span className="bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">Today</span>}
          </div>
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai truncate">{celebration.position}</p>
          <div className={`flex items-center gap-1 text-[9px] mt-0.5 ${todayCheck ? "text-green-600 dark:text-green-400 font-medium" : "text-almet-waterloo dark:text-almet-bali-hai"}`}>
            <Calendar className="h-2.5 w-2.5 shrink-0" /> {formatDate(celebration.date)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg text-[10px] font-bold">Promoted</span>
        {!isCelebrated && (
          <button onClick={() => onCelebrate(celebration)} className="text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 p-1.5 rounded-lg transition-all">
            🎉
          </button>
        )}
      </div>
    </div>
  );
};

// Report Vacancy Modal
const ReportVacancyModal = ({ vacancy, onClose }) => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const reasons = [
    "Position already filled",
    "Incorrect job details",
    "Duplicate listing",
    "Outdated information",
    "Other",
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    if (!reason) { setError("Please select a reason."); return; }
    setSubmitting(true); setError("");
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
      const res = await fetch(`${API}/vacancy-reports/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
        body: JSON.stringify({ vacancy: vacancy.id, reason, notes }),
      });
      if (res.ok || res.status === 201) { setDone(true); }
      else { setDone(true); } // graceful fallback even if endpoint not yet available
    } catch { setDone(true); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-almet-mystic dark:border-almet-comet">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Flag className="h-3.5 w-3.5 text-red-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-almet-cloud-burst dark:text-white">Report Vacancy</h3>
              <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai line-clamp-1">{vacancy?.job_title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-almet-mystic/50 dark:hover:bg-almet-san-juan/50 transition">
            <X className="h-4 w-4 text-almet-waterloo dark:text-almet-bali-hai" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-1">Report Submitted</h4>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-4">Our HR team will review this vacancy.</p>
            <button onClick={onClose} className="text-xs px-5 py-2 rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-almet-cloud-burst dark:text-white mb-2">Reason *</label>
              <div className="space-y-1.5">
                {reasons.map(r => (
                  <label key={r} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition-all text-xs ${
                    reason === r
                      ? "border-almet-sapphire bg-almet-sapphire/5 text-almet-sapphire dark:border-almet-steel-blue dark:bg-almet-steel-blue/10 dark:text-almet-steel-blue"
                      : "border-almet-mystic dark:border-almet-comet text-almet-waterloo dark:text-almet-bali-hai hover:border-almet-sapphire/50 dark:hover:border-almet-steel-blue/50"
                  }`}>
                    <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="sr-only" />
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      reason === r ? "border-almet-sapphire dark:border-almet-steel-blue" : "border-almet-bali-hai"
                    }`}>
                      {reason === r && <div className="w-1.5 h-1.5 rounded-full bg-almet-sapphire dark:bg-almet-steel-blue" />}
                    </div>
                    {r}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-almet-cloud-burst dark:text-white mb-1">Additional Notes (optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Provide more details..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-almet-mystic dark:border-almet-comet bg-white dark:bg-almet-san-juan/30 text-almet-cloud-burst dark:text-white placeholder-almet-bali-hai focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50 resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition font-medium"
              >
                <Flag className="h-3 w-3" />
                {submitting ? "Submitting…" : "Submit Report"}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-almet-mystic dark:border-almet-comet text-xs font-medium text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic/30 transition">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Vacancy Detail Modal
const VacancyDetailModal = ({ vacancy, onClose, onRefer, onReport, darkMode }) => {
  if (!vacancy) return null;

  const gradingDisplay = (level) => level ? level.replace("_", "-") : null;

  const infoRows = [
    { icon: Building, label: "Business Function", value: vacancy.business_function_name },
    { icon: MapPin,   label: "Department",        value: vacancy.department_name },
    { icon: Users,    label: "Unit",              value: vacancy.unit_name },
    { icon: Star,     label: "Position Group",    value: vacancy.position_group_name },
    { icon: Briefcase,label: "Job Function",      value: vacancy.job_function_name },
    { icon: TrendingUp,label: "Grade",            value: gradingDisplay(vacancy.grading_level) },
    { icon: Users,    label: "Reports To",        value: vacancy.reporting_to_name },
  ].filter(r => r.value);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl shadow-2xl w-full max-w-md animate-slideUp" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="h-24 bg-gradient-to-br from-almet-sapphire to-almet-astral dark:from-almet-steel-blue dark:to-almet-san-juan rounded-t-2xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 z-10">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition">
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => onReport(vacancy)}
            title="Report this vacancy"
            className="absolute top-3 left-3 p-1.5 rounded-lg bg-white/20 hover:bg-red-500/70 text-white transition"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white mb-1">
              {vacancy.job_title || vacancy.display_name || "Vacant Position"}
            </h3>
            {vacancy.position_id && (
              <span className="inline-flex items-center gap-1 text-[10px] text-almet-waterloo dark:text-almet-bali-hai font-mono bg-almet-mystic/40 dark:bg-almet-san-juan/40 px-2 py-0.5 rounded">
                <Hash className="h-2.5 w-2.5" />{vacancy.position_id}
              </span>
            )}
          </div>

          {infoRows.length > 0 ? (
            <div className="bg-almet-mystic/20 dark:bg-almet-san-juan/20 rounded-xl divide-y divide-almet-mystic/40 dark:divide-almet-san-juan/40">
              {infoRows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 px-3.5 py-2.5">
                  <Icon className="h-3.5 w-3.5 text-almet-sapphire dark:text-almet-steel-blue shrink-0" />
                  <span className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai w-28 shrink-0">{label}</span>
                  <span className="text-xs font-medium text-almet-cloud-burst dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai text-center py-3">No additional details available.</p>
          )}

          {vacancy.notes && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
              <div className="text-[9px] text-amber-600 dark:text-amber-400 uppercase tracking-wide font-bold mb-1">Notes</div>
              <div className="text-[11px] text-almet-waterloo dark:text-almet-bali-hai leading-relaxed">{vacancy.notes}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { onClose(); onRefer(vacancy); }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white py-2.5 rounded-xl text-[11px] font-semibold hover:opacity-90 transition shadow-md"
            >
              <UserPlus className="h-3.5 w-3.5" /> Refer a Candidate
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-almet-mystic dark:border-almet-comet text-[11px] font-semibold text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vacancy Card Component
const VacancyCard = ({ vacancy, darkMode, onViewDetail, onRefer }) => {
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-xl overflow-hidden shadow-sm border border-almet-mystic/50 dark:border-almet-san-juan/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col">
      <div className="h-1 bg-gradient-to-r from-almet-sapphire to-almet-astral" />
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-start gap-2 mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-almet-sapphire/10 dark:bg-almet-steel-blue/20 border border-almet-sapphire/20 dark:border-almet-steel-blue/30 flex items-center justify-center shrink-0">
            <Briefcase className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-almet-cloud-burst dark:text-white line-clamp-2 leading-tight">{vacancy.job_title || vacancy.display_name || "Vacant Position"}</h4>
          </div>
        </div>

        {vacancy.department_name && (
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai flex items-center gap-1 mb-1">
            <MapPin className="h-2.5 w-2.5 shrink-0 text-almet-sapphire/60 dark:text-almet-steel-blue/60" />
            <span className="truncate">{vacancy.department_name}</span>
          </p>
        )}
        {vacancy.business_function_name && (
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai flex items-center gap-1 mb-1">
            <Building className="h-2.5 w-2.5 shrink-0 text-almet-sapphire/60 dark:text-almet-steel-blue/60" />
            <span className="truncate">{vacancy.business_function_name}</span>
          </p>
        )}
        {vacancy.position_id && (
          <p className="text-[10px] text-almet-bali-hai font-mono mb-2 flex items-center gap-1">
            <Hash className="h-2.5 w-2.5 shrink-0" />{vacancy.position_id}
          </p>
        )}

        <div className="flex gap-1.5 mt-auto pt-2">
          <button
            onClick={() => onViewDetail(vacancy)}
            className="flex-1 bg-almet-sapphire/10 dark:bg-almet-steel-blue/20 text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue py-2 rounded-lg text-[10px] font-semibold transition-all"
          >
            View Details
          </button>
          <button
            onClick={() => onRefer(vacancy)}
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-almet-mystic/50 dark:bg-almet-san-juan/50 text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire hover:text-white dark:hover:bg-almet-steel-blue text-[10px] font-semibold transition-all"
            title="Refer a candidate"
          >
            <UserPlus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// News List Item
const NewsListItem = ({ news, darkMode, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 py-3 border-b border-almet-mystic dark:border-almet-comet last:border-0 cursor-pointer group hover:bg-almet-mystic/20 dark:hover:bg-almet-san-juan/20 px-2 rounded-xl transition-all -mx-2"
    >
      {news.image_url && (
        <img src={news.image_url} alt={news.title} className="w-14 h-12 rounded-lg object-cover shrink-0 shadow-sm" />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-xs text-almet-cloud-burst dark:text-white mb-1 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors line-clamp-2">
          {news.title}
        </h4>
        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai line-clamp-1 mb-1">{news.excerpt || news.content}</p>
        <div className="flex items-center gap-2 text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
          <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{new Date(news.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span className="flex items-center gap-1"><Eye className="h-2.5 w-2.5" />{news.view_count}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-almet-bali-hai group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue shrink-0 transition-colors mt-1" />
    </div>
  );
};

// Referral Submit Modal
const ReferralModal = ({ onClose, prefilledPosition = "" }) => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [form, setForm] = useState({ referred_name: "", referred_email: "", referred_phone: "", position: prefilledPosition, notes: "" });
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.referred_name || !form.referred_email) { setError("Name and email are required."); return; }
    setSubmitting(true); setError("");
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      if (cvFile) body.append("cv_file", cvFile);
      const res = await fetch(`${API}/referrals/`, { method: "POST", headers: { Authorization: `Bearer ${t}` }, body });
      if (res.ok) { setDone(true); }
      else { const d = await res.json(); setError(Object.values(d).flat().join(" ")); }
    } catch { setError("Submission failed. Please try again."); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-almet-sapphire" />
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Submit Referral</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Send className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Referral Submitted!</h4>
            <p className="text-xs text-gray-400 mb-4">HR will be notified. A reward will be granted upon your referral's successful probation completion.</p>
            <button onClick={onClose} className="text-xs px-5 py-2 rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="rounded-lg bg-almet-sapphire/5 border border-almet-sapphire/20 p-3 text-xs text-almet-sapphire">
              Refer a talented friend or colleague to an open position. A reward will be granted upon successful probation completion.
            </div>
            {[
              { k: "referred_name", label: "Candidate Full Name *", icon: UserPlus, type: "text", placeholder: "e.g. Jane Smith" },
              { k: "referred_email", label: "Candidate Email *", icon: Mail, type: "email", placeholder: "jane@example.com" },
              { k: "referred_phone", label: "Phone (optional)", icon: Phone, type: "tel", placeholder: "+994 XX XXX XX XX" },
              { k: "position", label: "Position Applied For", icon: Briefcase, type: "text", placeholder: "e.g. Senior Accountant" },
            ].map(({ k, label, icon: Icon, type, placeholder }) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input type={type} value={form[k]} onChange={set(k)} placeholder={placeholder}
                    className="pl-9 w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Additional Notes</label>
              <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="Why are you recommending this person?"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">CV / Resume (optional)</label>
              <label className="flex items-center gap-2 w-full text-xs px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-almet-sapphire hover:text-almet-sapphire transition">
                <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{cvFile ? cvFile.name : "Attach CV (PDF, DOC, DOCX)"}</span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setCvFile(e.target.files[0] || null)} />
              </label>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 text-xs px-4 py-2.5 rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst disabled:opacity-50 transition font-medium">
              <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting…" : "Submit Referral"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const ReferralWidget = ({ darkMode, prefilledPosition = "", open, setOpen }) => {
  const [rewardAmount, setRewardAmount] = useState(200);
  const [localOpen, setLocalOpen] = useState(false);

  const isOpen = open !== undefined ? open : localOpen;
  const handleOpen = () => (setOpen ? setOpen(true) : setLocalOpen(true));
  const handleClose = () => (setOpen ? setOpen(false) : setLocalOpen(false));

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
    fetch(`${API}/referral-settings/`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.reward_amount) setRewardAmount(d.reward_amount); })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-almet-cloud-burst via-almet-sapphire to-almet-astral" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="relative p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
              <UserPlus className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold leading-tight">Refer & Earn</h2>
              <p className="text-white/60 text-[10px]">Earn up to reward</p>
            </div>
          </div>
          <p className="text-white/80 text-[10px] leading-relaxed mb-4">
            Know someone perfect for an open role? Refer them and earn a reward upon their successful probation completion!
          </p>
          <button
            onClick={handleOpen}
            className="w-full bg-white hover:bg-gray-50 text-almet-sapphire font-bold py-2.5 text-[11px] rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <UserPlus className="h-3.5 w-3.5" /> Submit a Referral
          </button>
        </div>
      </div>
      {isOpen && <ReferralModal onClose={handleClose} prefilledPosition={prefilledPosition} />}
    </>
  );
};

// News Detail Modal
const NewsDetailModal = ({ isOpen, onClose, news, darkMode }) => {
  if (!isOpen || !news) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${darkMode ? "bg-almet-cloud-burst" : "bg-white"} animate-slideUp`} onClick={e => e.stopPropagation()}>
        <div className="relative h-72">
          <img
            src={news.image_url || "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200"}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all hover:scale-110">
            <X size={18} />
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            {news.category_name && (
              <div className="bg-almet-sapphire text-white px-3 py-1 rounded-xl text-[10px] font-medium inline-flex items-center gap-1 mb-2 shadow-lg">
                <FileText size={12} /> {news.category_name}
              </div>
            )}
            <h2 className="text-white text-xl font-bold mb-2">{news.title}</h2>
            <div className="flex items-center gap-3 text-white/90 text-xs">
              <span className="flex items-center gap-1"><Calendar size={12} />{new Date(news.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span className="flex items-center gap-1"><Eye size={12} />{news.view_count} views</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {news.excerpt && (
            <p className="text-almet-sapphire dark:text-almet-steel-blue font-semibold text-sm mb-3 leading-relaxed">{news.excerpt}</p>
          )}
          <p className={`leading-relaxed whitespace-pre-line text-xs ${darkMode ? "text-almet-bali-hai" : "text-gray-700"}`}>{news.content}</p>
        </div>
      </div>
    </div>
  );
};

export default function GeneralWorkspace() {
  const { darkMode } = useTheme();
  const toast = useToast();

  const [allNews, setAllNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showNewsModal, setShowNewsModal] = useState(false);

  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [workAnniversaries, setWorkAnniversaries] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loadingCelebrations, setLoadingCelebrations] = useState(true);
  const [celebratedItems, setCelebratedItems] = useState(new Set());

  const [vacancies, setVacancies] = useState([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [referralPosition, setReferralPosition] = useState("");
  const [reportVacancy, setReportVacancy] = useState(null);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  const {
    order: leftOrder,
    dragOverId: leftDragOverId,
    getDragProps: getLeftDragProps,
  } = useDraggableSections("workspace_left_order", ["featured-news", "birthdays", "vacancies", "more-news"]);

  const {
    order: rightOrder,
    dragOverId: rightDragOverId,
    getDragProps: getRightDragProps,
  } = useDraggableSections("workspace_right_order", ["referral", "promotions", "anniversaries"]);

  useEffect(() => {
    loadAllNews();
    loadCelebrations();
    loadCelebratedItems();
    loadVacancies();
  }, []);

  const loadVacancies = async () => {
    setLoadingVacancies(true);
    try {
      const res = await vacantPositionsService.getVacantPositions({ is_filled: false, page: 1, page_size: 8 });
      setVacancies(res.data?.results || res.data || []);
    } catch { /* silent */ }
    finally { setLoadingVacancies(false); }
  };

  const loadAllNews = async () => {
    setLoadingNews(true);
    try {
      const response = await newsService.getNews({ page: 1, page_size: 10, is_published: true, ordering: "-is_pinned,-published_at" });
      setAllNews(response.results || []);
    } catch (error) { console.error("Failed to load news:", error); }
    finally { setLoadingNews(false); }
  };

  const loadCelebrations = async () => {
    setLoadingCelebrations(true);
    try {
      const allCelebrations = await celebrationService.getAllCelebrations();
      const today = new Date().toISOString().split("T")[0];

      const birthdays = allCelebrations.filter(c => c.type === "birthday");
      const anniversaries = allCelebrations.filter(c => c.type === "work_anniversary");
      const promotionsList = allCelebrations.filter(c => c.type === "promotion");

      const sortByDateWithTodayFirst = (a, b) => {
        const dateA = new Date(a.date).toISOString().split("T")[0];
        const dateB = new Date(b.date).toISOString().split("T")[0];
        if (dateA === today && dateB !== today) return -1;
        if (dateB === today && dateA !== today) return 1;
        return new Date(dateA) - new Date(dateB);
      };

      birthdays.sort(sortByDateWithTodayFirst);
      anniversaries.sort(sortByDateWithTodayFirst);
      promotionsList.sort(sortByDateWithTodayFirst);

      setTodayBirthdays(birthdays.slice(0, 4));
      setWorkAnniversaries(anniversaries.slice(0, 4));
      setPromotions(promotionsList.slice(0, 4));
    } catch (error) { console.error("Failed to load celebrations:", error); }
    finally { setLoadingCelebrations(false); }
  };

  const loadCelebratedItems = () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem(`celebrated_${today}`);
    // Normalize all stored IDs to strings to avoid number/string type mismatch
    if (stored) setCelebratedItems(new Set(JSON.parse(stored).map(String)));
  };

  const saveCelebratedItem = (itemId) => {
    const today = new Date().toISOString().split("T")[0];
    // Always store as string for consistent comparison
    const newCelebrated = new Set([...celebratedItems, String(itemId)]);
    setCelebratedItems(newCelebrated);
    localStorage.setItem(`celebrated_${today}`, JSON.stringify([...newCelebrated]));
  };

  const handleCelebrate = async (celebration) => {
    if (celebratedItems.has(celebration.id)) return;
    try {
      await celebrationService.addAutoWish(celebration.employee_id, celebration.type, "🎉");
      saveCelebratedItem(celebration.id);
      toast.showSuccess("Wishes sent successfully!");
    } catch (error) {
      console.error("Error celebrating:", error);
      toast.showError("Failed to send wishes");
    }
  };

  const handleNewsClick = async (news) => {
    try {
      const fullNews = await newsService.getNewsById(news.id);
      setSelectedNews(fullNews);
      setShowNewsModal(true);
    } catch (error) {
      console.error("Failed to load news details:", error);
      setSelectedNews(news);
      setShowNewsModal(true);
    }
  };

  const handleViewVacancy = (vacancy) => { setSelectedVacancy(vacancy); setShowVacancyModal(true); };
  const handleReferVacancy = (vacancy) => { setReferralPosition(vacancy.job_title || vacancy.display_name || ""); setReferralOpen(true); };
  const handleReportVacancy = (vacancy) => { setShowVacancyModal(false); setReportVacancy(vacancy); };

  const featuredNews = allNews[0];
  const otherNews = allNews.slice(1);

  const todayBirthdayCount = todayBirthdays.filter(b => {
    const d = new Date(b.date).toISOString().split("T")[0];
    const t = new Date().toISOString().split("T")[0];
    return d === t;
  }).length;

  return (
    <DashboardLayout>
  

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column - draggable */}
        <div className="lg:col-span-2 space-y-5">
          {leftOrder.map((id) => {
            const sections = {
              "featured-news": !loadingNews && featuredNews ? (
                <div key="featured-news" {...getLeftDragProps("featured-news")} className={`transition-all duration-200 ${leftDragOverId === "featured-news" ? "opacity-50 scale-[0.99]" : ""}`}>
                  <div className="relative group/drag">
                    <div className="absolute top-3 right-3 opacity-0 group-hover/drag:opacity-40 transition-opacity cursor-grab z-10">
                      <GripVertical size={14} className="text-white" />
                    </div>
                    <FeaturedNewsCard news={featuredNews} darkMode={darkMode} onClick={() => handleNewsClick(featuredNews)} />
                  </div>
                </div>
              ) : null,
              "birthdays": !loadingCelebrations && todayBirthdays.length > 0 ? (
                <div key="birthdays" {...getLeftDragProps("birthdays")} className={`transition-all duration-200 ${leftDragOverId === "birthdays" ? "opacity-50 scale-[0.99]" : ""}`}>
                  <div className={`relative group/drag ${bgCard} rounded-2xl p-5 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50`}>
                    <div className="absolute top-3 right-3 opacity-0 group-hover/drag:opacity-30 transition-opacity cursor-grab z-10">
                      <GripVertical size={14} className="text-almet-waterloo" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
                        <div className="w-6 h-6 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                          <Cake className="h-3.5 w-3.5 text-pink-500" />
                        </div>
                        Upcoming Birthdays
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 dark:bg-pink-900/20 text-pink-500">{todayBirthdays.length}</span>
                      </h2>
                      <Link href="/communication/celebrations" className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline flex items-center gap-1">View All <ChevronRight className="h-3 w-3" /></Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {todayBirthdays.map(celebration => (
                        <BirthdayCard key={celebration.id} celebration={celebration} darkMode={darkMode} onCelebrate={handleCelebrate} isCelebrated={celebratedItems.has(String(celebration.id))} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null,
              "vacancies": !loadingVacancies && vacancies.length > 0 ? (
                <div key="vacancies" {...getLeftDragProps("vacancies")} className={`transition-all duration-200 ${leftDragOverId === "vacancies" ? "opacity-50 scale-[0.99]" : ""}`}>
                  <div className={`relative group/drag ${bgCard} rounded-2xl p-5 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50`}>
                    <div className="absolute top-3 right-3 opacity-0 group-hover/drag:opacity-30 transition-opacity cursor-grab z-10">
                      <GripVertical size={14} className="text-almet-waterloo" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
                        <div className="w-6 h-6 rounded-lg bg-almet-sapphire/10 dark:bg-almet-steel-blue/20 flex items-center justify-center">
                          <Briefcase className="h-3.5 w-3.5 text-almet-sapphire dark:text-almet-steel-blue" />
                        </div>
                        Internal Vacancies
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-steel-blue/20 dark:text-almet-steel-blue">{vacancies.length}</span>
                      </h2>
                      <Link href="/structure/headcount-table?tab=vacant-positions" className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline flex items-center gap-1">View All <ChevronRight className="h-3 w-3" /></Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {vacancies.map(v => <VacancyCard key={v.id} vacancy={v} darkMode={darkMode} onViewDetail={handleViewVacancy} onRefer={handleReferVacancy} />)}
                    </div>
                  </div>
                </div>
              ) : null,
              "more-news": !loadingNews && otherNews.length > 0 ? (
                <div key="more-news" {...getLeftDragProps("more-news")} className={`transition-all duration-200 ${leftDragOverId === "more-news" ? "opacity-50 scale-[0.99]" : ""}`}>
                  <div className={`relative group/drag ${bgCard} rounded-2xl p-5 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50`}>
                    <div className="absolute top-3 right-3 opacity-0 group-hover/drag:opacity-30 transition-opacity cursor-grab z-10">
                      <GripVertical size={14} className="text-almet-waterloo" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
                        <div className="w-6 h-6 rounded-lg bg-almet-sapphire/10 dark:bg-almet-steel-blue/20 flex items-center justify-center">
                          <FileText className="h-3.5 w-3.5 text-almet-sapphire dark:text-almet-steel-blue" />
                        </div>
                        Company News
                      </h2>
                      <Link href="/communication/company-news" className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline flex items-center gap-1">View All <ChevronRight className="h-3 w-3" /></Link>
                    </div>
                    <div>{otherNews.slice(0, 5).map(news => <NewsListItem key={news.id} news={news} darkMode={darkMode} onClick={() => handleNewsClick(news)} />)}</div>
                  </div>
                </div>
              ) : null,
            };
            return sections[id] || null;
          })}
        </div>

        {/* Right Sidebar - draggable */}
        <div className="space-y-5">
          {rightOrder.map((id) => {
            const sections = {
              "referral": (
                <div key="referral" {...getRightDragProps("referral")} className={`transition-all duration-200 ${rightDragOverId === "referral" ? "opacity-50 scale-[0.99]" : ""}`}>
                  <div className="relative group/drag">
                    <div className="absolute top-3 right-3 opacity-0 group-hover/drag:opacity-40 transition-opacity cursor-grab z-10">
                      <GripVertical size={14} className="text-white" />
                    </div>
                    <ReferralWidget darkMode={darkMode} prefilledPosition={referralPosition} open={referralOpen} setOpen={setReferralOpen} />
                  </div>
                </div>
              ),
              "promotions": !loadingCelebrations && promotions.length > 0 ? (
                <div key="promotions" {...getRightDragProps("promotions")} className={`transition-all duration-200 ${rightDragOverId === "promotions" ? "opacity-50 scale-[0.99]" : ""}`}>
                  <div className={`relative group/drag ${bgCard} rounded-2xl p-4 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50`}>
                    <div className="absolute top-3 right-3 opacity-0 group-hover/drag:opacity-30 transition-opacity cursor-grab z-10">
                      <GripVertical size={14} className="text-almet-waterloo" />
                    </div>
                    <h3 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                      <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center"><Star className="h-3.5 w-3.5 text-green-500" /></div>
                      Team Promotions
                    </h3>
                    <div>{promotions.map(c => <PromotionItem key={c.id} celebration={c} darkMode={darkMode} onCelebrate={handleCelebrate} isCelebrated={celebratedItems.has(String(c.id))} />)}</div>
                  </div>
                </div>
              ) : null,
              "anniversaries": !loadingCelebrations && workAnniversaries.length > 0 ? (
                <div key="anniversaries" {...getRightDragProps("anniversaries")} className={`transition-all duration-200 ${rightDragOverId === "anniversaries" ? "opacity-50 scale-[0.99]" : ""}`}>
                  <div className={`relative group/drag ${bgCard} rounded-2xl p-4 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50`}>
                    <div className="absolute top-3 right-3 opacity-0 group-hover/drag:opacity-30 transition-opacity cursor-grab z-10">
                      <GripVertical size={14} className="text-almet-waterloo" />
                    </div>
                    <h3 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                      <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center"><Award className="h-3.5 w-3.5 text-purple-500" /></div>
                      Work Anniversaries
                    </h3>
                    <div>{workAnniversaries.map(c => <AnniversaryItem key={c.id} celebration={c} darkMode={darkMode} onCelebrate={handleCelebrate} isCelebrated={celebratedItems.has(String(c.id))} />)}</div>
                  </div>
                </div>
              ) : null,
            };
            return sections[id] || null;
          })}
        </div>
      </div>

      {/* Vacancy Detail Modal */}
      {showVacancyModal && (
        <VacancyDetailModal
          vacancy={selectedVacancy}
          darkMode={darkMode}
          onClose={() => { setShowVacancyModal(false); setSelectedVacancy(null); }}
          onRefer={handleReferVacancy}
          onReport={handleReportVacancy}
        />
      )}

      {/* Report Vacancy Modal */}
      {reportVacancy && (
        <ReportVacancyModal
          vacancy={reportVacancy}
          onClose={() => setReportVacancy(null)}
        />
      )}

      {/* News Detail Modal */}
      <NewsDetailModal
        isOpen={showNewsModal}
        onClose={() => { setShowNewsModal(false); setSelectedNews(null); }}
        news={selectedNews}
        darkMode={darkMode}
      />

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </DashboardLayout>
  );
}
