import { useState } from 'react';

import { WORKFLOW_UI } from '@/shared/constants/strings';

interface RecordingControlsProps {
  isRecording: boolean;
  stepCount: number;
  onStart: () => void;
  onSave: (name: string, description: string) => void;
  onDiscard: () => void;
}

const FIELD_CLASS =
  'w-full rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none';

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
        className="self-start rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
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
    <div className="flex flex-col gap-2 rounded-md border border-accent/40 bg-accent-muted/15 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-accent">
          {WORKFLOW_UI.recordingLabel}
        </span>
        <span className="text-xs text-slate-300">{stepLabel}</span>
      </div>

      <input
        type="text"
        value={name}
        placeholder={WORKFLOW_UI.workflowNameLabel}
        onChange={(event) => setName(event.target.value)}
        className={FIELD_CLASS}
      />
      <input
        type="text"
        value={description}
        placeholder={WORKFLOW_UI.workflowDescLabel}
        onChange={(event) => setDescription(event.target.value)}
        className={FIELD_CLASS}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          {WORKFLOW_UI.stopRecording}
        </button>
        <button
          type="button"
          onClick={discard}
          className="rounded-md border border-surface-border px-3 py-1.5 text-xs text-slate-300 hover:border-red-500/60 hover:text-red-300"
        >
          {WORKFLOW_UI.discardRecording}
        </button>
      </div>
    </div>
  );
}
