interface AuthErrorAlertProps {
  message: string;
}

/**
 * Bandeau d'erreur pour les formulaires auth. Présentation seule.
 */
export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  return (
    <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-300">
      {message}
    </div>
  );
}
