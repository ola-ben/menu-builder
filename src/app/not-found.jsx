import NotFound from '../views/NotFound.jsx'
import Aurora from '../components/Aurora.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

export const metadata = {
  title: 'Page Not Found | MenuLink',
  description: 'The page you are looking for does not exist.',
}

export default function GlobalNotFound() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Aurora />
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <NotFound />
      </main>
      <Footer />
    </div>
  )
}
