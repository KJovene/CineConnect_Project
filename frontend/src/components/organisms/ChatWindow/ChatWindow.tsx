import React, { useEffect, useRef, useState } from 'react';
import { HiPaperAirplane, HiArrowLeft } from 'react-icons/hi2';
import { Avatar } from '@/components/atoms';
import type { FriendUser } from '@/features/friends/hooks';
import type { Message } from '@/features/messages/hooks';

export interface ChatWindowProps {
  friend: FriendUser;
  messages: Message[];
  currentUserId: number;
  isLoading?: boolean;
  onSend: (content: string) => void;
  onBack?: () => void;
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

function DateSeparator({ date }: { date: string | null }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
      <span
        className="text-[10px] font-medium tracking-widest uppercase"
        style={{ color: "var(--color-text-muted)" }}
      >
        {formatDate(date)}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
    </div>
  );
}

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
      <div className="w-8 shrink-0 self-end mb-1">
        {isLast
          ? <Avatar image={friend.image} name={friend.name} />
          : <div className="w-8 h-8" />
        }
      </div>

      <div className="flex flex-col items-start gap-1 max-w-[65%]">
        {isFirst && (
          <span
            className="text-[11px] ml-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {friend.name ?? 'Utilisateur'}
          </span>
        )}

        {/* Bulle ami — surface adaptative */}
        <div
          className="px-4 py-2.5 text-sm leading-relaxed break-words rounded-2xl rounded-tl-md"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          {msg.content}
        </div>

        {isLast && (
          <span
            className="text-[10px] ml-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {formatTime(msg.sent_at)}
          </span>
        )}
      </div>
    </div>
  );
}

function MyBubble({ msg, isLast }: { msg: Message; isLast: boolean }) {
  return (
    <div className="flex w-full justify-end">
      <div className="flex flex-col items-end gap-1 max-w-[65%]">
        <div className="bg-indigo-600 text-white px-4 py-2.5 text-sm leading-relaxed break-words rounded-2xl rounded-tr-md shadow-lg shadow-indigo-950/50">
          {msg.content}
        </div>

        {isLast && (
          <span
            className="text-[10px] mr-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {formatTime(msg.sent_at)}
          </span>
        )}
      </div>
    </div>
  );
}

export function ChatWindow({
  friend,
  messages,
  currentUserId,
  isLoading,
  onSend,
  onBack,
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
    <div className="flex flex-col h-full" style={{ background: "var(--color-bg)" }}>

      {/* Header */}
      <div
        className="h-16 flex items-center gap-3 px-6 shrink-0"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Avatar image={friend.image} name={friend.name} />
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-text)" }}
          >
            {friend.name ?? 'Utilisateur'}
          </p>
        </div>

        <button
          onClick={onBack}
          className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "var(--color-text-muted)" }}
        >
          <HiArrowLeft size={20} />
        </button>
      </div>

      

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="flex gap-2 items-end">
              <div
                className="w-8 h-8 rounded-full shrink-0"
                style={{ background: "var(--color-surface)" }}
              />
              <div
                className="h-10 w-48 rounded-2xl rounded-tl-md"
                style={{ background: "var(--color-surface)" }}
              />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-36 rounded-2xl rounded-tr-md bg-indigo-900/40" />
            </div>
            <div className="flex gap-2 items-end">
              <div
                className="w-8 h-8 rounded-full shrink-0"
                style={{ background: "var(--color-surface)" }}
              />
              <div
                className="h-10 w-56 rounded-2xl rounded-tl-md"
                style={{ background: "var(--color-surface)" }}
              />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ background: "var(--color-surface)" }}
            >
              <HiPaperAirplane
                size={22}
                className="opacity-30 rotate-[-45deg]"
                style={{ color: "var(--color-text-muted)" }}
              />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
              Commencez la conversation
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
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

      {/* Input */}
      <div
        className="shrink-0 px-4 py-4"
        style={{
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message à ${friend.name ?? 'votre ami'}…`}
            className="flex-1 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
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