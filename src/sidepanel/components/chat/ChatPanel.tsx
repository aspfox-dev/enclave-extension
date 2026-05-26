import { useChatSession } from '../../hooks/useChatSession';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { ChatModeToggle } from './ChatModeToggle';

export function ChatPanel() {
  const { turns, submode, isSending, error, setSubmode, send, clear } = useChatSession();

  return (
    <section className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-4">
      <ChatModeToggle
        submode={submode}
        hasTurns={turns.length > 0}
        onChange={setSubmode}
        onClear={clear}
      />
      <ChatMessageList turns={turns} isSending={isSending} error={error} />
      <ChatInput disabled={isSending} onSend={(content) => void send(content)} />
    </section>
  );
}
