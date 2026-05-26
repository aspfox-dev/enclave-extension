import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ERRORS } from '@/shared/constants/strings';
import '@/styles/global.css';

import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error(ERRORS.sidebarMountFailed);

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
