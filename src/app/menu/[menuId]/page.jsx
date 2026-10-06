import Menu from '../../../views/Menu.jsx'
import { fetchMenuById } from '../../../lib/menu.js'

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const menuId = resolvedParams?.menuId
  try {
    const menu = await fetchMenuById(menuId)
    if (menu) {
      const title = `${menu.name || 'Restaurant Menu'} | MenuLink`
      const description = menu.tagline || 'Scan the table QR code to browse our menu and order on WhatsApp.'
      const image = menu.logoUrl || '/og-cover.png'
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: [image],
        },
        twitter: {
          title,
          description,
          images: [image],
        },
      }
    }
  } catch (e) {
    // fallback
  }

  return {
    title: 'Public Restaurant Menu | MenuLink',
    description: 'Digital restaurant menu with WhatsApp ordering and table QR.',
  }
}

export default function MenuPage() {
  return <Menu />
}
