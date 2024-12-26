import React, { CSSProperties } from "react";

export interface TextInputProps {
  label?: string;
  rightLabel?: React.ReactNode;
  top?: React.ReactNode;

  paragraph?: string;
  error?: string;
  border?: boolean;
  errorBorder?: boolean;
  isLoading?: boolean;
  noPadding?: boolean;

  className?: string;
  textAlign?: string;

  disabled?: boolean;
  style?: CSSProperties;
  styleInput?: CSSProperties;
  left?: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
}
