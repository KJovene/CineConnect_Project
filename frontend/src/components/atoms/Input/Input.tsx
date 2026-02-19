import React from "react";

export const inputClassName =
  "w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return <input className={`${inputClassName} ${className}`} {...props} />;
}
