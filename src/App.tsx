
import './App.css'
import AppRoutes from './Routes'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <div className="App">
      <AppRoutes />
      <Toaster />
    </div>
  );
}

export default App;
