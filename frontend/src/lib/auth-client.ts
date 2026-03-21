import { createAuthClient } from "better-auth/react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

interface UpdateCurrentUserInput {
  name?: string;
  image?: string | null;
}

/**
 * Met a jour le profil de l'utilisateur connecte via Better Auth.
 */
export async function updateCurrentUser(payload: UpdateCurrentUserInput) {
  const response = await fetch(`${API_URL}/api/auth/update-user`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = body as { message?: string; error?: string };
    throw new Error(
      err.message ?? err.error ?? "Echec de mise a jour du profil",
    );
  }

  return body;
}
