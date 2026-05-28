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

const FIELD =
  'rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none';

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
    <section className="flex flex-col gap-5 border-t border-surface-border pt-6 mt-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {VAULT_UI.heading}
        </p>
        <p className="mt-1 text-[12px] text-slate-500">{VAULT_UI.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {FIXED_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className="text-[12px] text-slate-400">{label}</span>
            <input
              type="text"
              value={vault[key]}
              onChange={(event) => setField(key, event.target.value)}
              className={FIELD}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {VAULT_UI.customHeading}
        </p>
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
          className="self-start rounded-md border border-surface-border px-2.5 py-1.5 text-[12px] text-slate-400 transition-colors hover:border-surface-borderStrong hover:text-slate-100 disabled:opacity-40"
        >
          {VAULT_UI.addCustom}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          className="rounded-md bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          {VAULT_UI.save}
        </button>
        {saveState !== 'idle' && (
          <span className={`text-[12px] ${saveState === 'error' ? 'text-status-error' : 'text-slate-400'}`}>
            {saveState === 'saving' ? SETTINGS_UI.saving : saveState === 'saved' ? SETTINGS_UI.saved : SETTINGS_UI.saveError}
          </span>
        )}
      </div>
    </section>
  );
}
