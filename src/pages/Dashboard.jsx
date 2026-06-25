import { useMemo, useState } from 'react'
import useMenu, { groupItemsByCategory } from '../hooks/useMenu.js'
import useToast from '../hooks/useToast.js'
import Toast from '../components/Toast.jsx'
import ImageUpload from '../components/ImageUpload.jsx'
import CategoryManager from '../components/CategoryManager.jsx'
import ItemForm from '../components/ItemForm.jsx'
import MenuItemCard from '../components/MenuItemCard.jsx'
import ShareCard from '../components/ShareCard.jsx'
import OrdersPanel from '../components/OrdersPanel.jsx'
import BillingBanner from '../components/BillingBanner.jsx'
import SectionNav from '../components/SectionNav.jsx'
import Icon from '../components/Icon.jsx'

// Sections the floating "jump to" menu links to (id must match the markup below).
const NAV_SECTIONS = [
  { id: 'orders', label: 'Orders', d: 'M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5' },
  { id: 'details', label: 'Restaurant', d: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75' },
  { id: 'categories', label: 'Categories', d: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z' },
  { id: 'share', label: 'Share QR', d: 'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z' },
  { id: 'add', label: 'Add item', d: 'M12 4.5v15m7.5-7.5h-15' },
  { id: 'items', label: 'Menu', d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
]

function downloadQrPng(filename) {
  const canvas = document.querySelector('#menu-qr canvas')
  if (!canvas) return false
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = filename
  link.click()
  return true
}

export default function Dashboard() {
  const {
    restaurant,
    updateRestaurant,
    addCategory,
    removeCategory,
    addItem,
    updateItem,
    removeItem,
  } = useMenu()
  const { toast, showToast } = useToast()
  const [editing, setEditing] = useState(null)

  const menuUrl = useMemo(
    () => `${window.location.origin}/menu/${restaurant.id}`,
    [restaurant.id],
  )
  const isShareReady = Boolean(restaurant.name.trim() && restaurant.whatsappNumber.trim())
  const groups = groupItemsByCategory(restaurant)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl)
      showToast('Menu link copied!', 'success')
    } catch {
      showToast('Could not copy — long-press the link.', 'error')
    }
  }

  const handleDownloadQr = () => {
    const ok = downloadQrPng(`${restaurant.name || 'menu'}-qr.png`)
    showToast(ok ? 'QR code saved 📥' : 'Could not save the QR code.', ok ? 'success' : 'error')
  }

  const handleAdd = (data) => {
    addItem(data)
    showToast('Item added 🎉', 'success')
  }

  const handleSaveEdit = (data) => {
    updateItem(editing.id, data)
    setEditing(null)
    showToast('Item updated', 'success')
  }

  const handleEdit = (item) => {
    setEditing(item)
    // Scroll to the edit form (mid-page), not the very top — offset for the navbar.
    const el = document.getElementById('add')
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleDelete = (item) => {
    removeItem(item.id)
    if (editing?.id === item.id) setEditing(null)
    showToast('Item removed', 'info')
  }

  return (
    <div className="space-y-8">
      <header>
        <span className="eyebrow">Dashboard</span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          My <span className="text-gradient">Menu</span>
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Set up your restaurant, build your menu, and share your table QR.
        </p>
      </header>

      {/* Floating section menu — jump to any part of the dashboard */}
      <SectionNav sections={NAV_SECTIONS} />

      {/* Plan status (trial countdown / paused) */}
      <BillingBanner menuId={restaurant.id} />

      {/* Orders */}
      <div id="orders" className="scroll-mt-24">
        <OrdersPanel menuId={restaurant.id} />
      </div>

      {/* Restaurant details */}
      <section id="details" className="card scroll-mt-24 p-6">
        <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-slate-900 dark:text-white">
          <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-600" />
          Restaurant details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageUpload value={restaurant.logoUrl} onChange={(v) => updateRestaurant({ logoUrl: v })} label="Logo" />
          </div>
          <div>
            <label htmlFor="r-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Restaurant name <span className="text-brand-600">*</span>
            </label>
            <input
              id="r-name"
              className="input-base"
              placeholder="e.g. Mama Nkechi’s Kitchen"
              value={restaurant.name}
              onChange={(e) => updateRestaurant({ name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="r-wa" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              WhatsApp number <span className="text-brand-600">*</span>
            </label>
            <input
              id="r-wa"
              className="input-base"
              placeholder="e.g. 0803 123 4567"
              inputMode="tel"
              value={restaurant.whatsappNumber}
              onChange={(e) => updateRestaurant({ whatsappNumber: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="r-tag" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tagline
            </label>
            <input
              id="r-tag"
              className="input-base"
              placeholder="e.g. Hot, fresh Naija dishes — dine in or takeaway"
              value={restaurant.tagline}
              onChange={(e) => updateRestaurant({ tagline: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="card scroll-mt-24 p-6">
        <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-slate-900 dark:text-white">
          <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-600" />
          Categories
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Group your dishes — e.g. Rice, Swallow & Soups, Proteins, Drinks.
        </p>
        <div className="mt-4">
          <CategoryManager categories={restaurant.categories} onAdd={addCategory} onRemove={removeCategory} />
        </div>
      </section>

      {/* Share */}
      <div id="share" className="scroll-mt-24">
        <ShareCard menuUrl={menuUrl} onCopy={handleCopy} onDownloadQr={handleDownloadQr} disabled={!isShareReady} />
      </div>

      {/* Add / edit item */}
      <section id="add" className="card scroll-mt-24 p-6">
        <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-slate-900 dark:text-white">
          <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-600" />
          {editing ? 'Edit item' : 'Add a menu item'}
        </h2>
        <div className="mt-4">
          <ItemForm
            initial={editing}
            categories={restaurant.categories}
            onSubmit={editing ? handleSaveEdit : handleAdd}
            onCancel={() => setEditing(null)}
          />
        </div>
      </section>

      {/* Menu list grouped by category */}
      <section id="items" className="scroll-mt-24">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Menu{' '}
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {restaurant.items.length}
            </span>
          </h2>
        </div>

        {restaurant.items.length === 0 ? (
          <div className="card grid place-items-center gap-2 p-10 text-center">
            <Icon d="M4 6h16M4 12h16M4 18h10" className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">No items yet. Add your first dish above 👆</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.id}>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{g.name}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {g.items.map((it) => (
                    <MenuItemCard
                      key={it.id}
                      item={it}
                      mode="manage"
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Toast toast={toast} />
    </div>
  )
}
