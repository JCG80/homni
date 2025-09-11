
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProviders } from './app/AppProviders';
import { AppRouter } from './app/AppRouter';

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AppRouter>
      <App />
    </AppRouter>
  </AppProviders>
);
