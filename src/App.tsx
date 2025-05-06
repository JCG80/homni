
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Authenticated } from './components/Authenticated'
import { Unauthenticated } from './components/Unauthenticated'
import { useAuth } from './modules/auth/hooks/useAuth'
import { Routes, Route, Link } from 'react-router-dom'
import { AdminLeadsPage } from './modules/leads/pages/AdminLeadsPage'
import { LeadTestPage } from './modules/leads/pages/LeadTestPage'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Authenticated><AdminLeadsPage /></Authenticated>} />
        <Route path="/login" element={<Unauthenticated />} />
        <Route path="/leads/test" element={<LeadTestPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
