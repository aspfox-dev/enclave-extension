import { CHAT_SUBMODES, type ChatSubmode } from '@/shared/constants/settings';
import { CHAT_SUBMODE_LABELS, SETTINGS_UI } from '@/shared/constants/strings';
import { type AgentLimits, type FeatureFlags, type Settings } from '@/shared/types/settings';

interface LimitsFormProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

const LIMIT_FIELDS: { key: keyof AgentLimits; label: string }[] = [
  { key: 'maxSteps', label: SETTINGS_UI.maxSteps },
  { key: 'stepDelayMs', label: SETTINGS_UI.stepDelay },
  { key: 'llmTimeoutMs', label: SETTINGS_UI.llmTimeout },
  { key: 'wallTimeoutMs', label: SETTINGS_UI.wallTimeout },
];

const FEATURE_FIELDS: { key: keyof FeatureFlags; label: string }[] = [
  { key: 'visionEscalation', label: SETTINGS_UI.visionEscalation },
  { key: 'memory', label: SETTINGS_UI.memory },
];

export function LimitsForm({ settings, onChange }: LimitsFormProps) {
  function changeLimit(key: keyof AgentLimits, raw: string) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    onChange({ ...settings, limits: { ...settings.limits, [key]: parsed } });
  }

  function toggleFeature(key: keyof FeatureFlags) {
    onChange({ ...settings, features: { ...settings.features, [key]: !settings.features[key] } });
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-surface-border bg-surface-raised p-4">
      <h2 className="text-sm font-medium text-slate-300">{SETTINGS_UI.limitsHeading}</h2>
      <div className="grid grid-cols-2 gap-3">
        {LIMIT_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">{label}</span>
            <input
              type="number"
              value={settings.limits[key]}
              onChange={(event) => changeLimit(key, event.target.value)}
              className="rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none"
            />
          </label>
        ))}
      </div>

      <h2 className="text-sm font-medium text-slate-300">{SETTINGS_UI.behaviorHeading}</h2>
      <div className="flex flex-col gap-2">
        {FEATURE_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={settings.features[key]} onChange={() => toggleFeature(key)} />
            {label}
          </label>
        ))}
        <label className="mt-1 flex flex-col gap-1">
          <span className="text-xs text-slate-400">{SETTINGS_UI.chatDefault}</span>
          <select
            value={settings.chatSubmode}
            onChange={(event) => onChange({ ...settings, chatSubmode: event.target.value as ChatSubmode })}
            className="w-32 rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none"
          >
            {CHAT_SUBMODES.map((submode) => (
              <option key={submode} value={submode}>
                {CHAT_SUBMODE_LABELS[submode]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
