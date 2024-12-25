import React, { forwardRef, FunctionComponent, PropsWithChildren } from "react";
import { TextInputProps } from "./types";
import { Styles } from "./styles";
import { Column, Columns } from "../../column";
import { Box } from "../../box";
import { VerticalResizeTransition } from "../../transition";
import { Label } from "../label";

// eslint-disable-next-line react/display-name
export const TextInput = forwardRef<
  HTMLInputElement,
  TextInputProps & React.InputHTMLAttributes<HTMLInputElement>
>(
  (
    {
      className,
      style,
      label,
      paragraph,
      error,
      rightLabel,
      left,
      right,
      bottom,
      isLoading,
      autoComplete,
      ...props
    },
    ref
  ) => {
    return (
      <Styles.Container className={className} style={style}>
        <Columns sum={1} alignY="center">
          {label ? <Label content={label} isLoading={isLoading} /> : null}
          <Column weight={1} />
          {rightLabel ? <Box>{rightLabel}</Box> : null}
        </Columns>

        <Styles.TextInputContainer
          paragraph={paragraph}
          error={error}
          disabled={props.disabled}
          errorBorder={props.errorBorder}
          borderRadius={style?.borderRadius}
        >
          <Columns sum={1}>
            <MockBox show={!!left}>
              <Box alignY="center" marginLeft="1rem">
                <Styles.Icon>
                  <Box>{left}</Box>
                </Styles.Icon>
              </Box>
            </MockBox>

            <Column weight={1}>
              <Styles.TextInput
                {...props}
                autoComplete={autoComplete || "off"}
                paragraph={paragraph}
                error={error}
                ref={ref}
                height={style?.height}
              />
            </Column>

            <MockBox show={!!right}>
              <Box alignY="center" marginRight="1rem">
                <Styles.Icon>
                  <Box>{right}</Box>
                </Styles.Icon>
              </Box>
            </MockBox>
          </Columns>
        </Styles.TextInputContainer>

        {bottom}

        <VerticalResizeTransition transitionAlign="top">
          {error || paragraph ? (
            <Styles.SubText error={error} paragraph={paragraph}>
              {error || paragraph}
            </Styles.SubText>
          ) : null}
        </VerticalResizeTransition>
      </Styles.Container>
    );
  }
);

const MockBox: FunctionComponent<
  PropsWithChildren<{
    show: boolean;
  }>
> = ({ show, children }) => {
  if (!show) {
    return null;
  }
  return <React.Fragment>{children}</React.Fragment>;
};
