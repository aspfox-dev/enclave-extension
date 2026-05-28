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

const FIELD =
  'rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none';

export function ProviderForm({ providerId, config, isActive, onChange, onMakeActive }: ProviderFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {providerId}
        </span>
        {isActive ? (
          <span className="text-[11px] font-semibold text-status-success">
            {SETTINGS_UI.activeBadge}
          </span>
        ) : (
          <button
            type="button"
            onClick={onMakeActive}
            className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:border-surface-borderStrong hover:text-slate-100"
          >
            {SETTINGS_UI.setActive}
          </button>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-slate-400">{SETTINGS_UI.apiKeyLabel}</span>
        <input
          type="password"
          value={config.apiKey}
          placeholder={SETTINGS_UI.apiKeyPlaceholder}
          onChange={(event) => onChange({ ...config, apiKey: event.target.value })}
          className={FIELD}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-slate-400">{SETTINGS_UI.baseUrlLabel}</span>
        <input
          type="text"
          value={config.baseUrl}
          onChange={(event) => onChange({ ...config, baseUrl: event.target.value })}
          className={FIELD}
        />
      </label>

      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {SETTINGS_UI.modelsHeading}
        </p>
        <div className="grid grid-cols-2 gap-4">
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
