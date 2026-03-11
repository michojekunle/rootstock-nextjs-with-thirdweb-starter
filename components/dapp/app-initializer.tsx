"use client";

import { ReactNode } from "react";
import { validateEnvironment, formatValidationErrors } from "@/lib/env-validation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * Validates environment variables on app load and displays errors if misconfigured.
 * This ensures users get helpful feedback about missing setup rather than silent failures.
 */
export function AppInitializer({ children }: AppInitializerProps) {
  const validation = validateEnvironment();

  // If validation fails (missing critical config), show error page
  if (!validation.isValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-2xl">
          <Alert variant="destructive">
            <AlertTriangle className="size-5" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription className="mt-4">
              <p className="mb-4 font-mono text-sm whitespace-pre-wrap">
                {formatValidationErrors(validation)}
              </p>
              <details className="text-xs mt-4 cursor-pointer">
                <summary className="font-semibold mb-2">Setup Instructions</summary>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Create a Thirdweb account at https://thirdweb.com</li>
                  <li>Go to Dashboard → API Keys and create a new key</li>
                  <li>Copy the Client ID and add to .env.local:
                    <code className="block bg-muted p-2 rounded mt-1">
                      NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
                    </code>
                  </li>
                  <li>Set the network:
                    <code className="block bg-muted p-2 rounded mt-1">
                      NEXT_PUBLIC_DEFAULT_NETWORK=rootstock-testnet
                    </code>
                  </li>
                  <li>Deploy contracts using Thirdweb Dashboard or follow the README</li>
                  <li>Add contract addresses to .env.local once deployed</li>
                </ol>
              </details>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If warnings exist, show them but allow the app to load
  if (validation.warnings.length > 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="size-4" />
          <AlertTitle>Configuration Warnings</AlertTitle>
          <AlertDescription className="mt-2 whitespace-pre-wrap text-sm">
            {formatValidationErrors(validation)}
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // All good
  return children;
}
