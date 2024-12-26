import React, { CSSProperties } from "react";

export interface TextInputProps {
  label?: string;
  rightLabel?: React.ReactNode;

  paragraph?: string;
  error?: string;
  border?: boolean;
  errorBorder?: boolean;
  isLoading?: boolean;

  className?: string;
  textAlign?: string;

  disabled?: boolean;
  style?: CSSProperties;
  left?: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
}
