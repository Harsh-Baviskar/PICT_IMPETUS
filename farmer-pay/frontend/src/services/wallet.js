/**
 * wallet.js — thin wrapper around @perawallet/connect
 *
 * All functions are async. signTransaction / signTransactionGroup return
 * base64-encoded signed bytes ready for POST /api/trades/:id/submit-txn.
 */

let _pera = null

async function getPera() {
  if (_pera) return _pera
  const { PeraWalletConnect } = await import('@perawallet/connect')
  _pera = new PeraWalletConnect({ shouldShowSignTxnToast: true })
  return _pera
}

/** Connect wallet. Returns first account address string. */
export async function connectWallet() {
  const pera = await getPera()
  const accounts = await pera.connect()
  return accounts[0]
}

/** Disconnect. */
export async function disconnectWallet() {
  const pera = await getPera()
  pera.disconnect()
  _pera = null
}

/** Try to reconnect an existing session. Returns address or null. */
export async function reconnectWallet() {
  try {
    const pera = await getPera()
    const accounts = await pera.reconnectSession()
    return accounts?.[0] ?? null
  } catch {
    return null
  }
}

/**
 * Sign a single unsigned txn.
 * @param {string} base64UnsignedTxn — base64 string from backend
 * @returns {string} base64 signed bytes
 */
export async function signTransaction(base64UnsignedTxn) {
  const pera    = await getPera()
  const algosdk = await import('algosdk')
  const txn     = algosdk.decodeUnsignedTransaction(Buffer.from(base64UnsignedTxn, 'base64'))
  const signed  = await pera.signTransaction([[{ txn }]])
  return Buffer.from(signed[0]).toString('base64')
}

/**
 * Sign an atomic group (e.g. payment + app call for fund_escrow).
 * @param {string[]} base64Array — array of base64 unsigned txn strings
 * @returns {string[]} array of base64 signed txn strings
 */
export async function signTransactionGroup(base64Array) {
  const pera    = await getPera()
  const algosdk = await import('algosdk')
  const group   = base64Array.map(b64 => ({
    txn: algosdk.decodeUnsignedTransaction(Buffer.from(b64, 'base64')),
  }))
  const signed = await pera.signTransaction([group])
  return signed.map(s => Buffer.from(s).toString('base64'))
}
