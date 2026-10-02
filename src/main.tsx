import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import './styles.css';
import { App } from './App';
import { installFocusRing, installGestureBlockers } from './kit/gestures';
import { installScale } from './kit/scale';
import { installAudioUnlock } from './kit/sound';
import { installUpdates } from './kit/updates';

installScale();
installGestureBlockers();
installFocusRing();
installAudioUnlock();
installUpdates();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
