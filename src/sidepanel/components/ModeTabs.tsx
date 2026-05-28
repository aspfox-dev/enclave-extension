import { type ModeDefinition, type ModeId } from '@/shared/constants/modes';

interface ModeTabsProps {
  modes: ModeDefinition[];
  activeMode: ModeId;
  onSelect: (mode: ModeId) => void;
}

export function ModeTabs({ modes, activeMode, onSelect }: ModeTabsProps) {
  return (
    <nav className="flex border-b border-surface-border px-3">
      {modes.map(({ id, label }) => {
        const isActive = id === activeMode;
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(id)}
            className={`-mb-px border-b-2 px-2.5 pb-2.5 pt-2.5 text-[12px] font-medium transition-colors ${
              isActive
                ? 'border-accent text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
