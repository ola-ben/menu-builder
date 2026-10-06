import Contact from '../../../views/Contact.jsx'

export const metadata = {
  title: 'Contact Us | MenuLink',
  description: 'Get in touch with MenuLink support team for help, onboarding, and feedback.',
}

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Contact />
    </div>
  )
}
