import { MODEL_SLOTS, type ProviderId } from '@/shared/constants/settings';
import { SETTINGS_UI } from '@/shared/constants/strings';
import { type ProviderConfig } from '@/shared/types/settings';

import { ModelSlotField } from './ModelSlotField';

interface ProviderFormProps {
  providerId: ProviderId;
  config: ProviderConfig;
  isActive: boolean;
  onChange: (config: ProviderConfig) => void;
  onMakeActive: () => void;
}

const FIELD_CLASS =
  'rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none';

export function ProviderForm({ providerId, config, isActive, onChange, onMakeActive }: ProviderFormProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-surface-border bg-surface-raised p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-500">{providerId}</span>
        {isActive ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">
            {SETTINGS_UI.activeBadge}
          </span>
        ) : (
          <button
            type="button"
            onClick={onMakeActive}
            className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-300 hover:border-accent hover:text-white"
          >
            {SETTINGS_UI.setActive}
          </button>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-300">{SETTINGS_UI.apiKeyLabel}</span>
        <input
          type="password"
          value={config.apiKey}
          placeholder={SETTINGS_UI.apiKeyPlaceholder}
          onChange={(event) => onChange({ ...config, apiKey: event.target.value })}
          className={FIELD_CLASS}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-300">{SETTINGS_UI.baseUrlLabel}</span>
        <input
          type="text"
          value={config.baseUrl}
          onChange={(event) => onChange({ ...config, baseUrl: event.target.value })}
          className={FIELD_CLASS}
        />
      </label>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold text-slate-400">{SETTINGS_UI.modelsHeading}</span>
        <div className="grid grid-cols-2 gap-3">
          {MODEL_SLOTS.map((slot) => (
            <ModelSlotField
              key={slot}
              slot={slot}
              value={config.models[slot]}
              onChange={(value) => onChange({ ...config, models: { ...config.models, [slot]: value } })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
