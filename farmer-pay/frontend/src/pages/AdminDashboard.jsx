import React, { useState, useEffect, useCallback } from 'react'
import { getVerifiers, addVerifier, removeVerifier } from '../services/api.js'
import { truncateAddress } from '../services/constants.js'

export default function AdminDashboard() {
  const [verifiers, setVerifiers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [newAddr,   setNewAddr]   = useState('')
  const [newName,   setNewName]   = useState('')
  const [adding,    setAdding]    = useState(false)
  const [addError,  setAddError]  = useState(null)

  const fetchVerifiers = useCallback(async () => {
    try {
      setError(null)
      const res = await getVerifiers()
      setVerifiers(res.data || [])
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load verifiers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVerifiers() }, [fetchVerifiers])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newAddr.trim()) return
    setAdding(true)
    setAddError(null)
    try {
      await addVerifier(newAddr.trim(), newName.trim())
      setNewAddr('')
      setNewName('')
      await fetchVerifiers()
    } catch (err) {
      setAddError(err?.response?.data?.error || 'Failed to add verifier')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(address) {
    if (!window.confirm(`Remove verifier ${truncateAddress(address)}?`)) return
    try {
      await removeVerifier(address)
      await fetchVerifiers()
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to remove verifier')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">

      <div>
        <p className="section-label mb-1">Admin Dashboard</p>
        <h1 className="page-title">Verifier Whitelist</h1>
        <p className="text-sm text-stone-500 mt-1">
          Only whitelisted addresses can confirm crop deliveries on-chain.
        </p>
      </div>

      {/* ── Add verifier form ─────────────────────────────────── */}
      <div className="card">
        <h2 className="font-display font-600 text-soil mb-4">Add Verifier</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="input-label">Algorand Wallet Address</label>
            <input
              className="input font-mono text-xs"
              placeholder="ABCDEF1234..."
              value={newAddr}
              onChange={e => setNewAddr(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="input-label">Name / Organisation (optional)</label>
            <input
              className="input"
              placeholder="e.g. Punjab Grain Warehouse"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
          </div>
          {addError && <p className="input-error">{addError}</p>}
          <button type="submit" disabled={adding || !newAddr.trim()} className="btn-primary w-full">
            {adding
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : '+'
            }
            {adding ? 'Adding…' : 'Add to Whitelist'}
          </button>
        </form>
      </div>

      {/* ── Verifier list ─────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-600 text-soil">Whitelisted Verifiers</h2>
          <span className="badge badge-released">{verifiers.length} total</span>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <span className="w-5 h-5 border-2 border-stone-200 border-t-leaf rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!loading && verifiers.length === 0 && (
          <p className="text-sm text-stone-400 py-4 text-center">No verifiers whitelisted yet.</p>
        )}

        {!loading && verifiers.length > 0 && (
          <div className="divide-y divide-stone-50">
            {verifiers.map(v => (
              <div key={v.wallet_address} className="flex items-center justify-between py-3 gap-3">
                <div>
                  <p className="font-display font-600 text-sm text-stone-700">
                    {v.name || 'Unnamed Verifier'}
                  </p>
                  <p className="wallet-address mt-1 inline-block">{truncateAddress(v.wallet_address, 10, 6)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {v.trades_completed > 0 && (
                    <span className="text-xs text-stone-400">{v.trades_completed} confirmed</span>
                  )}
                  <button
                    onClick={() => handleRemove(v.wallet_address)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Info box ──────────────────────────────────────────── */}
      <div className="rounded-xl bg-stone-100 border border-stone-200 p-4 text-xs text-stone-500 space-y-1">
        <p className="font-display font-600 text-stone-600">How verifiers work</p>
        <p>A verifier address must be added here before it can be selected when creating a trade.</p>
        <p>Only the designated verifier for a trade can call <code className="font-mono bg-white px-1 rounded">confirm_delivery()</code> on that contract.</p>
        <p>Removing a verifier does not affect active trades — it only prevents new trades from using that address.</p>
      </div>
    </div>
  )
}
