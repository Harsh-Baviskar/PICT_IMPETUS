import React, { useState } from 'react'
import { submitSignedTxn } from '../services/api.js'
import { signTransaction } from '../services/wallet.js'
import { explorerTxUrl } from '../services/constants.js'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

/**
 * DisputePanel
 *
 * Shown on TradeDetail when trade.state === 'DISPUTED'.
 *
 * - Validators (whitelisted addresses) see two vote buttons.
 * - Buyer and Farmer see the current vote tally (read-only).
 * - The contract auto-resolves when a majority (2/3) is reached.
 */
export default function DisputePanel({ trade, viewerRole, wallet, onRefresh }) {
  const [voting,  setVoting]  = useState(null) // 'farmer' | 'buyer' | null
  const [txid,    setTxid]    = useState(null)
  const [error,   setError]   = useState(null)

  const isValidator = viewerRole === 'verifier' || viewerRole === 'admin'

  async function handleVote(inFavorOfFarmer) {
    setVoting(inFavorOfFarmer ? 'farmer' : 'buyer')
    setError(null)
    try {
      // Build unsigned vote_dispute txn from backend
      const token = localStorage.getItem('fp_token')
      const res = await axios.post(
        `${API_URL}/api/trades/${trade.trade_id}/vote-dispute`,
        { in_favor_of_farmer: inFavorOfFarmer },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.data?.data?.unsigned_txn) {
        setError(res.data?.data?.message || 'Vote txn not yet implemented (Day 3 TODO)')
        return
      }

      const signed = await signTransaction(res.data.data.unsigned_txn)
      const submit = await submitSignedTxn(trade.trade_id, signed)
      setTxid(submit.data?.txid || 'submitted')
      setTimeout(onRefresh, 1000)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Vote failed')
    } finally {
      setVoting(null)
    }
  }

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 overflow-hidden">
      {/* Header */}
      <div className="bg-red-600 px-5 py-3 flex items-center gap-2">
        <span className="text-white text-lg">⚠️</span>
        <div>
          <p className="font-display font-700 text-white text-sm">Dispute Raised</p>
          <p className="text-red-200 text-xs">This trade is under dispute — validator vote required</p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Explanation */}
        <p className="text-sm text-red-800">
          The buyer has raised a dispute. Three whitelisted validators will vote to decide
          whether the funds are released to the farmer or refunded to the buyer.
          The majority (2 out of 3 votes) decides the outcome.
        </p>

        {/* Vote tally — always visible */}
        {(trade.dispute_votes_farmer != null || trade.dispute_votes_buyer != null) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-red-100 p-3 text-center">
              <p className="text-2xl font-display font-700 text-leaf">{trade.dispute_votes_farmer ?? 0}</p>
              <p className="text-xs text-stone-500 mt-0.5">Votes for Farmer</p>
            </div>
            <div className="bg-white rounded-xl border border-red-100 p-3 text-center">
              <p className="text-2xl font-display font-700 text-sky">{trade.dispute_votes_buyer ?? 0}</p>
              <p className="text-xs text-stone-500 mt-0.5">Votes for Buyer</p>
            </div>
          </div>
        )}

        {/* Confirmed txid */}
        {txid && (
          <div className="bg-leaf/10 border border-leaf/20 rounded-xl px-4 py-3 text-sm text-leaf font-body">
            ✓ Vote submitted!{' '}
            {txid !== 'submitted' && (
              <a href={explorerTxUrl(txid)} target="_blank" rel="noopener noreferrer" className="underline">
                View on Explorer ↗
              </a>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-snug">
            {error}
          </p>
        )}

        {/* Validator vote buttons */}
        {isValidator && !txid && (
          <div className="space-y-2">
            <p className="text-xs font-display font-600 text-red-700 uppercase tracking-wider">Cast your vote</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVote(true)}
                disabled={voting !== null}
                className="btn btn-lg bg-leaf text-white hover:bg-leaf-600 active:scale-95 shadow-sm"
              >
                {voting === 'farmer'
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : '🌾'
                }
                {voting === 'farmer' ? 'Signing…' : 'Release to Farmer'}
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={voting !== null}
                className="btn btn-lg bg-sky text-white hover:bg-sky-500 active:scale-95 shadow-sm"
              >
                {voting === 'buyer'
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : '↩'
                }
                {voting === 'buyer' ? 'Signing…' : 'Refund Buyer'}
              </button>
            </div>
            <p className="text-xs text-red-400 text-center">Your vote will be recorded on-chain via Pera Wallet</p>
          </div>
        )}

        {/* Non-validator view */}
        {!isValidator && !txid && (
          <div className="text-sm text-red-700 bg-white rounded-xl border border-red-100 px-4 py-3">
            {viewerRole === 'buyer'  && '📋 You raised this dispute. Waiting for validator votes.'}
            {viewerRole === 'farmer' && '📋 A dispute was raised on this trade. Waiting for validator votes.'}
            {!viewerRole             && '📋 This trade is under dispute.'}
          </div>
        )}

        {/* Admin contact note */}
        <p className="text-xs text-stone-400">
          Need help? Contact the platform admin to add your address as a validator.
        </p>
      </div>
    </div>
  )
}
