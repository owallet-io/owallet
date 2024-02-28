import React, { CSSProperties, FunctionComponent, useCallback } from "react";
import { Button } from "reactstrap";

import { FormattedMessage } from "react-intl";

import style from "./style.module.scss";

export const ConfirmDialog: FunctionComponent<{
  img?: React.ReactElement;
  title?: string;
  paragraph: string;

  yes?: string;
  no?: string;

  styleYesBtn?: CSSProperties;
  styleNoBtn?: CSSProperties;
  styleParagraph?: CSSProperties;
  onConfirm?: () => void;
  onReject?: () => void;
}> = ({
  img: imgElement,
  title,
  paragraph,
  yes,
  no,
  styleYesBtn,
  styleNoBtn,
  styleParagraph,
  onConfirm,
  onReject,
}) => {
  return (
    <div className={style.dialog}>
      <div className={style.bodyContainer}>
        {imgElement ? imgElement : null}
        {title ? <h1>{title}</h1> : null}
        <p style={styleParagraph}>{paragraph}</p>
      </div>
      <div className={style.buttons}>
        <Button
          type="button"
          size="sm"
          color="default"
          outline
          onClick={useCallback(
            (e) => {
              if (onReject) {
                onReject();
              }
              e.preventDefault();
            },
            [onReject]
          )}
          style={styleNoBtn}
        >
          {no ? no : <FormattedMessage id="confirm.no" />}
        </Button>
        <Button
          type="button"
          size="sm"
          color="primary"
          onClick={useCallback(
            (e) => {
              if (onConfirm) {
                onConfirm();
              }
              e.preventDefault();
            },
            [onConfirm]
          )}
          style={styleYesBtn}
        >
          {yes ? yes : <FormattedMessage id="confirm.yes" />}
        </Button>
      </div>
    </div>
  );
};
