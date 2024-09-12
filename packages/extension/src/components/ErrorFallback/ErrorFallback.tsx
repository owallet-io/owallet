import React from "react";
import { useErrorBoundary } from "react-error-boundary";
import { Text } from "../common/text";
import { Button } from "../common/button";
import colors from "../../theme/colors";
export const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div
      style={{
        alignItems: "center",
        padding: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <img
        style={{ width: 200 }}
        src={require("../../public/assets/images/img_planet.png")}
        alt="Error"
      />
      <div style={{ padding: 16 }}>
        <Text size={24} weight="600">
          Something went wrong
        </Text>
      </div>
      <Text
        containerStyle={{ textAlign: "center" }}
        color={colors["error-text-action"]}
      >
        {error.message}
      </Text>
      <Button
        containerStyle={{ width: 140, marginTop: 16 }}
        onClick={resetBoundary}
      >
        Try again
      </Button>
    </div>
  );
};
