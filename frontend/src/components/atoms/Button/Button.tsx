import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "icon" | "danger";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      "py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
      "p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg",
    icon: "w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-neutral-400 hover:text-white",
    danger:
      "flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-rose-400",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`transition-colors font-medium ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading && variant === "primary" ? `${children}…` : children}
    </button>
  );
}
