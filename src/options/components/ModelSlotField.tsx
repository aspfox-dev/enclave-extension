import {
  MODEL_SLOT_HINTS,
  MODEL_SLOT_LABELS,
  type ModelSlot,
} from '@/shared/constants/settings';

interface ModelSlotFieldProps {
  slot: ModelSlot;
  value: string;
  onChange: (value: string) => void;
}

export function ModelSlotField({ slot, value, onChange }: ModelSlotFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-300">{MODEL_SLOT_LABELS[slot]}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none"
      />
      <span className="text-[11px] text-slate-500">{MODEL_SLOT_HINTS[slot]}</span>
    </label>
  );
}
