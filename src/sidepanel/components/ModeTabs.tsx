import { type ModeDefinition, type ModeId } from '@/shared/constants/modes';

interface ModeTabsProps {
  modes: ModeDefinition[];
  activeMode: ModeId;
  onSelect: (mode: ModeId) => void;
}

export function ModeTabs({ modes, activeMode, onSelect }: ModeTabsProps) {
  return (
    <nav className="flex gap-1 border-b border-surface-border px-2 py-2">
      {modes.map(({ id, label }) => {
        const isActive = id === activeMode;
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive}
            onClick={() => onSelect(id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-accent-muted text-white'
                : 'text-slate-400 hover:bg-surface-raised hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
