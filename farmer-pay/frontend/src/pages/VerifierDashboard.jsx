import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import { getTrades, buildConfirmTxn, submitSignedTxn } from '../services/api.js'
import { signTransaction } from '../services/wallet.js'
import StatusTimeline from '../components/StatusTimeline.jsx'
import {
  truncateAddress, formatDate, explorerTxUrl, explorerAppUrl,
} from '../services/constants.js'

function ConfirmButton({ trade, onDone }) {
  const [loading, setLoading] = useState(false)
  const [txid,    setTxid]    = useState(null)
  const [error,   setError]   = useState(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      // 1. Ask backend to build unsigned txn
      const res = await buildConfirmTxn(trade.trade_id)
      if (!res.data?.unsigned_txn) {
        // Day 3 stub — show message
        setError(res.data?.message || 'Confirm txn not yet implemented (Day 3)')
        return
      }
      // 2. Sign with Pera Wallet
      const signed = await signTransaction(res.data.unsigned_txn)
      // 3. Submit
      const submit = await submitSignedTxn(trade.trade_id, signed)
      setTxid(submit.data?.txid || 'submitted')
      onDone()
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to confirm')
    } finally {
      setLoading(false)
    }
  }

  if (txid) {
    return (
      <div className="text-xs text-leaf font-body">
        ✓ Confirmed!{' '}
        {txid !== 'submitted' && (
          <a href={explorerTxUrl(txid)} target="_blank" rel="noopener noreferrer" className="underline">
            View tx ↗
          </a>
        )}
      </div>
    )
  }

  return (
    <div>
      <button onClick={handleConfirm} disabled={loading} className="btn-primary btn-sm w-full">
        {loading
          ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : '✓'
        }
        {loading ? 'Signing…' : 'Confirm Delivery'}
      </button>
      {error && <p className="text-xs text-amber-600 mt-1 leading-snug">{error}</p>}
    </div>
  )
}

function PendingCard({ trade, onRefresh }) {
  const navigate = useNavigate()
  return (
    <div className="card hover:shadow-card-hover transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="badge badge-delivered mb-1">Awaiting Confirmation</span>
          <p className="font-display font-700 text-soil">{trade.crop_type}</p>
        </div>
        <button
          onClick={() => navigate(`/trade/${trade.trade_id}`)}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          Details ↗
        </button>
      </div>

      {/* Info rows */}
      <div className="space-y-1.5 text-xs mb-4">
        <div className="flex justify-between">
          <span className="text-stone-400">Quantity</span>
          <span className="font-medium text-stone-700">{trade.quantity_kg?.toLocaleString('en-IN')} kg</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Escrow amount</span>
          <span className="font-display font-600 text-soil">{trade.total_amount_algo} ALGO</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Farmer</span>
          <span className="wallet-address !text-xs">{truncateAddress(trade.farmer_address)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Deadline</span>
          <span className={`font-medium ${new Date(trade.delivery_deadline) < new Date() ? 'text-red-500' : 'text-stone-700'}`}>
            {formatDate(trade.delivery_deadline)}
          </span>
        </div>
        {trade.delivery_proof_ipfs && (
          <div className="flex justify-between">
            <span className="text-stone-400">Proof photo</span>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${trade.delivery_proof_ipfs}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky hover:underline"
            >
              View on IPFS ↗
            </a>
          </div>
        )}
      </div>

      {trade.app_id && (
        <div className="mb-3">
          <a
            href={explorerAppUrl(trade.app_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky hover:underline"
          >
            View contract on TestNet Explorer ↗
          </a>
        </div>
      )}

      <ConfirmButton trade={trade} onDone={onRefresh} />
    </div>
  )
}

export default function VerifierDashboard() {
  const { wallet } = useAuth()
  const [trades,  setTrades]  = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [tab,     setTab]     = useState('pending')

  const fetchTrades = useCallback(async () => {
    try {
      setError(null)
      const res = await getTrades()
      const all = (res.data || []).filter(t => t.verifier_address === wallet)
      setTrades(all.filter(t => t.state === 'DELIVERED'))
      setHistory(all.filter(t => t.state === 'RELEASED'))
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load trades')
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  const displayed = tab === 'pending' ? trades : history

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <p className="section-label mb-1">Verifier Dashboard</p>
        <h1 className="page-title">Delivery Queue</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 stagger">
        <div className="card !p-4">
          <p className="text-3xl font-display font-700 text-amber-600 mb-0.5">{trades.length}</p>
          <p className="text-xs text-stone-400">Pending Confirmation</p>
        </div>
        <div className="card !p-4">
          <p className="text-3xl font-display font-700 text-leaf mb-0.5">{history.length}</p>
          <p className="text-xs text-stone-400">Confirmed All-Time</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {[{ key: 'pending', label: `Pending (${trades.length})` }, { key: 'history', label: `Confirmed (${history.length})` }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-display font-600 transition-colors ${
              tab === t.key ? 'bg-soil text-white' : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 border-2 border-stone-200 border-t-leaf rounded-full animate-spin" />
        </div>
      )}

      {error && <div className="card !bg-red-50 !border-red-100 text-red-700 text-sm">{error}</div>}

      {!loading && !error && displayed.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="text-3xl mb-3">{tab === 'pending' ? '✅' : '📋'}</div>
          <p className="font-display font-600 text-stone-600 mb-1">
            {tab === 'pending' ? 'No pending deliveries' : 'No confirmed deliveries yet'}
          </p>
          <p className="text-sm text-stone-400">
            {tab === 'pending' ? 'Check back when farmers mark deliveries as ready.' : 'Confirmed trades will appear here.'}
          </p>
        </div>
      )}

      {!loading && displayed.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {tab === 'pending'
            ? displayed.map(t => <PendingCard key={t.trade_id} trade={t} onRefresh={fetchTrades} />)
            : displayed.map(t => (
                <div key={t.trade_id} className="card opacity-80">
                  <span className="badge badge-released mb-2">Released</span>
                  <p className="font-display font-600 text-soil">{t.crop_type}</p>
                  <p className="text-xs text-stone-400 mt-1">{t.quantity_kg?.toLocaleString('en-IN')} kg · {t.total_amount_algo} ALGO</p>
                  <p className="text-xs text-stone-400 mt-0.5">Farmer: {truncateAddress(t.farmer_address)}</p>
                </div>
              ))
          }
        </div>
      )}
    </div>
  )
}
