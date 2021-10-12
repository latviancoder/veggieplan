import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import '@blueprintjs/core/lib/css/blueprint.css';

const container = document.getElementById('root');

if (!container) throw new Error('Failed to find the container');

const root = ReactDOM.createRoot(container);

root.render(<App />);
