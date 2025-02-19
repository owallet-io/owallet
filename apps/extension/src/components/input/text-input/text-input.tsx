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
      top,
      left,
      right,
      bottom,
      isLoading,
      autoComplete,
      border = true,
      noPadding = false,
      textAlign = "left",
      styleInput,
      singeLine,
      ...props
    },
    ref
  ) => {
    return !singeLine ? (
      <Styles.Container className={className} style={style}>
        {top ? (
          <Box
            style={{
              padding: 8,
            }}
          >
            {top}
          </Box>
        ) : null}
        <Columns sum={1} alignY="center">
          {label ? <Label content={label} isLoading={isLoading} /> : null}
          <Column weight={1} />
          {rightLabel ? <Box>{rightLabel}</Box> : null}
        </Columns>
        <Styles.TextInputContainer
          paragraph={paragraph}
          error={error}
          disabled={props.disabled}
          border={border}
          errorBorder={props.errorBorder}
          borderRadius={style?.borderRadius}
        >
          <Columns sum={1}>
            <MockBox show={!!left}>
              <Box alignY="center" marginLeft={noPadding ? "0rem" : "1rem"}>
                <Styles.Icon>
                  <Box>{left}</Box>
                </Styles.Icon>
              </Box>
            </MockBox>

            <Column weight={1}>
              <Styles.TextInput
                {...props}
                style={styleInput}
                textAlign={textAlign}
                autoComplete={autoComplete || "off"}
                paragraph={paragraph}
                error={error}
                ref={ref}
                height={style?.height}
                placeholder={props.placeholder ?? label ?? ""}
              />
            </Column>

            <MockBox show={!!right}>
              <Box alignY="center" marginRight={noPadding ? "0rem" : "1rem"}>
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
    ) : (
      <>
        <Styles.Container
          className={className}
          style={{
            ...style,
            justifyContent: "space-between",
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {label ? <Label content={label} isLoading={isLoading} /> : null}
          <Styles.TextInput
            {...props}
            style={styleInput}
            autoComplete={autoComplete || "off"}
            paragraph={paragraph}
            error={error}
            ref={ref}
            textAlign="right"
            placeholder={props.placeholder ?? label ?? ""}
          />
        </Styles.Container>
        <VerticalResizeTransition transitionAlign="top">
          {error || paragraph ? (
            <Styles.SubText error={error} paragraph={paragraph}>
              {error || paragraph}
            </Styles.SubText>
          ) : null}
        </VerticalResizeTransition>
      </>
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
