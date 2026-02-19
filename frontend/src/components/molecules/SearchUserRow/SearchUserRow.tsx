import { HiUserPlus } from 'react-icons/hi2';
import type { UserSearchResult } from '@/features/friends/hooks';

const RELATION_LABEL: Record<string, string> = {
  accepted: 'Déjà ami',
  pending: 'Demande envoyée',
  rejected: 'Refusé',
};

export interface SearchUserRowProps {
  user: UserSearchResult;
  onAdd: (id: number) => void;
  isPending?: boolean;
}

export function SearchUserRow({ user, onAdd, isPending }: SearchUserRowProps) {
  const hasRelation = user.relationStatus !== null;

  return (
    <div className="flex items-center justify-between bg-[#0A0A0A] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-semibold text-sm shrink-0">
          {(user.name ?? user.email)[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate">{user.name ?? 'Utilisateur'}</div>
          <div className="text-[11px] text-neutral-500 truncate">{user.email}</div>
        </div>
      </div>

      {hasRelation ? (
        <span className="text-xs text-neutral-500 px-3 py-1.5 shrink-0">
          {RELATION_LABEL[user.relationStatus!]}
        </span>
      ) : (
        <button
          onClick={() => onAdd(user.id)}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          <HiUserPlus size={14} />
          Ajouter
        </button>
      )}
    </div>
  );
}
