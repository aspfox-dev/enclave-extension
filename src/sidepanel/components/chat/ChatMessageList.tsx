import { useEffect, useRef } from 'react';

import { CHAT_UI } from '@/shared/constants/strings';
import { type ChatTurn } from '@/shared/types/chat';

interface ChatMessageListProps {
  turns: ChatTurn[];
  isSending: boolean;
  error: string | null;
}

export function ChatMessageList({ turns, isSending, error }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns.length, isSending, error]);

  return (
    <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto">
      {turns.length === 0 && !error && !isSending && (
        <p className="text-[12px] text-slate-500">{CHAT_UI.emptyState}</p>
      )}

      {turns.map((turn) =>
        turn.role === 'user' ? (
          <div
            key={turn.id}
            className="self-end max-w-[85%] rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-[13px] leading-relaxed text-slate-100"
          >
            {turn.content}
          </div>
        ) : (
          <p
            key={turn.id}
            className="text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap"
          >
            {turn.content}
          </p>
        ),
      )}

      {isSending && (
        <p className="text-[12px] text-slate-500">{CHAT_UI.thinking}</p>
      )}

      {error && (
        <div className="border-l-2 border-status-error/60 pl-3 py-2">
          <p className="text-[12px] text-status-error">{error}</p>
        </div>
      )}
    </div>
  );
}
