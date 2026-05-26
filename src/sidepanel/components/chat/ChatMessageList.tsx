import { useEffect, useRef } from 'react';

import { CHAT_UI } from '@/shared/constants/strings';
import { type ChatTurn } from '@/shared/types/chat';

interface ChatMessageListProps {
  turns: ChatTurn[];
  isSending: boolean;
  error: string | null;
}

const ROLE_CLASS: Record<ChatTurn['role'], string> = {
  user: 'self-end bg-accent-muted text-white',
  assistant: 'self-start bg-surface-raised text-slate-100 border border-surface-border',
};

export function ChatMessageList({ turns, isSending, error }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns.length, isSending, error]);

  if (turns.length === 0 && !error && !isSending) {
    return <p className="mt-2 text-sm text-slate-500">{CHAT_UI.emptyState}</p>;
  }

  return (
    <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto">
      {turns.map((turn) => (
        <div
          key={turn.id}
          className={`max-w-[85%] whitespace-pre-wrap rounded-md px-3 py-2 text-sm leading-relaxed ${ROLE_CLASS[turn.role]}`}
        >
          {turn.content}
        </div>
      ))}
      {isSending && <p className="px-1 text-xs text-slate-500">{CHAT_UI.thinking}</p>}
      {error && (
        <div className="self-start rounded-md border border-red-500/40 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
