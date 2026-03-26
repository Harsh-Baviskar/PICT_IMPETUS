import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import {
  getTrade, getTradeStatus,
  buildFundTxn, buildConfirmTxn, buildDisputeTxn, buildRefundTxn,
  submitSignedTxn, markDelivered,
} from '../services/api.js'
import { signTransaction } from '../services/wallet.js'
import StatusTimeline from '../components/StatusTimeline.jsx'
import DisputePanel from '../components/DisputePanel.jsx'
import {
  truncateAddress, formatDate, stateBadgeClass,
  explorerTxUrl, explorerAppUrl, explorerAddrUrl,
} from '../services/constants.js'

// ── Action button with sign-submit flow ───────────────────────────────────────
function ActionButton({ label, icon, buildFn, tradeId, onDone, variant = 'primary', disabled = false }) {
  const [loading, setLoading] = useState(false)
  const [txid,    setTxid]    = useState(null)
  const [error,   setError]   = useState(null)

  async function handle() {
    setLoading(true)
    setError(null)
    try {
      const res = await buildFn(tradeId)
      if (!res.data?.unsigned_txn) {
        setError(res.data?.message || 'This action is not yet connected to the blockchain (Day 3 TODO)')
        return
      }
      const signed   = await signTransaction(res.data.unsigned_txn)
      const submit   = await submitSignedTxn(tradeId, signed)
      setTxid(submit.data?.txid || 'submitted')
      onDone()
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  if (txid) {
    return (
      <div className="text-sm text-leaf font-body">
        ✓ Done!{' '}
        {txid !== 'submitted' && (
          <a href={explorerTxUrl(txid)} target="_blank" rel="noopener noreferrer" className="underline text-sky">
            View on Explorer ↗
          </a>
        )}
      </div>
    )
  }

  const cls = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    outline:   'btn-outline',
    grain:     'btn-grain',
  }[variant] || 'btn-primary'

  return (
    <div>
      <button onClick={handle} disabled={loading || disabled} className={`${cls} w-full`}>
        {loading
          ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : icon
        }
        {loading ? 'Signing…' : label}
      </button>
      {error && <p className="text-xs text-amber-600 mt-1 leading-snug">{error}</p>}
    </div>
  )
}

// ── Delivery upload ────────────────────────────────────────────────────────────
function DeliveryUpload({ tradeId, onDone }) {
  const [file,    setFile]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [done,    setDone]    = useState(false)
  const inputRef = useRef()

  async function handle() {
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      if (file) form.append('proof', file)
      await markDelivered(tradeId, form)
      setDone(true)
      onDone()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to mark delivery')
    } finally {
      setLoading(false)
    }
  }

  if (done) return <p className="text-sm text-leaf">✓ Marked as delivered!</p>

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-leaf hover:bg-leaf/5 transition-colors"
      >
        <p className="text-2xl mb-1">📷</p>
        <p className="text-sm text-stone-500">
          {file ? file.name : 'Click to attach proof photo (optional)'}
        </p>
        <p className="text-xs text-stone-400 mt-1">Stored on IPFS · max 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => setFile(e.target.files[0] || null)}
        />
      </div>
      {error && <p className="input-error">{error}</p>}
      <button onClick={handle} disabled={loading} className="btn-grain w-full">
        {loading
          ? <span className="w-4 h-4 border-2 border-soil/30 border-t-soil rounded-full animate-spin" />
          : '📦'
        }
        {loading ? 'Submitting…' : 'Mark as Delivered'}
      </button>
    </div>
  )
}

