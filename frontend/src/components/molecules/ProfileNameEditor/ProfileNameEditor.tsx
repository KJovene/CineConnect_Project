import { useState, type FormEvent } from "react";
import { z } from "zod";
import { HiPencilSquare } from "react-icons/hi2";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Le pseudo doit contenir au moins 2 caractères.")
  .max(50, "Le pseudo ne peut pas dépasser 50 caractères.");

interface ProfileNameEditorProps {
  currentName: string;
  isSaving?: boolean;
  onSave: (nextName: string) => Promise<void>;
  onResetFeedback?: () => void;
}

export function ProfileNameEditor({
  currentName,
  isSaving = false,
  onSave,
  onResetFeedback,
}: ProfileNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(currentName);
  const [localError, setLocalError] = useState<string | null>(null);

  const openEditor = () => {
    setIsEditing(true);
    setDraftName(currentName);
    setLocalError(null);
    onResetFeedback?.();
  };

  const closeEditor = () => {
    setIsEditing(false);
    setLocalError(null);
    setDraftName(currentName);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLocalError(null);
    onResetFeedback?.();

    const result = nameSchema.safeParse(draftName);
    if (!result.success) {
      setLocalError(result.error.issues[0]?.message ?? "Pseudo invalide.");
      return;
    }

    const trimmedName = result.data;
    if (trimmedName === currentName) {
      closeEditor();
      return;
    }

    try {
      await onSave(trimmedName);
      setIsEditing(false);
    } catch {
      // L'erreur API est gérée par le parent et affichée dans la page Profil.
    }
  };

  return (
    <div className="min-w-0 pb-2">
      <div className="flex items-center gap-2 min-w-0">
        <h1
          className="text-xl font-bold truncate"
          style={{ color: "var(--color-text)" }}
        >
          {currentName}
        </h1>
        <button
          type="button"
          onClick={openEditor}
          className="shrink-0 p-1.5 rounded-lg hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-colors cursor-pointer"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
          }}
          aria-label="Modifier le pseudo"
          title="Modifier le pseudo"
        >
          <HiPencilSquare size={15} />
        </button>
      </div>

      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Votre pseudo"
            className="w-full sm:max-w-xs rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaving || draftName.trim().length === 0}
              className="px-4 py-2 text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-500/10 hover:border-indigo-500/40 cursor-pointer"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              {isSaving ? "Mise à jour..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={closeEditor}
              disabled={isSaving}
              className="px-4 py-2 text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-white/5 cursor-pointer"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {localError && <p className="text-xs text-rose-400 mt-2">{localError}</p>}
    </div>
  );
}
