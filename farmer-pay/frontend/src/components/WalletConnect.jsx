import React, { useState, useEffect } from 'react'
import { useAuth } from '../App.jsx'
import { connectWallet, disconnectWallet, reconnectWallet } from '../services/wallet.js'
import { verifyWallet } from '../services/api.js'
import { truncateAddress } from '../services/constants.js'

// ─── Icons ────────────────────────────────────────────────────────────────────
const WalletIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 3l-4 4-4-4" />
    <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

const ChevronDown = () => (
  <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
  </svg>
)

// ─── Connected wallet dropdown (shown in AppShell navbar) ─────────────────────
export default function WalletConnect() {
  const { wallet, role, logout } = useAuth()
  const [open, setOpen] = useState(false)

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (!wallet) return null

  const ROLE_PILL = {
    farmer:   'bg-leaf/15 text-leaf',
    buyer:    'bg-sky/15 text-sky-700',
    verifier: 'bg-grain/20 text-grain-600',
    admin:    'bg-soil/10 text-soil',
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors text-sm select-none"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {/* Avatar dot */}
        <span className="w-6 h-6 rounded-full bg-leaf/20 border border-leaf/30 flex items-center justify-center flex-shrink-0">
          <WalletIcon />
        </span>
        <span className="font-mono text-xs text-stone-600 hidden sm:block">
          {truncateAddress(wallet, 5, 4)}
        </span>
        <ChevronDown />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-100 z-30 animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
              <p className="section-label mb-1">Connected Wallet</p>
              <p className="font-mono text-xs text-stone-700 break-all leading-relaxed">{wallet}</p>
            </div>

            {/* Role */}
            <div className="px-4 py-3 border-b border-stone-100">
              <p className="section-label mb-1.5">Role</p>
              <span className={`badge capitalize ${ROLE_PILL[role] || 'badge-created'}`}>
                {role}
              </span>
            </div>

            {/* Links */}
            <div className="px-2 py-2">
              <a
                href={`https://testnet.algoexplorer.io/address/${wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Explorer ↗
              </a>
            </div>

            {/* Disconnect */}
            <div className="px-2 pb-2">
              <button
                onClick={async () => {
                  setOpen(false)
                  try { await disconnectWallet() } catch { /* ignore */ }
                  logout()
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogoutIcon />
                Disconnect wallet
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── ConnectButton — used on LandingPage ─────────────────────────────────────
export function ConnectButton({ role, onSuccess, className = '' }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function handleConnect() {
    setLoading(true)
    setError(null)
    try {
      // 1. Open Pera Wallet and get address
      const address = await connectWallet()

      // 2. Verify with backend — sends role so JWT is issued with correct role
      //    Also upserts the user record in one call (auth.js handles both)
      const authRes = await verifyWallet(address, role)
      const token   = authRes.data?.token
      if (!token) throw new Error('No token returned from server')

      onSuccess({ address, role, token })
    } catch (err) {
      console.error('Wallet connect error:', err)
      const msg = err?.response?.data?.error
        || err?.message
        || 'Could not connect wallet. Make sure Pera Wallet is installed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="btn-primary btn-lg w-full"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <WalletIcon />
        )}
        {loading ? 'Opening Pera Wallet…' : 'Connect Pera Wallet'}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600 text-center leading-snug">{error}</p>
      )}
    </div>
  )
}

// ─── AutoReconnect — call once at app boot to restore session ─────────────────
export function useAutoReconnect() {
  const { login, isLoggedIn } = useAuth()

  useEffect(() => {
    if (isLoggedIn) return // Already have a session
    reconnectWallet()
      .then(address => {
        if (!address) return
        const token = localStorage.getItem('fp_token')
        const role  = localStorage.getItem('fp_role')
        if (token && role) login({ address, role, token })
      })
      .catch(() => { /* no previous session */ })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
