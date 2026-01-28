import { Link } from "@tanstack/react-router";

interface AuthFooterProps {
  /** Ex. "Pas encore de compte ?" */
  prompt: string;
  /** Ex. "/signup" */
  to: string;
  /** Ex. "S'inscrire" */
  label: string;
}

/**
 * Lien vers l'autre page auth (login ↔ signup). Présentation seule.
 */
export function AuthFooter({ prompt, to, label }: AuthFooterProps) {
  return (
    <p className="text-center text-sm text-neutral-500">
      {prompt}{" "}
      <Link to={to} className="text-indigo-400 hover:text-indigo-300 font-medium">
        {label}
      </Link>
    </p>
  );
}
