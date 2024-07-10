import React, { forwardRef, useRef, useState } from "react";
import { Input, InputProps } from "./input";
import stylePasswordInput from "./password-input.module.scss";
import { Tooltip } from "reactstrap";
import { FormattedMessage } from "react-intl";
import EyeIconComponent from "assets/icon/iconoir_eye-off";
import colors from "theme/colors";

// eslint-disable-next-line react/display-name
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<
    InputProps & React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onKeyUp" | "onKeyDown"
  >
>((props, ref) => {
  const otherRef = useRef<HTMLInputElement | null>(null);
  const { typeInput } = props;
  const type = typeInput || "password";
  const [isOnCapsLock, setIsOnCapsLock] = useState(false);
  const [isHide, setIsHide] = useState(true);

  const onHidePassword = () => {
    setIsHide((prevState) => {
      if (prevState) {
        return false;
      } else {
        return true;
      }
    });
  };

  return (
    <React.Fragment>
      <Input
        {...props}
        type={!isHide ? "text" : type}
        ref={(argRef) => {
          otherRef.current = argRef;
          if (ref) {
            if ("current" in ref) {
              ref.current = argRef;
            } else {
              ref(argRef);
            }
          }
        }}
        rightIcon={
          <EyeIconComponent
            color={
              isHide
                ? colors["neutral-text-body"]
                : colors["primary-surface-pressed"]
            }
          />
        }
        onAction={onHidePassword}
        onKeyUp={(e) => {
          if (e.getModifierState("CapsLock")) {
            setIsOnCapsLock(true);
          } else {
            setIsOnCapsLock(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.getModifierState("CapsLock")) {
            setIsOnCapsLock(true);
          } else {
            setIsOnCapsLock(false);
          }
        }}
      />
      {otherRef.current && (
        <Tooltip
          arrowClassName={stylePasswordInput.capslockTooltipArrow}
          placement="top-start"
          isOpen={isOnCapsLock}
          target={otherRef.current}
          fade
        >
          <FormattedMessage id="lock.alert.capslock" />
        </Tooltip>
      )}
    </React.Fragment>
  );
});
