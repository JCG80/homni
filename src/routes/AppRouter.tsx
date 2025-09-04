import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { mainRouteObjects } from './mainRouteObjects';
import { adminRouteObjects } from './adminRouteObjects';
import { companyRouteObjects } from './companyRouteObjects';
import { applyFeatureFlags } from './filters';
import type { AppRoute } from './routeTypes';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useCurrentRole } from '@/hooks/useCurrentRole';

// Loading fallback component
const RouteLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-muted-foreground">Laster inn...</p>
    </div>
  </div>
);

// Error boundary fallback for route errors
const RouteErrorFallback = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Noe gikk galt</h1>
    <p className="text-muted-foreground mt-2">Det oppstod en feil ved lasting av siden.</p>
  </div>
);

// Unauthorized page component
const UnauthorizedPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Ingen tilgang</h1>
    <p className="text-muted-foreground mt-2">Du har ikke tilgang til denne siden.</p>
  </div>
);

// 404 not found component  
const NotFound = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">404 - Siden ble ikke funnet</h1>
    <p className="text-muted-foreground mt-2">Siden du leter etter eksisterer ikke.</p>
  </div>
);

function renderRoutes(list: AppRoute[]) {
  return list.map(r =>
    r.children?.length ? (
      <Route key={r.path} path={r.path} element={r.element}>
        {renderRoutes(r.children)}
      </Route>
    ) : (
      <Route key={r.path} path={r.path} element={r.element} />
    )
  );
}

export default function AppRouter() {
  const flags = useFeatureFlags();
  const role = useCurrentRole();
  
  // Combine all route objects
  const allRoutes = [
    ...mainRouteObjects,
    ...adminRouteObjects,
    ...companyRouteObjects,
  ];
  
  // Apply feature flags and role filtering
  const filteredRoutes = applyFeatureFlags(allRoutes, flags, role);

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {renderRoutes(filteredRoutes)}
        
        {/* Error routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}