import { type KeyboardEvent, useState } from 'react';

import { RESEARCH_UI } from '@/shared/constants/strings';

interface ResearchInputProps {
  disabled: boolean;
  isBusy: boolean;
  onRun: (topic: string) => void;
  onStop: () => void;
}

const STOP =
  'rounded-md border border-surface-border px-3 py-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error';

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
        className="w-full resize-none rounded-md border border-surface-border bg-surface-elevated px-3 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none disabled:opacity-40"
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500">{RESEARCH_UI.runHint}</span>
        {isBusy ? (
          <button type="button" onClick={onStop} className={STOP}>
            {RESEARCH_UI.stop}
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={disabled || topic.trim().length === 0}
            className="rounded-md bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40"
          >
            {RESEARCH_UI.run}
          </button>
        )}
      </div>
    </div>
  );
}
