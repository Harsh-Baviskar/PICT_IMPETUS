import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusTimeline from './StatusTimeline.jsx'
import { useAuth } from '../App.jsx'
import { buildFundTxn, markDelivered, submitSignedTxn } from '../services/api.js'
import { signTransaction } from '../services/wallet.js'
import {
  stateBadgeClass, truncateAddress, formatDate, explorerAppUrl,
} from '../services/constants.js'

// ── Compact quick-action strip (fund / deliver) ───────────────────────────────
function QuickAction({ trade, viewerRole, onRefresh }) {
  const { wallet } = useAuth()
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState(null)

  const s           = trade.state
  const canFund     = viewerRole === 'buyer'  && s === 'CREATED'   && wallet === trade.buyer_address
  const canDeliver  = viewerRole === 'farmer' && s === 'FUNDED'    && wallet === trade.farmer_address

  if (!canFund && !canDeliver) return null
  if (done) return <p className="text-xs text-leaf pt-2 border-t border-stone-50">✓ Done — refreshing…</p>

  async function handleFund(e) {
    e.stopPropagation()
    setLoading(true); setError(null)
    try {
      const res = await buildFundTxn(trade.trade_id)
      if (!res.data?.unsigned_txn) {
        // Day 3 stub — send user to detail page to see the message
        setError('Open trade detail to fund (Day 3)')
        return
      }
      const signed = await signTransaction(res.data.unsigned_txn)
      await submitSignedTxn(trade.trade_id, signed)
      setDone(true); setTimeout(onRefresh, 800)
    } catch (err) { setError(err?.response?.data?.error || err.message) }
    finally { setLoading(false) }
  }

  async function handleDeliver(e) {
    e.stopPropagation()
    setLoading(true); setError(null)
    try {
      await markDelivered(trade.trade_id, new FormData())
      setDone(true); setTimeout(onRefresh, 800)
    } catch (err) { setError(err?.response?.data?.error || err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="pt-3 border-t border-stone-50" onClick={e => e.stopPropagation()}>
      {error && <p className="text-xs text-amber-600 mb-1.5 leading-snug">{error}</p>}
      {canFund && (
        <button
          onClick={handleFund}
          disabled={loading}
          className="btn-primary btn-sm w-full"
        >
          {loading
            ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
            : '🔒'
          }
          {loading ? 'Signing…' : 'Fund Escrow'}
        </button>
      )}
      {canDeliver && (
        <button
          onClick={handleDeliver}
          disabled={loading}
          className="btn-grain btn-sm w-full"
        >
          {loading
            ? <span className="w-3 h-3 border border-soil/30 border-t-soil rounded-full animate-spin" />
            : '📦'
          }
          {loading ? 'Submitting…' : 'Mark Delivered'}
        </button>
      )}
    </div>
  )
}

// ── TradeCard ─────────────────────────────────────────────────────────────────
export default function TradeCard({ trade, viewerRole, onRefresh }) {
  const navigate = useNavigate()
  const isExpired = new Date(trade.delivery_deadline) < new Date()
    && !['RELEASED', 'CANCELLED', 'EXPIRED'].includes(trade.state)

  return (
    <div
      className="card-hover flex flex-col gap-3 cursor-pointer"
      onClick={() => navigate(`/trade/${trade.trade_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/trade/${trade.trade_id}`)}
    >
      {/* ── Top row ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display font-700 text-soil leading-tight truncate">{trade.crop_type}</p>
          <p className="text-xs text-stone-400 mt-0.5 font-mono">{trade.trade_id.slice(0, 8)}…</p>
        </div>
        <span className={`badge ${stateBadgeClass(trade.state)} flex-shrink-0`}>
          {trade.state}
        </span>
      </div>

      {/* ── Amount ──────────────────────────────────────── */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-display font-700 text-3xl text-soil leading-none">
          {Number(trade.total_amount_algo).toLocaleString('en-IN', { maximumFractionDigits: 4 })}
        </span>
        <span className="text-xs text-stone-400">ALGO</span>
        <span className="text-xs text-stone-300 mx-0.5">·</span>
        <span className="text-xs text-stone-400">{trade.quantity_kg?.toLocaleString('en-IN')} kg</span>
      </div>

      {/* ── Timeline ────────────────────────────────────── */}
      <StatusTimeline state={trade.state} compact />

      {/* ── Meta rows ───────────────────────────────────── */}
      <div className="space-y-1.5 text-xs">
        {viewerRole === 'buyer' && trade.farmer_address && (
          <div className="flex justify-between">
            <span className="text-stone-400">Farmer</span>
            <span className="wallet-address">{truncateAddress(trade.farmer_address)}</span>
          </div>
        )}
        {(viewerRole === 'farmer' || viewerRole === 'verifier') && trade.buyer_address && (
          <div className="flex justify-between">
            <span className="text-stone-400">Buyer</span>
            <span className="wallet-address">{truncateAddress(trade.buyer_address)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-stone-400">Deadline</span>
          <span className={isExpired ? 'text-red-500 font-medium' : 'text-stone-600'}>
            {isExpired ? '⏰ ' : ''}{formatDate(trade.delivery_deadline)}
          </span>
        </div>
        {trade.app_id && (
          <div className="flex justify-between">
            <span className="text-stone-400">Contract</span>
            <a
              href={explorerAppUrl(trade.app_id)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-sky hover:underline font-mono"
            >
              #{trade.app_id} ↗
            </a>
          </div>
        )}
        {trade.delivery_proof_ipfs && (
          <div className="flex justify-between">
            <span className="text-stone-400">Proof</span>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${trade.delivery_proof_ipfs}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-sky hover:underline"
            >
              IPFS ↗
            </a>
          </div>
        )}
      </div>

      {/* ── Quick action ────────────────────────────────── */}
      <QuickAction trade={trade} viewerRole={viewerRole} onRefresh={onRefresh} />
    </div>
  )
}
