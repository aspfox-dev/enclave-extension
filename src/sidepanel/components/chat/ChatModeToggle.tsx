import { CHAT_SUBMODES, type ChatSubmode } from '@/shared/constants/settings';
import { CHAT_SUBMODE_LABELS, CHAT_UI } from '@/shared/constants/strings';

interface ChatModeToggleProps {
  submode: ChatSubmode;
  hasTurns: boolean;
  onChange: (submode: ChatSubmode) => void;
  onClear: () => void;
}

const HINT_BY_SUBMODE: Record<ChatSubmode, string> = {
  quick: CHAT_UI.quickHint,
  pro: CHAT_UI.proHint,
};

export function ChatModeToggle({ submode, hasTurns, onChange, onClear }: ChatModeToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="inline-flex overflow-hidden rounded-md border border-surface-border">
          {CHAT_SUBMODES.map((option) => {
            const isActive = option === submode;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  isActive ? 'bg-accent-muted text-white' : 'text-slate-400 hover:bg-surface-raised'
                }`}
              >
                {CHAT_SUBMODE_LABELS[option]}
              </button>
            );
          })}
        </div>
        {hasTurns && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            {CHAT_UI.clear}
          </button>
        )}
      </div>
      <p className="text-[11px] text-slate-500">{HINT_BY_SUBMODE[submode]}</p>
    </div>
  );
}
