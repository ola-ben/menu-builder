import Terms from '../../../views/Terms.jsx'

export const metadata = {
  title: 'Terms of Service | MenuLink',
  description: 'Read the Terms of Service agreement for using MenuLink.',
}

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Terms />
    </div>
  )
}
