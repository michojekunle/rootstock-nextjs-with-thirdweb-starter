/**
 * Next.js App Router Apple touch icon.
 * Placed in app/ so Next.js auto-generates <link rel="apple-touch-icon">.
 * 180×180 is the canonical size Apple recommends for home-screen icons.
 *
 * docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
 */
import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      // Rounded square with orange gradient + large white "R"
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #FF9100 0%, #e05f00 100%)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 108,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-3px",
          }}
        >
          R
        </div>
      </div>
    ),
    { ...size }
  )
}
