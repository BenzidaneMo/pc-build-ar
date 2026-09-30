// Decorative SVG shapes of the interface: the header's logo, organic blobs, the computer
// illustration, a brush-stroke label and a hand-drawn underline. All are
// aria-hidden and ignore the pointer.

/** The header's logo, drawn like its line icons: a motherboard (CPU socket, two memory slots, a
 *  PCIe slot) and a screwdriver with an orange handle, after the app icon (build/icon1.png). */
export function BrandLogo() {
  return (
    <svg viewBox="0.5 -0.5 26 31.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="2" y="9" width="21" height="21" rx="2.5" />
      <rect x="5" y="13" width="8" height="8" rx="1" />
      <path d="M17 13v11M20 13v11" />
      <path d="M5.5 26.5h9" strokeWidth="2.4" />
      <circle cx="20" cy="27" r=".6" fill="currentColor" stroke="none" />
      <path d="M9 17 18.5 7.5" />
      <path d="M19 7 24.5 1.5" stroke="var(--orange)" strokeWidth="4" />
      <path d="M21 4.8 22.8 3" stroke="var(--brown)" strokeWidth="1" />
    </svg>
  )
}

const BLOB_A = 'M44.7,-61.4C57.1,-52.2,66.1,-38.3,70.6,-23.1C75.1,-7.9,75.2,8.6,69.5,22.6C63.8,36.6,52.4,48.1,39.2,57.2C26,66.3,11,73,-4.9,79.7C-20.8,86.4,-37.5,93.1,-49.1,86.6C-60.7,80.1,-67.2,60.5,-72.4,42.4C-77.6,24.3,-81.5,7.7,-78.1,-7.2C-74.7,-22.1,-64,-35.3,-51.5,-44.6C-39,-53.9,-24.6,-59.3,-9.8,-66.5C5,-73.7,32.3,-70.6,44.7,-61.4Z'
const BLOB_B = 'M39.9,-52.9C51.5,-46.3,60.6,-34.4,66.1,-20.4C71.6,-6.4,73.5,9.7,67.9,22.4C62.3,35.1,49.2,44.4,35.8,52.5C22.4,60.6,8.7,67.5,-6.8,70.2C-22.3,72.9,-39.6,71.4,-50.4,62.1C-61.2,52.8,-65.5,35.7,-68.9,19C-72.3,2.3,-74.8,-14,-69.1,-26.9C-63.4,-39.8,-49.5,-49.3,-35.6,-55.1C-21.7,-60.9,-7.8,-63,4.7,-69.1C17.2,-75.2,28.3,-59.5,39.9,-52.9Z'

function Blob({ d, color, className }: { d: string; color: string; className: string }) {
  return (
    <svg className={className} viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      <path d={d} fill={color} />
    </svg>
  )
}

/** Blobs in the page corners, behind everything. */
export function PageDecor() {
  return (
    <div className="page-decor" aria-hidden="true">
      <Blob d={BLOB_A} color="var(--teal)" className="blob blob-tl" />
      <Blob d={BLOB_B} color="var(--yellow)" className="blob blob-tr" />
      <Blob d={BLOB_B} color="var(--yellow)" className="blob blob-bl" />
      <Blob d={BLOB_A} color="var(--teal)" className="blob blob-br" />
      <svg className="ticks ticks-bl" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M6 30 L16 22 M12 36 L24 30" stroke="var(--teal)" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/** Shapes peeking out behind the stage, plus a little "spark". */
export function StageDecor() {
  return (
    <>
      <Blob d={BLOB_B} color="var(--yellow)" className="stage-blob stage-blob-a" />
      <Blob d={BLOB_A} color="var(--teal)" className="stage-blob stage-blob-b" />
      <svg className="spark" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 4 L20 18 M36 10 L28 22 M44 26 L31 28" stroke="var(--orange)" strokeWidth="4" strokeLinecap="round" />
        <path d="M14 8 L16 16" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </>
  )
}

/** Flat illustration of a monitor and tower on a green blob (the info card header). */
export function ComputerArt() {
  return (
    <svg className="computer-art" viewBox="0 0 160 110" aria-hidden="true" focusable="false">
      <path d="M18 88 C4 70 20 44 48 46 C70 47 78 30 104 34 C134 38 152 62 140 82 C128 102 44 108 18 88 Z" fill="var(--teal)" opacity="0.85" />
      <rect x="46" y="14" width="70" height="50" rx="5" fill="var(--ink)" />
      <rect x="51" y="19" width="60" height="38" rx="2" fill="#35c3a1" />
      <path d="M51 45 L70 34 L84 42 L96 32 L111 41 L111 57 L51 57 Z" fill="#1f9d86" />
      <circle cx="98" cy="27" r="4" fill="#fff6c9" />
      <rect x="74" y="64" width="14" height="10" fill="var(--ink)" />
      <rect x="62" y="73" width="38" height="5" rx="2.5" fill="var(--ink)" />
      <rect x="118" y="22" width="26" height="58" rx="4" fill="var(--ink)" />
      <rect x="122" y="28" width="18" height="4" rx="1" fill="#35c3a1" />
      <rect x="122" y="36" width="18" height="4" rx="1" fill="#4a3a31" />
      <circle cx="131" cy="66" r="3.5" fill="#35c3a1" />
    </svg>
  )
}

/** Teal brush stroke behind a short label ("تذكّر دائمًا:"). */
export function BrushLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="brush-label">
      <svg viewBox="0 0 200 48" preserveAspectRatio="none" aria-hidden="true">
        <path d="M6 12 C40 4 90 8 150 5 C170 4 188 6 196 10 L192 22 L198 30 C180 42 120 44 70 42 C40 41 18 44 4 38 L10 26 Z" fill="var(--teal)" />
      </svg>
      <span>{children}</span>
    </span>
  )
}

/** Hand-drawn orange underline with an arrow tip. */
export function Squiggle() {
  return (
    <svg className="squiggle" viewBox="0 0 140 24" aria-hidden="true">
      <path d="M4 18 C30 10 52 20 76 12 C94 6 110 10 124 6" fill="none" stroke="var(--orange)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M116 2 L126 6 L119 13" fill="none" stroke="var(--orange)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
