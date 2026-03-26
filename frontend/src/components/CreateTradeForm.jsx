import React, { useState } from 'react'
import { createTrade } from '../services/api.js'
import { CROP_TYPES } from '../services/constants.js'

const FIELD = ({ label, children, error }) => (
  <div>
    <label className="input-label">{label}</label>
    {children}
    {error && <p className="input-error">{error}</p>}
  </div>
)

export default function CreateTradeForm({ onSuccess }) {
  const [form, setForm] = useState({
    farmer_address:    '',
    verifier_address:  '',
    crop_type:         'Wheat',
    quantity_kg:       '',
    price_per_kg:      '',
    delivery_deadline: '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [apiErr,  setApiErr]  = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Derived total
  const total = form.quantity_kg && form.price_per_kg
    ? (Number(form.quantity_kg) * Number(form.price_per_kg)).toFixed(4)
    : null

  function validate() {
    const e = {}
    if (!form.farmer_address.trim())    e.farmer_address   = 'Farmer wallet address is required'
    if (!form.verifier_address.trim())  e.verifier_address = 'Verifier wallet address is required'
    if (!form.quantity_kg || Number(form.quantity_kg) <= 0) e.quantity_kg = 'Enter a valid quantity'
    if (!form.price_per_kg || Number(form.price_per_kg) <= 0) e.price_per_kg = 'Enter a valid price'
    if (!form.delivery_deadline) e.delivery_deadline = 'Deadline is required'
    else if (new Date(form.delivery_deadline) <= new Date()) e.delivery_deadline = 'Deadline must be in the future'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setApiErr(null)
    setLoading(true)
    try {
      const res = await createTrade(form)
      onSuccess?.(res.data)
    } catch (err) {
      setApiErr(err?.response?.data?.error || 'Failed to create trade. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Crop + Quantity row */}
      <div className="grid grid-cols-2 gap-4">
        <FIELD label="Crop Type">
          <select className="input" value={form.crop_type} onChange={e => set('crop_type', e.target.value)}>
            {CROP_TYPES.map(c => <option key={c}>{c}</option>)}
          </select>
        </FIELD>
        <FIELD label="Quantity (kg)" error={errors.quantity_kg}>
          <input className="input" type="number" min="1" placeholder="e.g. 500"
            value={form.quantity_kg} onChange={e => set('quantity_kg', e.target.value)} />
        </FIELD>
      </div>

      {/* Price + Total row */}
      <div className="grid grid-cols-2 gap-4">
        <FIELD label="Price per kg (ALGO)" error={errors.price_per_kg}>
          <input className="input" type="number" min="0.000001" step="0.000001" placeholder="e.g. 2"
            value={form.price_per_kg} onChange={e => set('price_per_kg', e.target.value)} />
        </FIELD>
        <div>
          <label className="input-label">Total Escrow</label>
          <div className="input bg-stone-50 text-stone-500 flex items-center">
            {total
              ? <><span className="font-display font-bold text-soil">{total}</span><span className="ml-1 text-stone-400 text-xs">ALGO</span></>
              : <span className="text-stone-300">auto-calculated</span>
            }
          </div>
        </div>
      </div>

      {/* Farmer address */}
      <FIELD label="Farmer Wallet Address" error={errors.farmer_address}>
        <input className="input font-mono text-xs" placeholder="ABCDE…" maxLength={58}
          value={form.farmer_address} onChange={e => set('farmer_address', e.target.value)} />
      </FIELD>

      {/* Verifier address */}
      <FIELD label="Verifier Wallet Address" error={errors.verifier_address}>
        <input className="input font-mono text-xs" placeholder="ABCDE…" maxLength={58}
          value={form.verifier_address} onChange={e => set('verifier_address', e.target.value)} />
      </FIELD>

      {/* Deadline */}
      <FIELD label="Delivery Deadline" error={errors.delivery_deadline}>
        <input className="input" type="datetime-local"
          min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
          value={form.delivery_deadline} onChange={e => set('delivery_deadline', e.target.value)} />
      </FIELD>

      {apiErr && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          {apiErr}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
        {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
        {loading ? 'Creating trade…' : 'Create Trade'}
      </button>
    </form>
  )
}
