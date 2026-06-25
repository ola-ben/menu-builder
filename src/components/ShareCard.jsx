import { QRCodeCanvas } from 'qrcode.react'
import Icon from './Icon.jsx'

/** Shows the public menu link with copy + open + a scannable QR code for tables. */
export default function ShareCard({ menuUrl, onCopy, onDownloadQr, disabled }) {
  return (
    <div className="card relative overflow-hidden p-6">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-400/15 blur-3xl" />
      <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-slate-900 dark:text-white">
        <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-600" />
        Your table QR &amp; link
      </h2>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Print the QR code for your tables, or share the link on WhatsApp & Instagram.
      </p>

      {disabled ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          Add your restaurant name and WhatsApp number first to share your menu.
        </p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
          <div id="menu-qr" className="grid shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-3 shadow-soft ring-4 ring-brand-500/5 dark:border-slate-700">
            <QRCodeCanvas value={menuUrl} size={140} level="M" includeMargin />
          </div>

          <div className="flex w-full flex-col justify-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40">
              <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate text-sm text-slate-600 dark:text-slate-300">{menuUrl}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onCopy} className="btn-primary flex-1">
                <Icon d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" className="h-4 w-4" />
                Copy link
              </button>
              <button type="button" onClick={onDownloadQr} className="btn-ghost flex-1">
                <Icon d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" className="h-4 w-4" />
                Save QR
              </button>
              <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">
                <Icon d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" className="h-4 w-4" />
                View
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
