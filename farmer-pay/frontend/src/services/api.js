import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('fp_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auth
export const verifyWallet = (address, role) =>
  http.post('/api/auth/verify-wallet', { wallet_address: address, ...(role && { role }) }).then(r => r.data)

// Users
export const createUser = (data) =>
  http.post('/api/users', data).then(r => r.data)

export const getUser = (address) =>
  http.get(`/api/users/${address}`).then(r => r.data)

// Trades
export const createTrade = (data) =>
  http.post('/api/trades', data).then(r => r.data)

export const getTrades = () =>
  http.get('/api/trades').then(r => r.data)

export const getTrade = (tradeId) =>
  http.get(`/api/trades/${tradeId}`).then(r => r.data)

export const getTradeStatus = (tradeId) =>
  http.get(`/api/trades/${tradeId}/status`).then(r => r.data)

export const getPendingVerification = () =>
  http.get('/api/trades/pending-verification').then(r => r.data)

// Trade actions — return unsigned txn bytes
export const buildFundTxn     = (tradeId) => http.post(`/api/trades/${tradeId}/fund`).then(r => r.data)
export const buildConfirmTxn  = (tradeId) => http.post(`/api/trades/${tradeId}/confirm`).then(r => r.data)
export const buildDisputeTxn  = (tradeId) => http.post(`/api/trades/${tradeId}/dispute`).then(r => r.data)
export const buildRefundTxn   = (tradeId) => http.post(`/api/trades/${tradeId}/refund`).then(r => r.data)
export const submitSignedTxn  = (tradeId, signedTxnBase64) =>
  http.post(`/api/trades/${tradeId}/submit-txn`, { signed_txn: signedTxnBase64 }).then(r => r.data)

// Delivery
export const markDelivered = (tradeId, formData) =>
  http.post(`/api/trades/${tradeId}/deliver`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

// Verifiers (admin)
export const getVerifiers   = ()                   => http.get('/api/verifiers').then(r => r.data)
export const addVerifier    = (address, name)      => http.post('/api/verifiers', { wallet_address: address, name }).then(r => r.data)
export const removeVerifier = (address)            => http.delete(`/api/verifiers/${address}`).then(r => r.data)
