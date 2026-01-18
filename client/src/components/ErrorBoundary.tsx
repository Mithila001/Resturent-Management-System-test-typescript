import React from "react";
import "./ErrorMessage.css";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(_: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.state = { hasError: true, error, errorInfo };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container" style={{ padding: "40px", textAlign: "center" }}>
          <div className="error-message">
            <h2
              style={{
                fontSize: "24px",
                marginBottom: "16px",
                color: "#e74c3c",
              }}
            >
              ⚠️ Something went wrong
            </h2>
            <p style={{ marginBottom: "20px", color: "#666" }}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <details
              style={{
                marginTop: "20px",
                textAlign: "left",
                maxWidth: "600px",
                margin: "20px auto",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  padding: "10px",
                  background: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                Error Details (for developers)
              </summary>
              <pre
                style={{
                  marginTop: "10px",
                  padding: "15px",
                  background: "#f9f9f9",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "12px",
                  textAlign: "left",
                }}
              >
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
