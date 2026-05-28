import { type KeyboardEvent, useState } from 'react';

import { AGENT_UI } from '@/shared/constants/strings';

interface GoalInputProps {
  disabled: boolean;
  onRun: (goal: string) => void;
}

export function GoalInput({ disabled, onRun }: GoalInputProps) {
  const [goal, setGoal] = useState('');

  function submit() {
    const trimmed = goal.trim();
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
        rows={3}
        value={goal}
        disabled={disabled}
        placeholder={AGENT_UI.goalPlaceholder}
        onChange={(event) => setGoal(event.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-none rounded-md border border-surface-border bg-surface-elevated px-3 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none disabled:opacity-40"
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500">{AGENT_UI.runHint}</span>
        <button
          type="button"
          onClick={submit}
          disabled={disabled || goal.trim().length === 0}
          className="rounded-md bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40"
        >
          {AGENT_UI.run}
        </button>
      </div>
    </div>
  );
}
