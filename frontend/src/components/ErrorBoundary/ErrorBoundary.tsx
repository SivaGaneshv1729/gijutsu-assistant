import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  FallbackComponent: () => ReactNode;
  fallBackErrorMessage?: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        <strong>Error:</strong> {this.props.fallBackErrorMessage || 'An unexpected error occurred.'}
      </div>;
    }
    return this.props.FallbackComponent();
  }
}

export default ErrorBoundary;
export { ErrorBoundary };