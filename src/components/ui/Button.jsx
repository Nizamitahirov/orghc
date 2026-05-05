"use client";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

// ── Variant map ───────────────────────────────────────────────────────────────
const VARIANTS = {
  primary:   "bg-almet-sapphire text-white hover:bg-almet-cloud-burst focus-visible:ring-almet-sapphire",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus-visible:ring-gray-400",
  danger:    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  success:   "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  warning:   "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400",
  ghost:     "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus-visible:ring-gray-400",
  outline:   "border border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white dark:border-almet-astral dark:text-almet-astral dark:hover:bg-almet-astral dark:hover:text-white focus-visible:ring-almet-sapphire",
  link:      "bg-transparent text-almet-sapphire underline-offset-4 hover:underline focus-visible:ring-almet-sapphire p-0 h-auto",
};

// ── Size map ──────────────────────────────────────────────────────────────────
const SIZES = {
  xs: "px-2.5 py-1 text-xs rounded-md gap-1",
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-lg gap-2",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2",
};

// ── Component ─────────────────────────────────────────────────────────────────
const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    fullWidth = false,
    className = "",
    type = "button",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "active:scale-[0.97] active:brightness-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children && <span>{children}</span>}
      {!loading && IconRight && <IconRight className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
});

export default Button;
