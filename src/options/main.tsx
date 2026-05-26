import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ERRORS } from '@/shared/constants/strings';
import '@/styles/global.css';

import { Options } from './Options';

const root = document.getElementById('root');
if (!root) throw new Error(ERRORS.optionsMountFailed);

createRoot(root).render(
  <StrictMode>
    <Options />
  </StrictMode>,
);
