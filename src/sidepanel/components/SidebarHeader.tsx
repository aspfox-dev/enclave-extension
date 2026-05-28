import { ACTIONS, APP_NAME } from '@/shared/constants/strings';

function openSettings() {
  chrome.runtime.openOptionsPage();
}

export function SidebarHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <span className="text-[13px] font-semibold tracking-tight text-slate-100">{APP_NAME}</span>
      <button
        type="button"
        onClick={openSettings}
        className="text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-200"
      >
        {ACTIONS.openSettings}
      </button>
    </header>
  );
}
