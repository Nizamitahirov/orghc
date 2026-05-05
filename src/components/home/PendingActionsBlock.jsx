"use client";
import { useState, useEffect } from "react";
import { Clock, ChevronRight, Umbrella, CheckCircle, XCircle, PlaneTakeoff, Repeat, FileText } from "lucide-react";
import { VacationService } from "@/services/vacationService";
import { BusinessTripService } from "@/services/businessTripService";
import handoverService from "@/services/handoverService";
import jobDescriptionService from "@/services/jobDescriptionService";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TYPE_CONFIG = {
  vacation:     { icon: Umbrella,     color: "orange",  label: "Vacation",      path: "/requests/vacation" },
  business_trip:{ icon: PlaneTakeoff, color: "sky",     label: "Business Trip", path: "/requests/business-trip" },
  handover:     { icon: Repeat,       color: "purple",  label: "Handover",      path: "/requests/handover-takeover" },
  job_desc:     { icon: FileText,     color: "teal",    label: "Job Description", path: "/structure/job-descriptions" },
};

const colorClasses = {
  orange: { card: "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: "text-orange-500" },
  sky:    { card: "bg-sky-50 dark:bg-sky-900/10 border-sky-100 dark:border-sky-900/30 hover:border-sky-300 dark:hover:border-sky-700",       badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",       icon: "text-sky-500" },
  purple: { card: "bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: "text-purple-500" },
  teal:   { card: "bg-teal-50 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30 hover:border-teal-300 dark:hover:border-teal-700", badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400", icon: "text-teal-500" },
};

const stageColor = (stage) => {
  if (stage === "LM") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (stage === "HR") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function PendingActionsBlock({ userRole }) {
  const router = useRouter();
  const [pending, setPending] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === "admin" || userRole === "manager") {
      loadPending();
    } else {
      setLoading(false);
    }
  }, [userRole]);

  const loadPending = async () => {
    try {
      const [vacData, tripData, handoverData, jdData] = await Promise.allSettled([
        VacationService.getPendingRequests(),
        BusinessTripService.getPendingApprovals(),
        handoverService.getPendingApprovals(),
        jobDescriptionService.getPendingApprovals(),
      ]);

      const all = [];

      // Vacation
      if (vacData.status === "fulfilled" && vacData.value) {
        const v = vacData.value;
        const lm = (v.line_manager_requests || []).map((r) => ({ ...r, _type: "vacation", stage: "LM" }));
        const hr = (v.hr_requests || []).map((r) => ({ ...r, _type: "vacation", stage: "HR" }));
        const uk = (v.uk_additional_requests || []).map((r) => ({ ...r, _type: "vacation", stage: "UK" }));
        all.push(...lm, ...hr, ...uk);
      }

      // Business trips
      if (tripData.status === "fulfilled" && tripData.value) {
        const trips = Array.isArray(tripData.value) ? tripData.value : (tripData.value.results || tripData.value.data || []);
        trips.forEach((r) => {
          all.push({
            ...r,
            _type: "business_trip",
            employee_name: r.employee_name || r.requester_name || r.full_name,
            start_date: r.start_date || r.departure_date,
            end_date: r.end_date || r.return_date,
            stage: r.current_stage || r.status || "LM",
          });
        });
      }

      // Handovers
      if (handoverData.status === "fulfilled" && handoverData.value) {
        const handovers = Array.isArray(handoverData.value) ? handoverData.value : (handoverData.value.results || handoverData.value.data || []);
        handovers.forEach((r) => {
          all.push({
            ...r,
            _type: "handover",
            employee_name: r.employee_name || r.from_employee_name || r.submitter_name,
            start_date: r.start_date || r.handover_date,
            end_date: r.end_date || r.takeover_date,
            stage: "LM",
          });
        });
      }

      // Job descriptions
      if (jdData.status === "fulfilled" && jdData.value) {
        const jds = Array.isArray(jdData.value) ? jdData.value : (jdData.value.results || jdData.value.data || []);
        jds.forEach((r) => {
          all.push({
            ...r,
            _type: "job_desc",
            employee_name: r.employee_name || r.assigned_to_name || r.job_title,
            start_date: r.created_at || r.submitted_at,
            end_date: null,
            stage: "LM",
          });
        });
      }

      setPending(all.slice(0, 4));
      setTotal(all.length);
    } catch (err) {
      console.error("Failed to load pending actions:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!userRole || userRole === "employee") return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan animate-pulse">
        <div className="h-5 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-almet-mystic/20 dark:bg-almet-san-juan/20 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (total === 0) return null;

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Pending Actions
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            {total}
          </span>
        </h2>
        <Link
          href="/requests/vacation"
          className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline flex items-center gap-1"
        >
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pending.map((req, idx) => {
          const type = req._type || "vacation";
          const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.vacation;
          const cls = colorClasses[cfg.color];
          const Icon = cfg.icon;
          return (
            <div
              key={req.id || req.request_id || idx}
              onClick={() => router.push(cfg.path)}
              className={`p-3 ${cls.card} border rounded-xl cursor-pointer hover:shadow-md transition-all group`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon className={`h-3.5 w-3.5 ${cls.icon} flex-shrink-0`} />
                  <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white truncate">
                    {req.employee_name}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${stageColor(req.stage)}`}>
                  {req.stage}
                </span>
              </div>
              <p className={`text-[10px] font-medium ${cls.icon} mb-1`}>{cfg.label}</p>
              <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai truncate">
                {req.vacation_type || req.vacation_type_name || req.trip_destination || req.title || ""}
              </p>
              {req.start_date && (
                <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-2">
                  {formatDate(req.start_date)}{req.end_date ? ` → ${formatDate(req.end_date)}` : ""}
                </p>
              )}
              {req.days || req.number_of_days ? (
                <span className={`text-[10px] font-bold ${cls.icon}`}>
                  {req.days || req.number_of_days} days
                </span>
              ) : null}
            </div>
          );
        })}

        {total > 4 && (
          <div
            onClick={() => router.push("/requests/vacation")}
            className="p-3 bg-almet-mystic/20 dark:bg-almet-san-juan/20 border border-almet-mystic dark:border-almet-san-juan rounded-xl cursor-pointer hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-1"
          >
            <span className="text-2xl font-bold text-almet-sapphire dark:text-almet-steel-blue">+{total - 4}</span>
            <span className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">more pending</span>
          </div>
        )}
      </div>
    </div>
  );
}
