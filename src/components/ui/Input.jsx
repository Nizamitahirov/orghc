"use client";
import { forwardRef } from "react";

const SIZES = {
  sm: "px-2.5 py-1.5 text-xs rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-base rounded-xl",
};

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    size = "md",
    darkMode = false,
    prefix: Prefix,
    suffix: Suffix,
    className = "",
    required,
    id,
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const base = [
    "w-full border transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-almet-sapphire/40 focus:border-almet-sapphire",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    SIZES[size],
    error
      ? "border-red-500 bg-red-50/30 dark:bg-red-900/10"
      : darkMode
      ? "bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
      : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500",
    (Prefix || Suffix) ? "pl-9" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-1 ${
            darkMode ? "text-gray-300" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Prefix className="w-4 h-4" />
          </div>
        )}
        <input ref={ref} id={inputId} className={base} {...props} />
        {Suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            <Suffix className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {hint && !error && (
        <p className={`mt-1 text-xs ${darkMode ? "text-gray-500" : "text-gray-400 dark:text-gray-500"}`}>
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
