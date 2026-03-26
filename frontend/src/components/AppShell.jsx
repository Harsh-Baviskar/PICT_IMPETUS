import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import WalletConnect from './WalletConnect.jsx'
import { ROLE_LABELS } from '../services/constants.js'

const ROLE_NAV = {
  buyer:    [{ to: '/buyer',    label: 'Dashboard' }],
  farmer:   [{ to: '/farmer',  label: 'Dashboard' }],
  verifier: [{ to: '/verifier',label: 'Deliveries' }],
  admin:    [
    { to: '/admin',    label: 'Admin' },
    { to: '/buyer',    label: 'Buyer' },
    { to: '/farmer',   label: 'Farmer' },
    { to: '/verifier', label: 'Verifier' },
  ],
}

const ROLE_BADGE = {
  farmer:   'bg-leaf/15 text-leaf border border-leaf/20',
  buyer:    'bg-sky/15 text-sky-700 border border-sky/20',
  verifier: 'bg-grain/20 text-amber-700 border border-grain/20',
  admin:    'bg-soil/10 text-soil border border-soil/20',
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <div className="w-8 h-8 rounded-xl bg-leaf flex items-center justify-center shadow-sm">
        <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="font-display font-bold text-lg text-soil tracking-tight select-none">FarmPay</span>
    </div>
  )
}

export default function AppShell() {
  const { role } = useAuth()
  const links = ROLE_NAV[role] || []

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* ── Sticky top nav ───────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Left: logo + nav links */}
          <div className="flex items-center gap-5 min-w-0">
            <Logo />
            <nav className="hidden sm:flex items-center gap-0.5">
              {links.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ' +
                    (isActive
                      ? 'bg-leaf/10 text-leaf font-semibold'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100')
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right: role badge + wallet dropdown */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {role && (
              <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[role] || ''}`}>
                {ROLE_LABELS[role]}
              </span>
            )}
            <WalletConnect />
          </div>

        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-stone-100 bg-white py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-stone-400">
          <span className="font-display">FarmPay — Algorand TestNet</span>
          <a
            href="https://testnet.algoexplorer.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-600 transition-colors"
          >
            TestNet Explorer ↗
          </a>
        </div>
      </footer>
    </div>
  )
}
