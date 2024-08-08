import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import colors from "theme/colors";

function ErrorFallback({ error, ...props }) {
  return (
    <div
      style={{
        height: "10%",
        overflow: "scroll",
        backgroundColor: colors["neutral-surface-bg"],
        borderRadius: 12,
        padding: 8,
        width: "100%",
      }}
    >
      <span>{JSON.stringify(props.msg, null, 2)}</span>;
    </div>
  );
}

const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return (props: P) => (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ErrorFallback error={error} {...props} />
      )}
    >
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};

export default withErrorBoundary;
