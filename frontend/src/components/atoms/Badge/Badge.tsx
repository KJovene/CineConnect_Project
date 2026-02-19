import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "indigo" | "emerald";
}

const variants: Record<string, string> = {
  default: "bg-white/5 border-white/10 text-neutral-400",
  indigo: "bg-indigo-500/20 border-indigo-500/20 text-indigo-300",
  emerald: "bg-emerald-500/20 border-emerald-500/20 text-emerald-300",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide border uppercase backdrop-blur-md ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
