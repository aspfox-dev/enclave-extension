import { type KeyboardEvent, useState } from 'react';

import { RESEARCH_UI } from '@/shared/constants/strings';

interface ResearchInputProps {
  disabled: boolean;
  isBusy: boolean;
  onRun: (topic: string) => void;
  onStop: () => void;
}

export function ResearchInput({ disabled, isBusy, onRun, onStop }: ResearchInputProps) {
  const [topic, setTopic] = useState('');

  function submit() {
    const trimmed = topic.trim();
    if (trimmed) onRun(trimmed);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        rows={2}
        value={topic}
        disabled={disabled}
        placeholder={RESEARCH_UI.topicPlaceholder}
        onChange={(event) => setTopic(event.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-none rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none disabled:opacity-50"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{RESEARCH_UI.runHint}</span>
        {isBusy ? (
          <button
            type="button"
            onClick={onStop}
            className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:border-red-400 hover:text-red-200"
          >
            {RESEARCH_UI.stop}
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={disabled}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {RESEARCH_UI.run}
          </button>
        )}
      </div>
    </div>
  );
}
