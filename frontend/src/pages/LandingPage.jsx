import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import { ConnectButton } from '../components/WalletConnect.jsx'
import { ROLES } from '../services/constants.js'

const ROLE_OPTIONS = [
  {
    id:    ROLES.BUYER,
    emoji: '🧑‍💼',
    title: 'Buyer',
    desc:  'Create trade contracts and deposit payment into escrow.',
  },
  {
    id:    ROLES.FARMER,
    emoji: '🌾',
    title: 'Farmer',
    desc:  'Receive guaranteed payment the moment delivery is confirmed.',
  },
  {
    id:    ROLES.VERIFIER,
    emoji: '🏭',
    title: 'Verifier',
    desc:  'Warehouse or inspector who confirms crop delivery on-chain.',
  },
  {
    id:    ROLES.ADMIN,
    emoji: '🔑',
    title: 'Admin',
    desc:  'Manage the verifier whitelist and resolve deadlocked disputes.',
  },
]

const ROLE_DASHBOARD = {
  buyer:    '/buyer',
  farmer:   '/farmer',
  verifier: '/verifier',
  admin:    '/admin',
}

const STEPS = [
  { n: '01', title: 'Buyer creates trade',     body: 'Fills in crop details, quantity, price, and assigns a trusted verifier.' },
  { n: '02', title: 'Funds locked in escrow',  body: 'Buyer deposits ALGO into the smart contract. No one can touch it yet.' },
  { n: '03', title: 'Farmer delivers',         body: 'Farmer delivers crops and uploads a proof photo stored on IPFS.' },
  { n: '04', title: 'Verifier confirms',        body: 'Warehouse inspector signs the delivery on-chain via Pera Wallet.' },
  { n: '05', title: 'Instant payment',         body: 'Contract auto-releases ALGO to the farmer in seconds. Done.' },
]

export default function LandingPage() {
  const { login, isLoggedIn, role } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(ROLES.FARMER)

  // Redirect already-logged-in users to their dashboard
  useEffect(() => {
    if (isLoggedIn && role) {
      navigate(ROLE_DASHBOARD[role] || '/farmer', { replace: true })
    }
  }, [isLoggedIn, role, navigate])

  function handleSuccess({ address, role: r, token }) {
    login({ address, role: r, token })
    navigate(ROLE_DASHBOARD[r] || '/farmer')
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* ── Minimal top bar ────────────────────────────────────── */}
      <header className="h-14 flex items-center px-6 border-b border-stone-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-leaf flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2C5.6 2 2 5.6 2 10s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 2c.8 0 1.5.1 2.2.4L4.4 12.2C4.1 11.5 4 10.8 4 10c0-3.3 2.7-6 6-6zm0 12c-.8 0-1.5-.1-2.2-.4l7.8-7.8c.3.7.4 1.4.4 2.2 0 3.3-2.7 6-6 6z"/>
            </svg>
          </div>
          <span className="font-display font-700 text-soil">FarmPay</span>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-stone-400 font-mono">Algorand TestNet</span>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="animate-fade-up max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-leaf/10 text-leaf text-xs font-display font-600 mb-6 border border-leaf/20">
            <span className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse-soft" />
            Live on Algorand TestNet
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-700 text-soil leading-tight mb-4">
            Crop payments,<br />
            <span className="text-leaf">guaranteed on-chain.</span>
          </h1>

          <p className="text-stone-500 text-lg mb-10 max-w-lg mx-auto font-body leading-relaxed">
            Smart contract escrow that automatically releases payment to farmers
            the moment a trusted verifier confirms delivery. No delays, no disputes.
          </p>

          {/* ── Role selector ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-card border border-stone-100 p-6 mb-4 text-left max-w-lg mx-auto">
            <p className="section-label mb-4">I am a</p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {ROLE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedRole(opt.id)}
                  className={`flex flex-col gap-1 p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                    selectedRole === opt.id
                      ? 'border-leaf bg-leaf/5 shadow-glow-leaf/20'
                      : 'border-stone-100 hover:border-stone-200 bg-stone-50'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className={`font-display font-600 text-sm ${selectedRole === opt.id ? 'text-leaf' : 'text-stone-700'}`}>
                    {opt.title}
                  </span>
                  <span className="text-xs text-stone-400 leading-snug">{opt.desc}</span>
                </button>
              ))}
            </div>

            <ConnectButton
              role={selectedRole}
              onSuccess={handleSuccess}
            />

            <p className="text-center text-xs text-stone-400 mt-3">
              Requires{' '}
              <a href="https://perawallet.app" target="_blank" rel="noopener noreferrer" className="text-sky hover:underline">
                Pera Wallet
              </a>
              {' '}on TestNet.{' '}
              <a href="https://dispenser.testnet.aws.algodev.network" target="_blank" rel="noopener noreferrer" className="text-sky hover:underline">
                Get free TestNet ALGO →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="bg-white border-t border-stone-100 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="section-label text-center mb-3">How it works</p>
          <h2 className="font-display text-2xl font-700 text-soil text-center mb-10">
            Five steps, zero middlemen
          </h2>
          <div className="space-y-4 stagger">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-xl bg-leaf/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-xs font-600 text-leaf">{s.n}</span>
                </div>
                <div className="pt-1">
                  <p className="font-display font-600 text-soil text-sm mb-0.5">{s.title}</p>
                  <p className="text-stone-500 text-sm">{s.body}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="ml-5 mt-10 absolute w-px h-4 bg-stone-200" style={{ display: 'none' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="py-5 text-center text-xs text-stone-400 border-t border-stone-100">
        FarmPay — Built on Algorand TestNet &nbsp;·&nbsp;
        <a href="https://testnet.algoexplorer.io" target="_blank" rel="noopener noreferrer" className="hover:text-stone-600">
          Explorer ↗
        </a>
      </footer>
    </div>
  )
}
