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
        <div className="flex gap-4">
          {CHAT_SUBMODES.map((option) => {
            const isActive = option === submode;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={`text-[12px] font-medium transition-colors ${
                  isActive ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'
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
            className="text-[12px] text-slate-500 transition-colors hover:text-slate-300"
          >
            {CHAT_UI.clear}
          </button>
        )}
      </div>
      <p className="text-[11px] text-slate-500">{HINT_BY_SUBMODE[submode]}</p>
    </div>
  );
}
