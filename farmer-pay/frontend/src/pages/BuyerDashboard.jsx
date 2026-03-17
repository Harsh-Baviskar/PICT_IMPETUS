import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../App.jsx'
import { getTrades } from '../services/api.js'
import TradeCard from '../components/TradeCard.jsx'
import CreateTradeForm from '../components/CreateTradeForm.jsx'

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

const EmptyState = ({ onNew }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4 text-2xl">🌾</div>
    <h3 className="font-display font-600 text-stone-700 mb-1">No trades yet</h3>
    <p className="text-sm text-stone-400 mb-6 max-w-xs">
      Create your first trade contract to start paying farmers securely via escrow.
    </p>
    <button onClick={onNew} className="btn-primary">
      <PlusIcon /> Create First Trade
    </button>
  </div>
)

export default function BuyerDashboard() {
  const { wallet } = useAuth()
  const [trades,      setTrades]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [showForm,    setShowForm]    = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchTrades = useCallback(async () => {
    try {
      setError(null)
      const res = await getTrades()
      // Show only trades where this wallet is the buyer
      setTrades((res.data || []).filter(t => t.buyer_address === wallet))
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load trades')
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  const filtered = activeFilter === 'all'
    ? trades
    : trades.filter(t => t.state === activeFilter.toUpperCase())

  const stats = {
    total:    trades.length,
    active:   trades.filter(t => ['CREATED','FUNDED','DELIVERED'].includes(t.state)).length,
    released: trades.filter(t => t.state === 'RELEASED').length,
    disputed: trades.filter(t => t.state === 'DISPUTED').length,
  }

  const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'created',   label: 'Created' },
    { key: 'funded',    label: 'Funded' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'released',  label: 'Released' },
    { key: 'disputed',  label: 'Disputed' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="section-label mb-1">Buyer Dashboard</p>
          <h1 className="page-title">My Trades</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <PlusIcon /> New Trade
        </button>
      </div>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
        {[
          { label: 'Total Trades',   value: stats.total,    color: 'text-soil' },
          { label: 'Active',         value: stats.active,   color: 'text-sky' },
          { label: 'Released',       value: stats.released, color: 'text-leaf' },
          { label: 'Disputed',       value: stats.disputed, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="card !p-4">
            <p className={`text-2xl font-display font-700 mb-0.5 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter bar ────────────────────────────────────────── */}
      {trades.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-600 transition-colors ${
                activeFilter === f.key
                  ? 'bg-soil text-white'
                  : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  {trades.filter(t => t.state === f.key.toUpperCase()).length}
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

      {!loading && !error && trades.length === 0 && (
        <EmptyState onNew={() => setShowForm(true)} />
      )}

      {!loading && !error && trades.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-stone-400 py-8 text-center">No trades matching this filter.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {filtered.map(trade => (
            <TradeCard key={trade.trade_id} trade={trade} viewerRole="buyer" onRefresh={fetchTrades} />
          ))}
        </div>
      )}

      {/* ── Create Trade Modal ────────────────────────────────── */}
      {showForm && (
        <Modal title="New Trade Contract" onClose={() => setShowForm(false)}>
          <CreateTradeForm
            onSuccess={() => { setShowForm(false); fetchTrades() }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="font-display font-700 text-soil">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
