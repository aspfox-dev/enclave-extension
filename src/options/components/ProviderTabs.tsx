import { PROVIDER_IDS, PROVIDER_LABELS, type ProviderId } from '@/shared/constants/settings';

interface ProviderTabsProps {
  selected: ProviderId;
  active: ProviderId;
  onSelect: (provider: ProviderId) => void;
}

export function ProviderTabs({ selected, active, onSelect }: ProviderTabsProps) {
  return (
    <nav className="flex flex-wrap border-b border-surface-border">
      {PROVIDER_IDS.map((id) => {
        const isSelected = id === selected;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-2 text-[12px] font-medium transition-colors ${
              isSelected
                ? 'border-accent text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {id === active && (
              <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden />
            )}
            {PROVIDER_LABELS[id]}
          </button>
        );
      })}
    </nav>
  );
}
