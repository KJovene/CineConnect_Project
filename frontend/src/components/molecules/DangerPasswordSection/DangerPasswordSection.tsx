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
    <div>
      <h3 className="text-base font-semibold" style={{ color: "var(--danger-title)" }}>
        Modification du mot de passe
      </h3>
      <p className="text-sm mt-1" style={{ color: "var(--danger-text)" }}>
        Mettez à jour votre mot de passe en confirmant les nouveaux
        identifiants.
      </p>

      <button
        type="button"
        onClick={handleToggleForm}
        className="mt-4 px-4 py-2 text-sm rounded-xl transition-colors cursor-pointer"
        style={{
          background: "var(--danger-button-bg)",
          border: "1px solid var(--danger-button-border)",
          color: "var(--danger-button-text)",
        }}
      >
        {isFormVisible ? "Annuler" : "Changer votre mot de passe"}
      </button>

      {isFormVisible && (
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--danger-text-muted)" }}
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
                border: "1px solid var(--danger-input-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--danger-text-muted)" }}
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
                border: "1px solid var(--danger-input-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: "var(--danger-text-muted)" }}
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
                border: "1px solid var(--danger-input-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: "var(--danger-button-bg)",
              border: "1px solid var(--danger-button-border)",
              color: "var(--danger-button-text)",
            }}
          >
            {isSubmitting ? "Mise à jour..." : "Modifier le mot de passe"}
          </button>

          {error && (
            <p className="text-xs" style={{ color: "var(--danger-error)" }}>
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs" style={{ color: "var(--danger-success)" }}>
              {success}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
