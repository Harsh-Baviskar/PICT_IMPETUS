import React, { createContext, useContext, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LandingPage        from './pages/LandingPage.jsx'
import BuyerDashboard     from './pages/BuyerDashboard.jsx'
import FarmerDashboard    from './pages/FarmerDashboard.jsx'
import VerifierDashboard  from './pages/VerifierDashboard.jsx'
import AdminDashboard     from './pages/AdminDashboard.jsx'
import TradeDetail        from './pages/TradeDetail.jsx'
import AppShell           from './components/AppShell.jsx'
import { useAutoReconnect } from './components/WalletConnect.jsx'

// ─── Auth Context ─────────────────────────────────────────────────────────────
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [wallet, setWallet] = useState(() => localStorage.getItem('fp_wallet') || null)
  const [role,   setRole]   = useState(() => localStorage.getItem('fp_role')   || null)
  const [token,  setToken]  = useState(() => localStorage.getItem('fp_token')  || null)

  const login = useCallback(({ address, role, token }) => {
    setWallet(address)
    setRole(role)
    setToken(token)
    localStorage.setItem('fp_wallet', address)
    localStorage.setItem('fp_role',   role)
    localStorage.setItem('fp_token',  token)
  }, [])

  const logout = useCallback(() => {
    setWallet(null)
    setRole(null)
    setToken(null)
    localStorage.removeItem('fp_wallet')
    localStorage.removeItem('fp_role')
    localStorage.removeItem('fp_token')
  }, [])

  return (
    <AuthContext.Provider value={{ wallet, role, token, login, logout, isLoggedIn: !!wallet }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Route Guards ─────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/" replace />
}

function RequireRole({ roles, children }) {
  const { role } = useAuth()
  if (!roles.includes(role)) return <Navigate to={`/${role}`} replace />
  return children
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function AutoReconnect() { useAutoReconnect(); return null }

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AutoReconnect />
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route path="/buyer"
              element={<RequireRole roles={['buyer','admin']}><BuyerDashboard /></RequireRole>} />
            <Route path="/farmer"
              element={<RequireRole roles={['farmer','admin']}><FarmerDashboard /></RequireRole>} />
            <Route path="/verifier"
              element={<RequireRole roles={['verifier','admin']}><VerifierDashboard /></RequireRole>} />
            <Route path="/admin"
              element={<RequireRole roles={['admin']}><AdminDashboard /></RequireRole>} />
            <Route path="/trade/:tradeId" element={<TradeDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
