import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 rounded-lg border border-neon-red/30 bg-card/80">
            <AlertTriangle
              size={48}
              className="text-neon-red mb-6 flex-shrink-0"
            />

            <h2 className="text-xl font-bold text-text-primary mb-4">An unexpected error occurred.</h2>

            <div className="p-4 w-full rounded bg-bg-secondary/50 overflow-auto mb-6 border border-neon-red/20">
              <pre className="text-sm text-text-muted whitespace-break-spaces font-mono">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green text-bg-primary hover:bg-neon-green/90 transition-colors cursor-pointer font-medium"
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
