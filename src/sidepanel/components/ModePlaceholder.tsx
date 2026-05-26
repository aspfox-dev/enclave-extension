import { type ModeDefinition } from '@/shared/constants/modes';
import { ACTIONS } from '@/shared/constants/strings';

interface ModePlaceholderProps {
  mode: ModeDefinition;
}

export function ModePlaceholder({ mode }: ModePlaceholderProps) {
  return (
    <section className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold">{mode.label}</h2>
        <span className="rounded-full border border-surface-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
          {ACTIONS.comingSoon}
        </span>
      </div>
      <p className="max-w-sm text-sm leading-relaxed text-slate-400">{mode.description}</p>
    </section>
  );
}
