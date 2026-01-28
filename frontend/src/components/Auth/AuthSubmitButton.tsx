import type { ReactNode } from "react";

interface AuthSubmitButtonProps {
  loading: boolean;
  children: ReactNode;
}

/**
 * Bouton submit des formulaires auth. Désactivé + suffixe "…" pendant le chargement.
 */
export function AuthSubmitButton({ loading, children }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? `${children}…` : children}
    </button>
  );
}
