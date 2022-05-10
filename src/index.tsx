import './index.scss';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';

import * as ReactDOM from 'react-dom/client';

import App from './App';
import { StrictMode } from 'react';

const container = document.getElementById('root');

if (!container) throw new Error('Failed to find the container');

const root = ReactDOM.createRoot(container);

root.render(
  // <StrictMode>
  <App />
  // </StrictMode>
);
