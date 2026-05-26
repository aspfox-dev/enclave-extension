import { type KeyboardEvent, useState } from 'react';

import { CHAT_UI } from '@/shared/constants/strings';

interface ChatInputProps {
  disabled: boolean;
  onSend: (content: string) => void;
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [draft, setDraft] = useState('');

  function submit() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        rows={2}
        value={draft}
        disabled={disabled}
        placeholder={CHAT_UI.placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-none rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none disabled:opacity-50"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{CHAT_UI.sendHint}</span>
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {CHAT_UI.send}
        </button>
      </div>
    </div>
  );
}
