import React, { FunctionComponent, useState } from "react";
import { FormGroup, Label } from "reactstrap";
import { IMemoConfig } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import styleMemo from "./address-input.module.scss";
import { Input } from "./input";

export interface MemoInputProps {
  memoConfig: IMemoConfig;

  label?: string;
  className?: string;
  placeholder?: string;

  rows?: number;

  disabled?: boolean;
}

// TODO: Handle the max memo bytes length for each chain.
export const MemoInput: FunctionComponent<MemoInputProps> = observer(
  ({ memoConfig, label, className, rows, disabled = false, placeholder }) => {
    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });

    return (
      <FormGroup className={className}>
        <Input
          label={label ?? ""}
          placeHolder={label}
          id={inputId}
          value={memoConfig.memo}
          onChange={(e) => {
            memoConfig.setMemo(e.target.value);
            e.preventDefault();
          }}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
        />
      </FormGroup>
    );
  }
);
