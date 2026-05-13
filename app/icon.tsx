/**
 * Next.js App Router file-convention favicon.
 * Placed in app/ so Next.js auto-generates <link rel="icon"> for every page.
 * Served as PNG (image/png) — works in all browsers including Safari.
 *
 * docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
 */
import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      // Hexagonal orange background + white bold "R"
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #FF9100 0%, #e05f00 100%)",
          clipPath:
            "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 1,
          }}
        >
          R
        </div>
      </div>
    ),
    { ...size }
  )
}
