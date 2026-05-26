import { defineManifest } from '@crxjs/vite-plugin';

import { APP_NAME } from './shared/constants/strings';

export default defineManifest({
  manifest_version: 3,
  name: APP_NAME,
  version: '0.1.0',
  description: 'Local-first autonomous AI browser agent. Bring your own key, fully open source.',
  minimum_chrome_version: '116',
  action: {
    default_title: 'Open Enclave',
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  options_page: 'src/options/index.html',
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/content-script.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['sidePanel', 'storage', 'tabs', 'scripting', 'activeTab', 'debugger'],
  host_permissions: ['<all_urls>'],
  commands: {
    'toggle-sidebar': {
      suggested_key: {
        default: 'Alt+Shift+A',
      },
      // Chrome cannot programmatically close the side panel, so this opens it; the
      // user closes it with the same panel control. Naming it "toggle" matches the
      // product shortcut even though the API only supports the open half.
      description: 'Open the Enclave sidebar',
    },
  },
});
