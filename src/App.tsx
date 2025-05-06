
import './App.css'
import AppRoutes from './Routes'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './modules/auth/hooks/useAuth'
import { QuickLogin } from './modules/auth/components/QuickLogin'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
        <Toaster />
        <QuickLogin />
      </div>
    </AuthProvider>
  );
}

export default App;
