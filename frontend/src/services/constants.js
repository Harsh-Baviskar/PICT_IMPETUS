// ─── Trade State Machine ──────────────────────────────────────────────────────
export const TRADE_STATE = {
  CREATED:   'CREATED',
  FUNDED:    'FUNDED',
  DELIVERED: 'DELIVERED',
  RELEASED:  'RELEASED',
  DISPUTED:  'DISPUTED',
  EXPIRED:   'EXPIRED',
  CANCELLED: 'CANCELLED',
}

// Ordered happy-path steps for the StatusTimeline
export const TIMELINE_STEPS  = ['CREATED', 'FUNDED', 'DELIVERED', 'RELEASED']
export const ERROR_STATES     = ['DISPUTED', 'EXPIRED', 'CANCELLED']
export const TERMINAL_STATES  = ['RELEASED', 'EXPIRED', 'CANCELLED']

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  FARMER:   'farmer',
  BUYER:    'buyer',
  VERIFIER: 'verifier',
  ADMIN:    'admin',
}

export const ROLE_LABELS = {
  farmer:   'Farmer',
  buyer:    'Buyer',
  verifier: 'Verifier',
  admin:    'Admin',
}

// ─── Crop Types ───────────────────────────────────────────────────────────────
export const CROP_TYPES = [
  'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize',
  'Soybean', 'Groundnut', 'Mustard', 'Barley', 'Jowar', 'Bajra', 'Other',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Shorten an Algorand address for display: ABCDEF...WXYZ */
export const truncateAddress = (addr, h = 6, t = 4) =>
  addr ? `${addr.slice(0, h)}...${addr.slice(-t)}` : ''

/** microALGO → ALGO string, trailing zeros removed */
export const microToAlgo = (micro) =>
  (Number(micro) / 1_000_000).toFixed(6).replace(/\.?0+$/, '')

/** ALGO → microALGO integer */
export const algoToMicro = (algo) => Math.round(Number(algo) * 1_000_000)

/** Format a date/timestamp to a readable locale string */
export const formatDate = (ts) => {
  if (!ts) return '—'
  const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Return the CSS badge class for a given trade state string */
export const stateBadgeClass = (state) => ({
  CREATED:   'badge-created',
  FUNDED:    'badge-funded',
  DELIVERED: 'badge-delivered',
  RELEASED:  'badge-released',
  DISPUTED:  'badge-disputed',
  EXPIRED:   'badge-expired',
  CANCELLED: 'badge-cancelled',
}[state] ?? 'badge-created')

// ─── Algorand TestNet Explorer URLs ──────────────────────────────────────────
export const explorerTxUrl   = (txid)  => `https://testnet.algoexplorer.io/tx/${txid}`
export const explorerAppUrl  = (appId) => `https://testnet.algoexplorer.io/application/${appId}`
export const explorerAddrUrl = (addr)  => `https://testnet.algoexplorer.io/address/${addr}`
