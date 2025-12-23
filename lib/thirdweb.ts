import { createThirdwebClient } from "thirdweb"

/**
 * Initialize Thirdweb client with your client ID
 * Get your client ID from: https://thirdweb.com/dashboard/settings/api-keys
 */
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
})

/**
 * Check if Thirdweb is properly configured
 */
export const isThirdwebConfigured = () => {
  return !!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
}
