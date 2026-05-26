import { ACTIONS, APP_NAME, APP_TAGLINE } from '@/shared/constants/strings';

function openSettings() {
  chrome.runtime.openOptionsPage();
}

export function SidebarHeader() {
  return (
    <header className="flex items-center justify-between border-b border-surface-border px-4 py-3">
      <div>
        <h1 className="text-sm font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-xs text-slate-400">{APP_TAGLINE}</p>
      </div>
      <button
        type="button"
        onClick={openSettings}
        className="rounded-md border border-surface-border px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-accent hover:text-white"
      >
        {ACTIONS.openSettings}
      </button>
    </header>
  );
}
