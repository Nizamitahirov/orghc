"use client";

// Variants match employee status colors used across the app
const VARIANTS = {
  default:  "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  active:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  inactive: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
  pending:  "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  danger:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info:     "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  primary:  "bg-almet-mystic text-almet-sapphire dark:bg-almet-sapphire/20 dark:text-almet-astral",
};

const SIZES = {
  xs: "px-1.5 py-0.5 text-[10px] rounded",
  sm: "px-2 py-0.5 text-xs rounded-md",
  md: "px-2.5 py-1 text-xs rounded-lg",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  icon: Icon,
  className = "",
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 font-medium",
        VARIANTS[variant] || VARIANTS.default,
        SIZES[size] || SIZES.sm,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            variant === "active"
              ? "bg-emerald-500"
              : variant === "danger"
              ? "bg-red-500"
              : variant === "pending"
              ? "bg-amber-500"
              : "bg-gray-400"
          }`}
        />
      )}
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {children}
    </span>
  );
}
