import React, { ReactNode } from "react";
import { ButtonProps } from "../../components/button";
import { SpecialButtonProps } from "../../components/special-button";

export interface HeaderProps {
  title: string | ReactNode;
  left?: ReactNode;
  right?: ReactNode;

  bottomButtons?: (
    | ({ isSpecial?: false } & ButtonProps)
    | ({ isSpecial: true } & SpecialButtonProps)
  )[];

  displayFlex?: boolean;
  fixedHeight?: boolean;
  fixedMinHeight?: boolean;

  additionalPaddingBottom?: string;

  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  isNotReady?: boolean;

  headerContainerStyle?: React.CSSProperties;

  fixedTop?: {
    height: string;
    element: React.ReactElement;
  };
}
