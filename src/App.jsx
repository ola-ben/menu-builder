import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Aurora from './components/Aurora.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Menu from './pages/Menu.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

/** App shell with the navbar + footer (used by Home and Dashboard). */
function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <InstallPrompt />
      <Aurora />
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public menu is standalone — no app navbar/footer */}
      <Route path="/menu/:menuId" element={<Menu />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
