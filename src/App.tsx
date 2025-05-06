
import './App.css'
import AppRoutes from './Routes'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './modules/auth/hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
