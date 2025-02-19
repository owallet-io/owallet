import React, { FunctionComponent } from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";
import { IMemoConfig } from "@owallet/hooks";
import { Box } from "../../box";
import { useIntl } from "react-intl";

export const MemoInput: FunctionComponent<{
  memoConfig: IMemoConfig;
  label?: string;
  rightLabel?: React.ReactNode;
  paragraph?: string;
  error?: string;
  errorBorder?: boolean;
  placeholder?: string;
  disabled?: boolean;
  singeLine?: boolean;
}> = observer(({ memoConfig, label, placeholder, singeLine, ...others }) => {
  const intl = useIntl();
  return (
    <Box>
      {singeLine ? (
        <TextInput
          label={
            label ??
            intl.formatMessage({ id: "components.input.memo-input.memo-label" })
          }
          singeLine={singeLine}
          placeholder={placeholder}
          onChange={(e) => {
            e.preventDefault();
            memoConfig.setValue(e.target.value);
          }}
          value={memoConfig.value}
          error={(() => {
            const uiProperties = memoConfig.uiProperties;
            const err = uiProperties.error || uiProperties.warning;
            if (err) {
              return err.message || err.toString();
            }
          })()}
          {...others}
        />
      ) : (
        <TextInput
          label={
            label ??
            intl.formatMessage({ id: "components.input.memo-input.memo-label" })
          }
          border={false}
          placeholder={placeholder}
          onChange={(e) => {
            e.preventDefault();
            memoConfig.setValue(e.target.value);
          }}
          value={memoConfig.value}
          error={(() => {
            const uiProperties = memoConfig.uiProperties;

            const err = uiProperties.error || uiProperties.warning;
            if (err) {
              return err.message || err.toString();
            }
          })()}
          {...others}
        />
      )}
    </Box>
  );
});
