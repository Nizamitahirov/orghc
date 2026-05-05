"use client";
import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, X, Sparkles, LayoutDashboard, Clock, Search, Zap, Bell } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    iconColor: "text-almet-sapphire",
    iconBg: "bg-almet-sapphire/10",
    title: "Welcome to MyAlmet! 👋",
    description:
      "Your all-in-one HR platform for managing vacations, performance, training, and more. Let us give you a quick tour.",
  },
  {
    icon: LayoutDashboard,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    title: "Your Personal Dashboard",
    description:
      "The dashboard shows your vacation balance, latest company news, pending tasks, and quick-access shortcuts — all in one place.",
  },
  {
    icon: Clock,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    title: "Pending Actions (Managers)",
    description:
      "If you're a manager or HR, your pending approval requests appear right on the dashboard so you never miss them.",
  },
  {
    icon: Search,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    title: "Global Search — Ctrl+K",
    description:
      "Press Ctrl+K (or ⌘K on Mac) anytime to instantly search for any page or employee across the entire system.",
  },
  {
    icon: Zap,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
    title: "Enterprise Systems Hub",
    description:
      "Scroll down to the Enterprise Systems section for quick links to every module: Structure, Efficiency, Training, Requests, and more.",
  },
  {
    icon: Bell,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    title: "Widgets are Draggable",
    description:
      "The Quick Action cards on the right side of your dashboard can be drag & dropped to reorder them however you like. Your layout is saved automatically.",
  },
];

const TOUR_KEY = "almet_onboarding_tour_v1";

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const done = localStorage.getItem(TOUR_KEY);
      if (!done) {
        const t = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const complete = () => {
    try { localStorage.setItem(TOUR_KEY, "true"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl shadow-2xl w-full max-w-sm border border-almet-mystic dark:border-almet-san-juan p-6 relative">
        {/* Close */}
        <button
          onClick={complete}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 transition-colors"
        >
          <X size={14} />
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-almet-sapphire dark:bg-almet-steel-blue"
                  : i < step
                  ? "w-1.5 bg-almet-sapphire/40 dark:bg-almet-steel-blue/40"
                  : "w-1.5 bg-almet-mystic dark:bg-almet-san-juan"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl ${current.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`h-7 w-7 ${current.iconColor}`} />
          </div>
          <h2 className="text-base font-bold text-almet-cloud-burst dark:text-white mb-2 leading-tight">
            {current.title}
          </h2>
          <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Step counter */}
        <p className="text-center text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-4">
          {step + 1} / {STEPS.length}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={complete}
            className="text-xs text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-cloud-burst dark:hover:text-white transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="p-2 rounded-xl border border-almet-mystic dark:border-almet-san-juan hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-almet-cloud-burst dark:text-white" />
              </button>
            )}
            <button
              onClick={() => (isLast ? complete() : setStep((s) => s + 1))}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-almet-sapphire to-almet-astral text-white text-sm font-semibold flex items-center gap-1.5 hover:shadow-lg hover:scale-105 transition-all"
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
