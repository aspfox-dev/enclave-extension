import { VAULT_UI } from '@/shared/constants/strings';
import { type CustomVaultField } from '@/shared/types/vault';

interface CustomFieldRowProps {
  field: CustomVaultField;
  onChange: (patch: Partial<CustomVaultField>) => void;
  onRemove: () => void;
}

const FIELD_CLASS =
  'rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none';

export function CustomFieldRow({ field, onChange, onRemove }: CustomFieldRowProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={field.label}
        placeholder={VAULT_UI.customLabelPlaceholder}
        onChange={(event) => onChange({ label: event.target.value })}
        className={`${FIELD_CLASS} w-32`}
      />
      <input
        type="text"
        value={field.value}
        placeholder={VAULT_UI.customValuePlaceholder}
        onChange={(event) => onChange({ value: event.target.value })}
        className={`${FIELD_CLASS} flex-1`}
      />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md border border-surface-border px-2 py-1 text-[11px] text-slate-400 hover:border-red-500/60 hover:text-red-300"
      >
        {VAULT_UI.remove}
      </button>
    </div>
  );
}
