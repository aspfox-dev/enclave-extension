import { PROVIDER_IDS, PROVIDER_LABELS, type ProviderId } from '@/shared/constants/settings';

interface ProviderTabsProps {
  selected: ProviderId;
  active: ProviderId;
  onSelect: (provider: ProviderId) => void;
}

export function ProviderTabs({ selected, active, onSelect }: ProviderTabsProps) {
  return (
    <nav className="flex flex-wrap gap-1.5">
      {PROVIDER_IDS.map((id) => {
        const isSelected = id === selected;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isSelected ? 'bg-accent-muted text-white' : 'text-slate-400 hover:bg-surface-raised'
            }`}
          >
            {id === active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            {PROVIDER_LABELS[id]}
          </button>
        );
      })}
    </nav>
  );
}
