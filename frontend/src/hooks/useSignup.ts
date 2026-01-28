import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

/**
 * Hook encapsulant la logique d'inscription (état + signUp).
 * À utiliser dans la page Signup (conteneur).
 */
export function useSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signUp.email({
      name: name || undefined,
      email,
      password,
      callbackURL: "/",
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Échec de l'inscription");
      return;
    }
    navigate({ to: "/" });
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  };
}
