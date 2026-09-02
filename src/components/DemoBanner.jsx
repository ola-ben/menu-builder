import { useState } from 'react'
import Icon from './Icon.jsx'
import { seedMockData, clearMockData } from '../utils/mockData.js'

export default function DemoBanner() {
  const isSimulated = localStorage.getItem('qr-menu:simulated_login') === 'true'

  const handleSeed = () => {
    seedMockData()
    window.location.reload()
  }

  const handleClear = () => {
    clearMockData()
    window.location.reload()
  }

  return (
    <div className={`mb-6 border p-4 text-sm rounded-2xl transition-all duration-300 ${
      isSimulated 
        ? 'border-green-500/20 bg-green-500/[0.04] text-green-800 dark:text-green-300' 
        : 'border-brand-500/20 bg-brand-500/[0.04] text-slate-800 dark:text-slate-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0">
            {isSimulated ? (
              <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="h-5 w-5 text-green-600 dark:text-green-400" strokeWidth={2} />
            ) : (
              <Icon d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" className="h-5 w-5 text-brand-600 dark:text-brand-400" strokeWidth={2} />
            )}
          </span>
          <div>
            <p className="font-semibold leading-tight">
              {isSimulated ? 'Simulation Mode Active' : 'Visualize Completed Site'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isSimulated 
                ? 'You are viewing simulated restaurant data, mock categories, items, and active orders. Your account status is mocked as "backed up / logged in".'
                : 'Instantly populate your dashboard with a mock restaurant, categorized dishes, pending orders, and a simulated logged-in backup status.'}
            </p>
          </div>
        </div>
        
        <div className="shrink-0 flex items-center gap-2">
          {isSimulated ? (
            <button
              type="button"
              onClick={handleClear}
              className="btn-ghost py-1.5 px-4 text-xs font-semibold uppercase tracking-wider text-rose-500 border-rose-500/20 hover:border-rose-500 hover:bg-rose-500/[0.04] rounded-xl"
            >
              Clear Demo Data
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSeed}
              className="btn-primary py-1.5 px-4 text-xs font-semibold uppercase tracking-wider bg-brand-600 text-white rounded-xl"
            >
              Load Demo Data
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
