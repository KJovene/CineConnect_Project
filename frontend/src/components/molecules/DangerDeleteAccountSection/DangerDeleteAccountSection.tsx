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
      style={{ borderTop: "1px solid rgba(248, 113, 113, 0.25)" }}
    >
      <h3 className="text-base font-semibold text-rose-300">
        Suppression du compte
      </h3>

      {!isDeleteConfirmVisible ? (
        <button
          type="button"
          onClick={handleDeleteStart}
          className="mt-3 px-4 py-2 text-sm rounded-xl transition-colors cursor-pointer"
          style={{
            background: "rgba(190, 24, 93, 0.15)",
            border: "1px solid rgba(251, 113, 133, 0.5)",
            color: "rgb(253, 164, 175)",
          }}
        >
          Supprimer votre compte
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-rose-200">
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
                background: "rgba(220, 38, 38, 0.25)",
                border: "1px solid rgba(248, 113, 113, 0.6)",
                color: "rgb(254, 202, 202)",
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
                border: "1px solid rgba(248, 113, 113, 0.45)",
                color: "rgb(254, 205, 211)",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {deleteError && (
        <p className="text-xs text-rose-300 mt-2">{deleteError}</p>
      )}
      {deleteSuccess && (
        <p className="text-xs text-emerald-300 mt-2">{deleteSuccess}</p>
      )}
    </div>
  );
}
