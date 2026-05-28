import { useState } from 'react';

import { WORKFLOW_UI } from '@/shared/constants/strings';

interface RecordingControlsProps {
  isRecording: boolean;
  stepCount: number;
  onStart: () => void;
  onSave: (name: string, description: string) => void;
  onDiscard: () => void;
}

const FIELD =
  'w-full rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none';

const DISCARD =
  'rounded-md border border-surface-border px-3 py-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error';

export function RecordingControls({
  isRecording,
  stepCount,
  onStart,
  onSave,
  onDiscard,
}: RecordingControlsProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isRecording) {
    return (
      <button
        type="button"
        onClick={onStart}
        className="self-start rounded-md bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
      >
        {WORKFLOW_UI.startRecording}
      </button>
    );
  }

  function save() {
    onSave(name || WORKFLOW_UI.defaultName, description);
    setName('');
    setDescription('');
  }

  function discard() {
    onDiscard();
    setName('');
    setDescription('');
  }

  const stepLabel = `${stepCount} ${stepCount === 1 ? WORKFLOW_UI.step : WORKFLOW_UI.stepsLabel}`;

  return (
    <div className="border-l-2 border-accent/50 pl-3 py-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
          {WORKFLOW_UI.recordingLabel}
        </span>
        <span className="text-[11px] text-slate-400">{stepLabel}</span>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          placeholder={WORKFLOW_UI.workflowNameLabel}
          onChange={(event) => setName(event.target.value)}
          className={FIELD}
        />
        <input
          type="text"
          value={description}
          placeholder={WORKFLOW_UI.workflowDescLabel}
          onChange={(event) => setDescription(event.target.value)}
          className={FIELD}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
          >
            {WORKFLOW_UI.stopRecording}
          </button>
          <button type="button" onClick={discard} className={DISCARD}>
            {WORKFLOW_UI.discardRecording}
          </button>
        </div>
      </div>
    </div>
  );
}
