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

const FIELD =
  'rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-[13px] text-slate-100 focus:border-accent focus:outline-none';

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
    <section className="flex flex-col gap-5 border-t border-surface-border pt-6 mt-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {SETTINGS_UI.limitsHeading}
      </p>
      <div className="grid grid-cols-2 gap-4">
        {LIMIT_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className="text-[12px] text-slate-400">{label}</span>
            <input
              type="number"
              value={settings.limits[key]}
              onChange={(event) => changeLimit(key, event.target.value)}
              className={FIELD}
            />
          </label>
        ))}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {SETTINGS_UI.behaviorHeading}
      </p>
      <div className="flex flex-col gap-3">
        {FEATURE_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 text-[13px] text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.features[key]}
              onChange={() => toggleFeature(key)}
              className="accent-accent"
            />
            {label}
          </label>
        ))}
        <label className="mt-1 flex flex-col gap-1.5">
          <span className="text-[12px] text-slate-400">{SETTINGS_UI.chatDefault}</span>
          <select
            value={settings.chatSubmode}
            onChange={(event) => onChange({ ...settings, chatSubmode: event.target.value as ChatSubmode })}
            className={`w-36 ${FIELD}`}
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
