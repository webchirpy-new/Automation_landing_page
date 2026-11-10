import React from "react"

/** Line icons and small glassy illustrations for the Workload Orbit cards. Decorative only. */
const ICON = {
  customer: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 12.5 9 5 9-5" />
      <path d="m3 16.5 9 5 9-5" />
    </>
  ),
  manual: (
    <>
      <rect x="4.5" y="4.5" width="15" height="11" rx="1.6" />
      <path d="M2.5 19.5h19l-2.2-4H4.7l-2.2 4Z" />
    </>
  ),
  repeat: (
    <>
      <path d="M17 2.5 20.5 6 17 9.5" />
      <path d="M3.5 11V9a3 3 0 0 1 3-3h14" />
      <path d="M7 21.5 3.5 18 7 14.5" />
      <path d="M20.5 13v2a3 3 0 0 1-3 3h-14" />
    </>
  ),
  data: (
    <>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.300 8-3v-13" />
      <path d="M4 12c0 1.700 3.600 3 8 3s8-1.300 8-3" />
    </>
  ),
}

/** Line icon stroked in the shared spectral ramp; ids are per card so the four SVGs never clash. */
export function OrbitCardIcon({ name }) {
  const id = `oci-${name}`
  return (
    <svg className="orbit-card__icon" viewBox="0 0 24 24" fill="none" stroke={`url(#${id})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop className="orbit-card__icon-a" stopColor="#8ce6f0" />
          <stop className="orbit-card__icon-b" offset=".5" stopColor="#a9a4f6" />
          <stop className="orbit-card__icon-c" offset="1" stopColor="#f0bedf" />
        </linearGradient>
      </defs>
      {ICON[name]}
    </svg>
  )
}

const Plate = ({ y, id, opacity = 1 }) => (
  <g transform={`translate(0 ${y})`} opacity={opacity}>
    <path d="M60 4 112 30 60 56 8 30Z" fill={`url(#${id})`} />
    <path d="M8 30v5l52 26 52-26v-5L60 56Z" fill="#1a1240" fillOpacity=".55" />
    <path d="M60 4 112 30 60 56 8 30Z" fill="none" stroke="#d5daf8" strokeOpacity=".5" />
  </g>
)

const ART = {
  customer: (
    <>
      <defs>
        <linearGradient id="oa-c1" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#c6eef6" stopOpacity=".6" />
          <stop offset="1" stopColor="#7a6fae" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id="oa-c2" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8ce6f0" />
          <stop offset=".5" stopColor="#a9a4f6" />
          <stop offset="1" stopColor="#d69ad0" />
        </linearGradient>
      </defs>
      <g className="orbit-art__a">
        <Plate y={34} id="oa-c1" opacity={0.8} />
      </g>
      <g className="orbit-art__b">
        <Plate y={18} id="oa-c2" />
      </g>
      <g className="orbit-art__c">
        <Plate y={0} id="oa-c1" />
      </g>
    </>
  ),
  manual: (
    <>
      <defs>
        <linearGradient id="oa-m1" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#bfeef5" />
          <stop offset=".45" stopColor="#8f9cf0" />
          <stop offset="1" stopColor="#4a2f9e" />
        </linearGradient>
        <linearGradient id="oa-m2" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#4d4790" />
          <stop offset="1" stopColor="#e2bde0" />
        </linearGradient>
      </defs>
      <g className="orbit-art__b">
        <path d="M30 12 98 2c3-.4 5 1.500 5 4l-2 54-71 12c-3 .4-4-1-4-3.500l-1-52c0-2.500 2-4 5-4.500Z" fill="url(#oa-m1)" stroke="#f4effe" strokeOpacity=".6" />
        <path d="M37 21 93 13l-2 41-54 9Z" fill="#f4effe" fillOpacity=".35" />
      </g>
      <path d="M26 72 101 60l17 15c1.500 1.500 1 3-1 3.500L33 96c-2 .4-4-.2-5-2L14 80c-1-1.500-.5-3 1.500-3.400Z" fill="url(#oa-m2)" />
    </>
  ),
  repeat: (
    <>
      <defs>
        <linearGradient id="oa-r1" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#e4dcfb" />
          <stop offset=".55" stopColor="#9a8fe0" />
          <stop offset="1" stopColor="#5f4fa8" />
        </linearGradient>
      </defs>
      <g className="orbit-art__c">
        <path d="M12 8h58a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10H34L20 60V48h-8A10 10 0 0 1 2 38V18A10 10 0 0 1 12 8Z" fill="url(#oa-r1)" fillOpacity=".8" />
        <g fill="#0b113b"><circle cx="25" cy="28" r="3.500" /><circle cx="41" cy="28" r="3.500" /><circle cx="57" cy="28" r="3.500" /></g>
      </g>
      <g className="orbit-art__a">
        <path d="M56 42h50a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10h-6v11L88 80H56a10 10 0 0 1-10-10V52a10 10 0 0 1 10-10Z" fill="url(#oa-r1)" />
        <g fill="#0b113b"><circle cx="66" cy="61" r="3.500" /><circle cx="81" cy="61" r="3.500" /><circle cx="96" cy="61" r="3.500" /></g>
      </g>
    </>
  ),
  data: (
    <>
      <defs>
        <linearGradient id="oa-d1" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#2b3f9e" />
          <stop offset=".35" stopColor="#8ad7ea" />
          <stop offset=".65" stopColor="#c4aef2" />
          <stop offset="1" stopColor="#4a2a86" />
        </linearGradient>
      </defs>
      {[62, 38, 14].map((y, i) => (
        <g key={y} className={["orbit-art__a", "orbit-art__b", "orbit-art__c"][i]}>
          <path d={`M22 ${y + 10}v16c0 7 17 12 38 12s38-5 38-12v-16Z`} fill="url(#oa-d1)" />
          <ellipse cx="60" cy={y + 10} rx="38" ry="12" fill="#e2dcf8" stroke="#f9e6f3" strokeOpacity=".7" />
        </g>
      ))}
    </>
  ),
}

export function OrbitCardArt({ name }) {
  return (
    <svg className="orbit-card__art" viewBox="0 0 120 100" aria-hidden="true">
      {ART[name]}
    </svg>
  )
}
