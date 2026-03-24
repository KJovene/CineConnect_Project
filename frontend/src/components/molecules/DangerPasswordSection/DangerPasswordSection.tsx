import { useState, type FormEvent } from "react";

export interface DangerPasswordSectionSubmitPayload {
  currentPassword: string;
  newPassword: string;
}

export interface DangerPasswordSectionProps {
  onChangePassword: (
    payload: DangerPasswordSectionSubmitPayload,
  ) => Promise<void>;
}

export function DangerPasswordSection({
  onChangePassword,
}: DangerPasswordSectionProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const handleToggleForm = () => {
    const nextVisible = !isFormVisible;
    setIsFormVisible(nextVisible);

    if (!nextVisible) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      resetFeedback();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetFeedback();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Le nouveau mot de passe doit être différent de l'actuel.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onChangePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccess("Mot de passe mis à jour.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Mise à jour du mot de passe impossible";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-10">
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "rgba(220, 38, 38, 0.08)",
          border: "1px solid rgba(248, 113, 113, 0.35)",
        }}
      >
        <h2 className="text-lg font-semibold text-rose-400">Danger</h2>
        <p className="text-sm mt-1 text-rose-300/90">
          Modification du mot de passe du compte.
        </p>

        <button
          type="button"
          onClick={handleToggleForm}
          className="mt-4 px-4 py-2 text-sm rounded-xl transition-colors cursor-pointer"
          style={{
            background: "rgba(220, 38, 38, 0.18)",
            border: "1px solid rgba(248, 113, 113, 0.45)",
            color: "rgb(252, 165, 165)",
          }}
        >
          {isFormVisible ? "Annuler" : "Changer son mot de passe"}
        </button>

        {isFormVisible && (
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm mb-1 text-rose-200"
                htmlFor="current-password"
              >
                Mot de passe actuel
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  resetFeedback();
                }}
                autoComplete="current-password"
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-400/30"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid rgba(248, 113, 113, 0.35)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm mb-1 text-rose-200"
                htmlFor="new-password"
              >
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  resetFeedback();
                }}
                autoComplete="new-password"
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-400/30"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid rgba(248, 113, 113, 0.35)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm mb-1 text-rose-200"
                htmlFor="confirm-new-password"
              >
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  resetFeedback();
                }}
                autoComplete="new-password"
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-400/30"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid rgba(248, 113, 113, 0.35)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: "rgba(220, 38, 38, 0.18)",
                border: "1px solid rgba(248, 113, 113, 0.45)",
                color: "rgb(252, 165, 165)",
              }}
            >
              {isSubmitting ? "Mise à jour..." : "Modifier le mot de passe"}
            </button>

            {error && <p className="text-xs text-rose-300">{error}</p>}
            {success && <p className="text-xs text-emerald-300">{success}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
