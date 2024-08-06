import { Component, ErrorInfo, ReactNode, PropsWithChildren } from "react";

interface ErrorBoundaryState {
  error?: Error;
  errorInfo?: ErrorInfo;
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: ErrorBoundaryState): {
    hasError: boolean;
    error: ErrorBoundaryState;
  } {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
  }

  render(): ReactNode {
    const { hasError, errorInfo, error } = this.state;

    if (hasError) {
      return (
        <>
          <h1>{error?.message}</h1> <br />
          <br />
          <details>
            {error?.stack}
            {errorInfo?.componentStack}
          </details>
        </>
      );
    } else {
      return this.props.children;
    }
  }
}
