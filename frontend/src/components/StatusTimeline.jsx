import React from 'react'
import { TIMELINE_STEPS, ERROR_STATES } from '../services/constants.js'

const STEP_LABEL = { CREATED: 'Created', FUNDED: 'Funded', DELIVERED: 'Delivered', RELEASED: 'Released' }
const STEP_ICON  = { CREATED: '📄', FUNDED: '🔒', DELIVERED: '📦', RELEASED: '✅' }

function Check() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 7.5l3 3 7-7" />
    </svg>
  )
}

/** compact — tiny dot row for TradeCard. full — labelled step bar. */
export default function StatusTimeline({ state, compact = false }) {
  const idx     = TIMELINE_STEPS.indexOf(state)
  const isError = ERROR_STATES.includes(state)

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {TIMELINE_STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div className={`w-2 h-2 rounded-full transition-colors ${
              i < idx || state === 'RELEASED' ? 'bg-leaf' :
              i === idx && !isError ? 'bg-sky animate-pulse-soft' :
              i === idx && isError  ? 'bg-red-400' :
              'bg-stone-200'
            }`} />
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-px w-5 ${i < idx ? 'bg-leaf/40' : 'bg-stone-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Error/special state banner */}
      {isError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          Status: <strong>{state}</strong>
          {state === 'DISPUTED'  && ' — Dispute raised. Awaiting validator vote.'}
          {state === 'EXPIRED'   && ' — Deadline passed. Buyer may claim refund.'}
          {state === 'CANCELLED' && ' — Trade cancelled before funding.'}
        </div>
      )}

      {/* Step row */}
      <div className="flex items-start">
        {TIMELINE_STEPS.map((step, i) => {
          const done    = i < idx || state === 'RELEASED'
          const current = i === idx && !isError
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                {/* Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-300 ${
                  done    ? 'bg-leaf text-white shadow-glow-leaf' :
                  current ? 'bg-sky text-white ring-4 ring-sky/20' :
                            'bg-stone-100 text-stone-400'
                }`}>
                  {done ? <Check /> : <span>{STEP_ICON[step]}</span>}
                </div>
                {/* Label */}
                <p className={`text-xs font-semibold font-display ${
                  done ? 'text-leaf' : current ? 'text-sky' : 'text-stone-400'
                }`}>
                  {STEP_LABEL[step]}
                </p>
              </div>

              {/* Connector */}
              {i < TIMELINE_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mt-5 mx-1.5 rounded-full transition-colors duration-500"
                  style={{ background: done ? 'rgba(45,106,79,0.5)' : '#EDE9E3' }} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
