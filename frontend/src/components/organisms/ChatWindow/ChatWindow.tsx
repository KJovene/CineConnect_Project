import React, { useEffect, useRef, useState } from 'react';
import { HiPaperAirplane } from 'react-icons/hi2';
import { Avatar } from '@/components/atoms';
import type { FriendUser } from '@/features/friends/hooks';
import type { Message } from '@/features/messages/hooks';

export interface ChatWindowProps {
  friend: FriendUser;
  messages: Message[];
  currentUserId: number;
  isLoading?: boolean;
  onSend: (content: string) => void;
}

function formatTime(sentAt: string | null): string {
  if (!sentAt) return '';
  return new Date(sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(sentAt: string | null): string {
  if (!sentAt) return '';
  const date = new Date(sentAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return 'Hier';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

function isSameDay(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// ─── Date separator ───────────────────────────────────────────────────────────

function DateSeparator({ date }: { date: string | null }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-white/5" />
      <span className="text-[10px] font-medium text-neutral-600 tracking-widest uppercase">
        {formatDate(date)}
      </span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

// ─── Bubble : messages de l'ami (gauche, gris foncé) ─────────────────────────

function FriendBubble({
  msg,
  isFirst,
  isLast,
  friend,
}: {
  msg: Message;
  isFirst: boolean;
  isLast: boolean;
  friend: FriendUser;
}) {
  return (
    <div className="flex items-end gap-2 w-full justify-start">
      {/* Avatar ancré en bas du groupe */}
      <div className="w-8 shrink-0 self-end mb-1">
        {isLast ? <Avatar image={friend.image} name={friend.name} /> : <div className="w-8 h-8" />}
      </div>

      <div className="flex flex-col items-start gap-1 max-w-[65%]">
        {/* Nom au-dessus du premier message */}
        {isFirst && (
          <span className="text-[11px] text-neutral-500 ml-1">
            {friend.name ?? 'Utilisateur'}
          </span>
        )}

        {/* Bulle gris foncé, coins arrondis à gauche aplatis */}
        <div className="bg-neutral-800 text-neutral-100 border border-neutral-700 px-4 py-2.5 text-sm leading-relaxed break-words rounded-2xl rounded-tl-md">
          {msg.content}
        </div>

        {isLast && (
          <span className="text-[10px] text-neutral-600 ml-1">{formatTime(msg.sent_at)}</span>
        )}
      </div>
    </div>
  );
}

// ─── Bubble : mes messages (droite, indigo) ───────────────────────────────────

function MyBubble({
  msg,
  isLast,
}: {
  msg: Message;
  isLast: boolean;
}) {
  return (
    <div className="flex w-full justify-end">
      <div className="flex flex-col items-end gap-1 max-w-[65%]">
        {/* Bulle indigo, coins arrondis à droite aplatis */}
        <div className="bg-indigo-600 text-white px-4 py-2.5 text-sm leading-relaxed break-words rounded-2xl rounded-tr-md shadow-lg shadow-indigo-950/50">
          {msg.content}
        </div>

        {isLast && (
          <span className="text-[10px] text-neutral-600 mr-1">{formatTime(msg.sent_at)}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChatWindow({
  friend,
  messages,
  currentUserId,
  isLoading,
  onSend,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;
      onSend(trimmed);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5 shrink-0 bg-[#080808]">
        <Avatar image={friend.image} name={friend.name} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {friend.name ?? 'Utilisateur'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-neutral-500">En ligne</span>
          </div>
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="flex gap-2 items-end">
              <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0" />
              <div className="h-10 w-48 rounded-2xl rounded-tl-md bg-neutral-800" />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-36 rounded-2xl rounded-tr-md bg-indigo-900/40" />
            </div>
            <div className="flex gap-2 items-end">
              <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0" />
              <div className="h-10 w-56 rounded-2xl rounded-tl-md bg-neutral-800" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <HiPaperAirplane size={22} className="opacity-30 rotate-[-45deg]" />
            </div>
            <p className="text-sm font-medium text-neutral-500">Commencez la conversation</p>
            <p className="text-xs text-neutral-700 mt-1">
              Dites bonjour à {friend.name ?? 'votre ami'} !
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {messages.map((msg, index) => {
              const isMine = msg.sender_id === currentUserId;
              const prev = messages[index - 1];
              const next = messages[index + 1];
              const isFirst = !prev || prev.sender_id !== msg.sender_id;
              const isLast = !next || next.sender_id !== msg.sender_id;
              const showDate = !isSameDay(prev?.sent_at ?? null, msg.sent_at);

              return (
                <React.Fragment key={msg.message_id}>
                  {showDate && <DateSeparator date={msg.sent_at} />}
                  <div className={isFirst ? 'mt-3' : 'mt-0.5'}>
                    {isMine
                      ? <MyBubble msg={msg} isLast={isLast} />
                      : <FriendBubble msg={msg} isFirst={isFirst} isLast={isLast} friend={friend} />
                    }
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-4 border-t border-white/5 bg-[#080808]">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message à ${friend.name ?? 'votre ami'}…`}
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all active:scale-95 shrink-0"
          >
            <HiPaperAirplane size={16} className="rotate-[-45deg]" />
          </button>
        </form>
      </div>

    </div>
  );
}
