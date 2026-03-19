/**
 * Rootstock dApp brand logo.
 * The mark is a hexagonal chain-link shape in the Rootstock orange palette.
 * Use <LogoMark> for icon-only contexts and <Logo> for full wordmark.
 */

interface LogoMarkProps {
  className?: string
  size?: number
}

export function LogoMark({ className, size = 32 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Rootstock logo"
    >
      {/* Outer hexagon */}
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        fill="url(#rsk-grad)"
      />
      {/* Inner chain-link / R letterform */}
      <path
        d="M11 10h6.5a3.5 3.5 0 0 1 0 7H11V10Z"
        fill="white"
        fillOpacity="0.95"
      />
      <rect x="11" y="17" width="3" height="5" fill="white" fillOpacity="0.95" />
      <path
        d="M17 17l3.5 5"
        stroke="white"
        strokeOpacity="0.95"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="rsk-grad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9100" />
          <stop offset="1" stopColor="#e05f00" />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface LogoProps {
  className?: string
  iconSize?: number
}

export function Logo({ className, iconSize = 28 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark size={iconSize} />
      <div className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
          Rootstock
        </span>
        <span className="text-[10px] font-medium text-sidebar-foreground/45 tracking-wider uppercase">
          dApp
        </span>
      </div>
    </div>
  )
}
