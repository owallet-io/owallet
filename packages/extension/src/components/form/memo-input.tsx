import React, { FunctionComponent, useState } from "react";
import { FormGroup, Input, Label } from "reactstrap";
import { IMemoConfig } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import styleMemo from "./address-input.module.scss";

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
        {label ? (
          <Label for={inputId} className="form-control-label">
            {label}
          </Label>
        ) : null}
        <Input
          id={inputId}
          className={classNames("form-control-alternative", styleMemo.input)}
          type="textarea"
          rows={rows ? rows : 2}
          style={{ resize: "none" }}
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
