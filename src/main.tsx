import { FocusStyleManager } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/popover2/lib/css/blueprint-popover2.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import ICU from 'i18next-icu';
import * as ReactDOM from 'react-dom/client';
import { initReactI18next } from 'react-i18next';

import App from './App';
import './index.css';
import de from './translations/de.json';
import en from './translations/en.json';
import './variables.css';

// https://blueprintjs.com/docs/#core/accessibility.focus-management
FocusStyleManager.onlyShowFocusOnTabs();

i18n
  .use(ICU)
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      de: {
        translation: de,
      },
    },
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },
  });

const container = document.getElementById('root');

if (!container) throw new Error('Failed to find the container');

const root = ReactDOM.createRoot(container);

root.render(<App />);
