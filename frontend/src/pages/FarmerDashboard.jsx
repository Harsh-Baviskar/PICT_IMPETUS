import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../App.jsx'
import { getTrades, getUser } from '../services/api.js'
import TradeCard from '../components/TradeCard.jsx'

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4 text-2xl">📭</div>
    <h3 className="font-display font-600 text-stone-700 mb-1">No incoming trades</h3>
    <p className="text-sm text-stone-400 max-w-xs">
      When a buyer creates a trade with your wallet address, it will appear here.
    </p>
  </div>
)

export default function FarmerDashboard() {
  const { wallet } = useAuth()
  const [trades,  setTrades]  = useState([])
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [filter,  setFilter]  = useState('active')

  const fetchAll = useCallback(async () => {
    try {
      setError(null)
      const [tradesRes, userRes] = await Promise.all([
        getTrades(),
        getUser(wallet).catch(() => null),
      ])
      setTrades((tradesRes.data || []).filter(t => t.farmer_address === wallet))
      setUser(userRes?.data || null)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => { fetchAll() }, [fetchAll])

  const FILTERS = [
    { key: 'active',   label: 'Active',   states: ['FUNDED','DELIVERED'] },
    { key: 'pending',  label: 'Pending',  states: ['CREATED'] },
    { key: 'released', label: 'Paid',     states: ['RELEASED'] },
    { key: 'disputed', label: 'Disputed', states: ['DISPUTED'] },
    { key: 'all',      label: 'All',      states: null },
  ]

  const currentFilter = FILTERS.find(f => f.key === filter)
  const filtered = currentFilter.states
    ? trades.filter(t => currentFilter.states.includes(t.state))
    : trades

  const totalEarned   = user?.total_earned_algo   ?? trades.filter(t => t.state === 'RELEASED').reduce((s, t) => s + (t.total_amount_algo || 0), 0)
  const totalComplete = user?.trades_completed    ?? trades.filter(t => t.state === 'RELEASED').length
  const activeCount   = trades.filter(t => ['FUNDED','DELIVERED'].includes(t.state)).length

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────── */}
      <div>
        <p className="section-label mb-1">Farmer Dashboard</p>
        <h1 className="page-title">My Trades</h1>
      </div>

      {/* ── Earnings cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stagger">
        <div className="card !bg-leaf !border-leaf/30 text-white">
          <p className="text-3xl font-display font-700 mb-0.5">
            {totalEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs opacity-80">ALGO Earned Total</p>
        </div>
        <div className="card">
          <p className="text-3xl font-display font-700 text-soil mb-0.5">{totalComplete}</p>
          <p className="text-xs text-stone-400">Trades Completed</p>
        </div>
        <div className="card">
          <p className="text-3xl font-display font-700 text-sky mb-0.5">{activeCount}</p>
          <p className="text-xs text-stone-400">Active Trades</p>
        </div>
      </div>

      {/* ── Filter tabs ───────────────────────────────────────── */}
      {trades.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-600 transition-colors ${
                filter === f.key
                  ? 'bg-soil text-white'
                  : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {f.label}
              {f.states && (
                <span className="ml-1.5 opacity-60">
                  {trades.filter(t => f.states.includes(t.state)).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 border-2 border-stone-200 border-t-leaf rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="card !bg-red-50 !border-red-100 text-red-700 text-sm">{error}</div>
      )}

      {!loading && !error && trades.length === 0 && <EmptyState />}

      {!loading && !error && trades.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-stone-400 py-8 text-center">No trades in this category.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {filtered.map(trade => (
            <TradeCard key={trade.trade_id} trade={trade} viewerRole="farmer" onRefresh={fetchAll} />
          ))}
        </div>
      )}
    </div>
  )
}
