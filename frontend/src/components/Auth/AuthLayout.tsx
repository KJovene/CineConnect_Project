import type { ReactNode } from "react";
import { HiOutlinePlayCircle } from "react-icons/hi2";

const inputBase =
  "w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Layout commun pour les pages Login / Signup.
 * Logo CineConnect + carte contenant le formulaire.
 */
export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <HiOutlinePlayCircle size={22} />
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            CineConnect
          </span>
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

export { inputBase };
