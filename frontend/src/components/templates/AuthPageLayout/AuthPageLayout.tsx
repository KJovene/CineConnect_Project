import type { ReactNode } from "react";
import { Logo } from "@/components/atoms";
import { ThemeToggle } from "@/components/atoms";

export interface AuthPageLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPageLayout({ title, children, footer }: AuthPageLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-10">
          <Logo />
        </div>

        <div
          className="relative rounded-2xl p-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <h1
            className="text-xl font-semibold mb-6 text-center"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h1>
          {children}
          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}