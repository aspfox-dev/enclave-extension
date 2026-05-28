import { useChatSession } from '../../hooks/useChatSession';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { ChatModeToggle } from './ChatModeToggle';

export function ChatPanel() {
  const { turns, submode, isSending, error, setSubmode, send, clear } = useChatSession();

  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      {/* Mode toggle zone */}
      <div className="shrink-0 px-4 pb-2 pt-4">
        <ChatModeToggle
          submode={submode}
          hasTurns={turns.length > 0}
          onChange={setSubmode}
          onClear={clear}
        />
      </div>

      {/* Message list */}
      <div className="flex flex-1 flex-col overflow-hidden border-t border-surface-border">
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
          <ChatMessageList turns={turns} isSending={isSending} error={error} />
        </div>

        {/* Input zone */}
        <div className="shrink-0 border-t border-surface-border px-4 pb-4 pt-3">
          <ChatInput disabled={isSending} onSend={(content) => void send(content)} />
        </div>
      </div>
    </section>
  );
}
