import Aurora from '../../components/Aurora.jsx'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import ChatWidget from '../../components/ChatWidget.jsx'

export default function SiteLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Aurora />
      <Navbar />
      <main className="w-full flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
