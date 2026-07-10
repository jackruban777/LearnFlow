import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryProvider } from './providers/QueryProvider';
import { NotificationProvider } from './providers/NotificationProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </QueryProvider>
  </StrictMode>
);
