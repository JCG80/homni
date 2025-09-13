
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProviders } from './app/AppProviders';
import { AppRouter } from './app/AppRouter';
import { PluginSystemProvider } from '@/lib/core/PluginSystemProvider';
import { LocalizationProvider } from '@/lib/localization/LocalizationProvider';
import { FeatureFlagProvider } from '@/lib/feature-flags/FeatureFlagProvider';

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <PluginSystemProvider>
      <LocalizationProvider defaultLocale="no">
        <FeatureFlagProvider>
          <AppRouter>
            <App />
          </AppRouter>
        </FeatureFlagProvider>
      </LocalizationProvider>
    </PluginSystemProvider>
  </AppProviders>
);
