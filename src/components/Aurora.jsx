/**
 * Soft ambient backdrop — a few large, blurred brand/amber glows fixed behind
 * everything and non-interactive. Matches MenuLink's warm, rounded look. The
 * fixed, overflow-hidden wrapper clips the blobs so they never cause scroll.
 */
export default function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/10" />
      <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-500/10" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-brand-300/15 blur-3xl dark:bg-brand-500/[0.06]" />
    </div>
  )
}
