import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-gradient">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">The page you’re looking for doesn’t exist.</p>
        <Link to="/" className="btn-primary mt-6">Back home</Link>
      </div>
    </div>
  )
}
