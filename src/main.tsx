import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n.js';
import { Suspense } from 'react';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <Suspense fallback="loading">
      <App />
    </Suspense>
  </StrictMode>,
);
