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
        className="w-full resize-none rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none disabled:opacity-50"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{AGENT_UI.runHint}</span>
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {AGENT_UI.run}
        </button>
      </div>
    </div>
  );
}
