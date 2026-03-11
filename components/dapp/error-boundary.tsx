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
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.props.componentName && (
                <>
                  <p className="mb-2">
                    Error in {this.props.componentName}:
                  </p>
                </>
              )}
              <p className="text-xs font-mono text-destructive/80 max-w-md break-words">
                {this.state.error?.message || "Unknown error"}
              </p>
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
