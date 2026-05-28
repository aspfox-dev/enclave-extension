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
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-slate-400">{MODEL_SLOT_LABELS[slot]}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
      />
      <span className="text-[11px] text-slate-500">{MODEL_SLOT_HINTS[slot]}</span>
    </label>
  );
}
