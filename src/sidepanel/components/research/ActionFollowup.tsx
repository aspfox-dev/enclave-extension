import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { RESEARCH_UI } from '@/shared/constants/strings';

interface ActionFollowupProps {
  topic: string;
  onSubmit: (goal: string) => void;
}

const GHOST =
  'rounded-md border border-surface-border px-3 py-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:border-surface-borderStrong hover:text-slate-100';

export function ActionFollowup({ topic, onSubmit }: ActionFollowupProps) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  function submit() {
    const trimmed = goal.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setGoal('');
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submit();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-[12px] font-medium text-accent transition-colors hover:text-slate-100"
      >
        {RESEARCH_UI.actNowCta}
      </button>
    );
  }

  return (
    <div className="border-l-2 border-accent/50 pl-3 py-2">
      <p className="mb-2 text-[11px] text-slate-400">
        {RESEARCH_UI.actNowHint}{' '}
        <span className="text-slate-200">"{topic}"</span>
      </p>
      <textarea
        ref={textareaRef}
        rows={3}
        value={goal}
        placeholder={RESEARCH_UI.actInputPlaceholder}
        onChange={(event) => setGoal(event.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-none rounded-md border border-surface-border bg-surface-elevated px-3 py-2.5 text-[13px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setGoal('');
          }}
          className={GHOST}
        >
          {RESEARCH_UI.actCancel}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={goal.trim().length === 0}
          className="rounded-md bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40"
        >
          {RESEARCH_UI.actSend}
        </button>
      </div>
    </div>
  );
}
