import { useNavigate } from "@tanstack/react-router";
import { HiArrowLeftStartOnRectangle } from "react-icons/hi2";

interface AuthNavButtonProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  onLogout: () => void;
}

export function AuthNavButton({
  isAuthenticated,
  isLoading,
  onLogout,
}: AuthNavButtonProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <button
        disabled
        className="text-sm font-medium text-neutral-400 opacity-50 cursor-not-allowed"
      >
        Chargement...
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={onLogout}
        className="flex items-center cursor-pointer gap-2 text-sm font-medium text-neutral-400 hover:text-rose-400 transition-colors"
        title="Se déconnecter"
      >
        <HiArrowLeftStartOnRectangle size={18} />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate({ to: "/login" })}
      className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
    >
      Connexion
    </button>
  );
}
