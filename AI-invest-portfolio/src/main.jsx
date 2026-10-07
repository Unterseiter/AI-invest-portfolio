import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import '@fontsource-variable/inter';

import App from './app/App'

import "./styles/global.scss";
import { initTheme } from '@/features/theme/model/themeStore';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Не найден элемент #root в index.html');
}

initTheme();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
