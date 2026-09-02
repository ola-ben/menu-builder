import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Aurora from './components/Aurora.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Menu from './pages/Menu.jsx'
import Contact from './pages/Contact.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import NotFound from './pages/NotFound.jsx'

/** App shell with the navbar + footer (used by Home and Dashboard). */
function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="relative flex min-h-screen flex-col">
      <InstallPrompt />
      <Aurora />
      <Navbar />
      <main className={isHome ? "w-full flex-1" : "mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6"}>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public menu is standalone — no app navbar/footer */}
        <Route path="/menu/:menuId" element={<Menu />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard/:tab?" element={<Dashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
