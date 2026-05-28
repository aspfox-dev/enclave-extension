import { VAULT_UI } from '@/shared/constants/strings';
import { type CustomVaultField } from '@/shared/types/vault';

interface CustomFieldRowProps {
  field: CustomVaultField;
  onChange: (patch: Partial<CustomVaultField>) => void;
  onRemove: () => void;
}

const FIELD =
  'rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none';

export function CustomFieldRow({ field, onChange, onRemove }: CustomFieldRowProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={field.label}
        placeholder={VAULT_UI.customLabelPlaceholder}
        onChange={(event) => onChange({ label: event.target.value })}
        className={`${FIELD} w-32`}
      />
      <input
        type="text"
        value={field.value}
        placeholder={VAULT_UI.customValuePlaceholder}
        onChange={(event) => onChange({ value: event.target.value })}
        className={`${FIELD} flex-1`}
      />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md border border-surface-border px-2 py-2 text-[11px] text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error"
      >
        {VAULT_UI.remove}
      </button>
    </div>
  );
}