// ── Info row helper ────────────────────────────────────────────────────────────
function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-stone-50 last:border-0">
      <span className="text-xs text-stone-400 flex-shrink-0 pt-0.5">{label}</span>
      <div className="text-sm text-stone-700 text-right">{children}</div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TradeDetail() {
  const { tradeId }        = useParams()
  const { wallet, role }   = useAuth()
  const navigate           = useNavigate()
  const [trade,   setTrade]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const pollRef              = useRef(null)

  const fetchTrade = useCallback(async () => {
    try {
      const res = await getTrade(tradeId)
      setTrade(res.data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Trade not found')
    } finally {
      setLoading(false)
    }
  }, [tradeId])

  useEffect(() => {
    fetchTrade()
    // Poll for state changes every 5 s
    pollRef.current = setInterval(async () => {
      try {
        const res = await getTradeStatus(tradeId)
        setTrade(prev => prev ? { ...prev, state: res.data.state } : prev)
      } catch { /* silent */ }
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [fetchTrade, tradeId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 border-2 border-stone-200 border-t-leaf rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !trade) {
    return (
      <div className="card !bg-red-50 !border-red-100 max-w-md mx-auto mt-12 text-center">
        <p className="text-red-700 font-display font-600 mb-2">Trade not found</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary btn-sm">← Go back</button>
      </div>
    )
  }

  const isBuyer    = wallet === trade.buyer_address
  const isFarmer   = wallet === trade.farmer_address
  const isVerifier = wallet === trade.verifier_address
  const s          = trade.state

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* ── Back + header ─────────────────────────────────────── */}
      <div>
        <button onClick={() => navigate(-1)} className="text-xs text-stone-400 hover:text-stone-600 mb-4 flex items-center gap-1">
          ← Back
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="section-label mb-1">Trade Detail</p>
            <h1 className="page-title">{trade.crop_type}</h1>
          </div>
          <span className={`badge ${stateBadgeClass(s)} text-sm px-3 py-1`}>{s}</span>
        </div>
      </div>

      {/* ── Timeline ──────────────────────────────────────────── */}
      <div className="card">
        <StatusTimeline state={s} />
      </div>

      {/* ── Trade details ─────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-display font-600 text-soil mb-1">Trade Details</h2>
        <p className="text-xs text-stone-400 font-mono mb-4">{trade.trade_id}</p>

        <Row label="Crop type">{trade.crop_type}</Row>
        <Row label="Quantity">{trade.quantity_kg?.toLocaleString('en-IN')} kg</Row>
        <Row label="Price per kg">{trade.price_per_kg} ALGO</Row>
        <Row label="Total escrow amount">
          <span className="font-display font-700 text-soil text-base">{trade.total_amount_algo} ALGO</span>
        </Row>
        <Row label="Delivery deadline">
          <span className={new Date(trade.delivery_deadline) < new Date() && !['RELEASED','CANCELLED'].includes(s) ? 'text-red-500' : ''}>
            {formatDate(trade.delivery_deadline)}
          </span>
        </Row>
        <Row label="Created">{formatDate(trade.created_at)}</Row>
      </div>

      {/* ── Parties ───────────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-display font-600 text-soil mb-4">Parties</h2>
        {[
          { label: 'Buyer',    addr: trade.buyer_address,    highlight: isBuyer },
          { label: 'Farmer',   addr: trade.farmer_address,   highlight: isFarmer },
          { label: 'Verifier', addr: trade.verifier_address, highlight: isVerifier },
        ].map(({ label, addr, highlight }) => (
          <div key={label} className="flex items-center justify-between py-2.5 border-b border-stone-50 last:border-0">
            <span className="text-xs text-stone-400">
              {label}
              {highlight && <span className="ml-1.5 text-leaf text-xs">← you</span>}
            </span>
            <a
              href={explorerAddrUrl(addr)}
              target="_blank"
              rel="noopener noreferrer"
              className="wallet-address hover:text-sky transition-colors"
            >
              {truncateAddress(addr, 8, 6)}
            </a>
          </div>
        ))}
        {trade.app_id && (
          <div className="pt-3">
            <a
              href={explorerAppUrl(trade.app_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky hover:underline"
            >
              View smart contract on TestNet Explorer (App ID: {trade.app_id}) ↗
            </a>
          </div>
        )}
      </div>

      {/* ── Delivery proof ────────────────────────────────────── */}
      {trade.delivery_proof_ipfs && (
        <div className="card">
          <h2 className="font-display font-600 text-soil mb-3">Delivery Proof</h2>
          <img
            src={`https://gateway.pinata.cloud/ipfs/${trade.delivery_proof_ipfs}`}
            alt="Delivery proof"
            className="w-full rounded-xl object-cover max-h-64"
            onError={e => { e.target.style.display = 'none' }}
          />
          <a
            href={`https://gateway.pinata.cloud/ipfs/${trade.delivery_proof_ipfs}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky hover:underline mt-2 block"
          >
            View on IPFS ↗ {trade.delivery_proof_ipfs}
          </a>
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-display font-600 text-soil mb-4">Actions</h2>

        {/* BUYER actions */}
        {isBuyer && s === 'CREATED' && (
          <ActionButton label="Fund Escrow" icon="🔒" buildFn={buildFundTxn} tradeId={tradeId} onDone={fetchTrade} variant="primary" />
        )}
        {isBuyer && ['FUNDED','DELIVERED'].includes(s) && (
          <ActionButton label="Raise Dispute" icon="⚠️" buildFn={buildDisputeTxn} tradeId={tradeId} onDone={fetchTrade} variant="danger" />
        )}
        {isBuyer && s === 'FUNDED' && new Date(trade.delivery_deadline) < new Date() && (
          <div className="mt-3">
            <ActionButton label="Claim Refund (Deadline Passed)" icon="↩" buildFn={buildRefundTxn} tradeId={tradeId} onDone={fetchTrade} variant="outline" />
          </div>
        )}

        {/* FARMER actions */}
        {isFarmer && s === 'FUNDED' && (
          <DeliveryUpload tradeId={tradeId} onDone={fetchTrade} />
        )}

        {/* VERIFIER actions */}
        {isVerifier && s === 'DELIVERED' && (
          <ActionButton label="Confirm Delivery" icon="✓" buildFn={buildConfirmTxn} tradeId={tradeId} onDone={fetchTrade} variant="primary" />
        )}

        {/* Terminal / no-action states */}
        {['RELEASED','CANCELLED','EXPIRED'].includes(s) && (
          <p className="text-sm text-stone-400 py-2">
            {s === 'RELEASED'  && '✅ Payment released. This trade is complete.'}
            {s === 'CANCELLED' && '🚫 This trade was cancelled.'}
            {s === 'EXPIRED'   && '⏰ Deadline passed. Buyer may have claimed a refund.'}
          </p>
        )}

        {s === 'DISPUTED' && (
          <DisputePanel
            trade={trade}
            viewerRole={role}
            wallet={wallet}
            onRefresh={fetchTrade}
          />
        )}

        {!isBuyer && !isFarmer && !isVerifier && (
          <p className="text-sm text-stone-400">You are viewing this trade as a guest.</p>
        )}
      </div>
    </div>
  )
}
