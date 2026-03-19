"use client";

import { ReactNode, Component, ErrorInfo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary to gracefully handle component failures without crashing the whole app.
 * If a child component throws, the error is caught and displayed.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Always log internally for monitoring; never expose raw details to the UI in production
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === "development";
      return (
        this.props.fallback || (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.props.componentName && (
                <p className="mb-2">
                  {this.props.componentName} encountered an error.
                </p>
              )}
              <p className="text-sm text-destructive/80">
                An unexpected error occurred. Please reload the page or try again later.
              </p>
              {/* Only expose raw error details in development to avoid leaking internal info */}
              {isDev && this.state.error?.message && (
                <p className="mt-2 text-xs font-mono text-destructive/70 max-w-md break-words border border-destructive/20 rounded p-2 bg-destructive/5">
                  {this.state.error.message}
                </p>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
              >
                Reload page
              </button>
            </AlertDescription>
          </Alert>
        )
      );
    }

    return this.props.children;
  }
}
