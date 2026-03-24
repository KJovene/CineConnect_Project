import { useState } from "react";

export interface DangerDeleteAccountSectionProps {
  onDeleteAccount: () => Promise<void>;
}

export function DangerDeleteAccountSection({
  onDeleteAccount,
}: DangerDeleteAccountSectionProps) {
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteStart = () => {
    setDeleteError(null);
    setDeleteSuccess(null);
    setIsDeleteConfirmVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteError(null);
    setDeleteSuccess(null);
    setIsDeleteConfirmVisible(false);
  };

  const handleDeleteConfirm = async () => {
    setDeleteError(null);
    setDeleteSuccess(null);
    setIsDeleting(true);
    try {
      await onDeleteAccount();
      setDeleteSuccess("Compte supprimé.");
      setIsDeleteConfirmVisible(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Suppression du compte impossible";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="pt-4"
      style={{ borderTop: "1px solid var(--danger-border)" }}
    >
      <h3
        className="text-base font-semibold"
        style={{ color: "var(--danger-title)" }}
      >
        Suppression du compte
      </h3>

      {!isDeleteConfirmVisible ? (
        <button
          type="button"
          onClick={handleDeleteStart}
          className="mt-3 px-4 py-2 text-sm rounded-xl transition-colors cursor-pointer"
          style={{
            background: "var(--danger-button-bg)",
            border: "1px solid var(--danger-button-border)",
            color: "var(--danger-button-text)",
          }}
        >
          Supprimer votre compte
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm" style={{ color: "var(--danger-text-muted)" }}>
            Êtes-vous sûr de vouloir supprimer votre profil, cette action est
            irréversible ?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: "var(--danger-button-bg)",
                border: "1px solid var(--danger-button-border)",
                color: "var(--danger-button-text)",
              }}
            >
              {isDeleting ? "Suppression..." : "Oui, supprimer mon compte"}
            </button>
            <button
              type="button"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="px-4 py-2 text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: "transparent",
                border: "1px solid var(--danger-button-border)",
                color: "var(--danger-button-text)",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {deleteError && (
        <p className="text-xs mt-2" style={{ color: "var(--danger-error)" }}>
          {deleteError}
        </p>
      )}
      {deleteSuccess && (
        <p className="text-xs mt-2" style={{ color: "var(--danger-success)" }}>
          {deleteSuccess}
        </p>
      )}
    </div>
  );
}
