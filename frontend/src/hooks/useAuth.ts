import { useSession, signOut } from "@/lib/auth-client";

/**
 * Hook personnalisé pour gérer l'authentification
 * Encapsule la logique de session et de déconnexion
 * @returns {Object} État de session et fonction de logout
 */
export function useAuth() {
  const { data: session, isPending } = useSession();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.assign("/login");
        },
      },
    });
  };

  return {
    session,
    isLoading: isPending,
    isAuthenticated: !!session,
    handleLogout,
  };
}
