import { SETTINGS_UI, VAULT_UI } from '@/shared/constants/strings';
import { type CustomVaultField, MAX_CUSTOM_VAULT_FIELDS, type Vault } from '@/shared/types/vault';

import { type SaveState } from '../../hooks/useSettings';
import { CustomFieldRow } from './CustomFieldRow';

interface VaultFormProps {
  vault: Vault;
  saveState: SaveState;
  onChange: (vault: Vault) => void;
  onSave: () => void;
}

type FixedField = keyof Omit<Vault, 'customFields'>;

const FIXED_FIELDS: { key: FixedField; label: string }[] = [
  { key: 'name', label: VAULT_UI.nameLabel },
  { key: 'email', label: VAULT_UI.emailLabel },
  { key: 'phone', label: VAULT_UI.phoneLabel },
  { key: 'address', label: VAULT_UI.addressLabel },
  { key: 'dateOfBirth', label: VAULT_UI.dobLabel },
];

const FIELD_CLASS =
  'rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none';

const SAVE_MESSAGE: Record<SaveState, string> = {
  idle: '',
  saving: SETTINGS_UI.saving,
  saved: SETTINGS_UI.saved,
  error: SETTINGS_UI.saveError,
};

export function VaultForm({ vault, saveState, onChange, onSave }: VaultFormProps) {
  const setField = (key: FixedField, value: string) => onChange({ ...vault, [key]: value });

  const patchCustom = (id: string, patch: Partial<CustomVaultField>) =>
    onChange({
      ...vault,
      customFields: vault.customFields.map((field) =>
        field.id === id ? { ...field, ...patch } : field,
      ),
    });

  const removeCustom = (id: string) =>
    onChange({ ...vault, customFields: vault.customFields.filter((field) => field.id !== id) });

  const addCustom = () =>
    onChange({
      ...vault,
      customFields: [...vault.customFields, { id: crypto.randomUUID(), label: '', value: '' }],
    });

  const atCustomLimit = vault.customFields.length >= MAX_CUSTOM_VAULT_FIELDS;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-surface-border bg-surface-raised p-4">
      <header>
        <h2 className="text-sm font-medium text-slate-300">{VAULT_UI.heading}</h2>
        <p className="mt-1 text-[11px] text-slate-500">{VAULT_UI.description}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {FIXED_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">{label}</span>
            <input
              type="text"
              value={vault[key]}
              onChange={(event) => setField(key, event.target.value)}
              className={FIELD_CLASS}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-400">{VAULT_UI.customHeading}</span>
        {vault.customFields.map((field) => (
          <CustomFieldRow
            key={field.id}
            field={field}
            onChange={(patch) => patchCustom(field.id, patch)}
            onRemove={() => removeCustom(field.id)}
          />
        ))}
        <button
          type="button"
          onClick={addCustom}
          disabled={atCustomLimit}
          className="self-start rounded-md border border-surface-border px-2.5 py-1 text-xs text-slate-300 hover:border-accent hover:text-white disabled:opacity-40"
        >
          {VAULT_UI.addCustom}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {VAULT_UI.save}
        </button>
        <span className="text-xs text-slate-400">{SAVE_MESSAGE[saveState]}</span>
      </div>
    </section>
  );
}
