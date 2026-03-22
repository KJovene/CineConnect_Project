import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

/**
 * Hook encapsulant la logique de connexion (état + signIn).
 * À utiliser dans la page Login (conteneur).
 */
export function useLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
        fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
      });

      if (err) {
        setError(err.message ?? "Échec de la connexion");
        return;
      }

      navigate({ to: "/" });
    } catch {
      setError(
        "Impossible de contacter le serveur. Vérifie que le backend tourne sur localhost:3000.",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  };
}
