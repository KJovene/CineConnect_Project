import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { registerRequestSchema } from "@cineconnect/shared";
import { authClient } from "@/lib/auth-client";

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

    const normalizedName = name.trim();
    const validation = registerRequestSchema.safeParse({
      email,
      username: normalizedName,
      password,
    });
    if (!validation.success) {
      const field = validation.error.issues[0]?.path[0];
      if (field === "email") setError("Adresse email invalide.");
      else if (field === "username")
        setError("Le pseudo doit contenir au moins 2 caractères.");
      else if (field === "password")
        setError("Le mot de passe doit contenir au moins 8 caractères.");
      else setError("Données invalides.");
      return;
    }

    setLoading(true);
    const { error: err } = await authClient.signUp.email({
      name: normalizedName,
      email,
      password,
      callbackURL: "/",
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
    setLoading(false);
    if (err) {
      setError("Echec de l'inscription");
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
