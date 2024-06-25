import React, { CSSProperties, forwardRef, useState } from "react";

import classnames from "classnames";

import {
  FormFeedback,
  FormText,
  Input as ReactStrapInput,
  Label,
} from "reactstrap";
import { InputType } from "reactstrap/lib/Input";

import styleInput from "./input.module.scss";

import { Buffer } from "buffer";
import colors from "../../theme/colors";
import { Text } from "../common/text";

export interface InputProps {
  type?: Exclude<InputType, "textarea">;
  label?: string;
  placeHolder?: string;
  text?: string | React.ReactElement;
  error?: string;
  errors?: Array<string>;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  onAction?: () => void;
  append?: React.ReactElement;
  styleInputGroup?: CSSProperties;
  typeInput?: string | any;
  classNameInputGroup?: string;
  innerRef?: any;
  loading?: boolean;
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef<
  HTMLInputElement,
  InputProps & React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const {
    type,
    label,
    text,
    error,
    errors,
    append,
    styleInputGroup,
    typeInput,
    placeHolder,
    leftIcon,
    rightIcon,
    onAction,
    innerRef,
    loading,
  } = props;

  console.log("loading", loading);

  const attributes = { ...props };
  delete attributes.className;
  delete attributes.type;
  delete attributes.color;
  delete attributes.label;
  delete attributes.text;
  delete attributes.error;
  delete attributes.children;
  delete attributes.append;
  delete attributes.styleInputGroup;

  const [inputId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `input-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <div ref={innerRef}>
      <div
        style={{
          padding: 8,
          paddingTop: 4,
          paddingBottom: 4,
          marginTop: 4,
          border: "1px solid",
          borderRadius: 8,
          borderColor: colors["neutral-border-bold"],
          ...styleInputGroup,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          {label ? <Text>{label}</Text> : null}
          {loading ? (
            <div>
              <FormText>
                <i className="fa fa-spinner fa-spin fa-fw" />
              </FormText>
            </div>
          ) : null}
        </div>

        <div
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {leftIcon ? (
              <span style={{ paddingRight: 4 }}>{leftIcon}</span>
            ) : null}
            <ReactStrapInput
              placeholder={placeHolder ?? label}
              id={inputId}
              className={classnames(props.className, styleInput.input)}
              type={typeInput ?? type}
              innerRef={ref}
              {...attributes}
            />
          </div>

          {rightIcon ? (
            <div style={{ cursor: "pointer" }} onClick={onAction}>
              {rightIcon}
            </div>
          ) : null}
        </div>

        {append}
      </div>
      {errors?.length > 0
        ? errors.map((err) => {
            return (
              <FormFeedback style={{ display: "block" }}>{err}</FormFeedback>
            );
          })
        : null}
      {error ? (
        <FormFeedback style={{ display: "block" }}>{error}</FormFeedback>
      ) : text ? (
        <FormText>{text}</FormText>
      ) : null}
    </div>
  );
});
