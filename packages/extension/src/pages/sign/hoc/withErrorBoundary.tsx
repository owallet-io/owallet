import React from "react";
import { ErrorBoundary } from "react-error-boundary";

const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback: React.ReactElement
) => {
  // Return a new functional component
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};

export default withErrorBoundary;
