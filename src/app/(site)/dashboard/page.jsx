import Dashboard from '../../../views/Dashboard.jsx'

export const metadata = {
  title: 'Restaurant Dashboard | MenuLink',
  description: 'Manage your restaurant menu, dishes, categories, and table QR code.',
}

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Dashboard />
    </div>
  )
}
