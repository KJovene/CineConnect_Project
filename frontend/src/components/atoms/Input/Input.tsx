import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", style, ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all ${className}`}
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text)",
        ...style,
      }}
      {...props}
    />
  );
}
