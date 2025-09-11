import { BrowserRouter, HashRouter } from 'react-router-dom';

export function AppRouter({ children }: { children: React.ReactNode }) {
  const useHash = import.meta.env.VITE_ROUTER_MODE === 'hash';
  const Router = useHash ? HashRouter : BrowserRouter;
  return <Router>{children}</Router>;
}