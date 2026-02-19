import type { ReactNode } from "react";
import { Logo } from "@/components/atoms";

export interface AuthPageLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPageLayout({ title, children, footer }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-10">
          <Logo />
        </div>

        <div
          className="rounded-2xl p-8 border border-white/10 bg-[#0A0A0A]"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          <h1 className="text-xl font-semibold text-white mb-6 text-center">
            {title}
          </h1>
          {children}
          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
