import React, { FunctionComponent, ReactNode, useEffect } from "react";

import { Alert } from "reactstrap";

export interface NotificationElementProps {
  type:
    | "primary"
    | "link"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "default"
    | "secondary";
  content: string | ReactNode;
  duration: number; // Seconds
  canDelete?: boolean;
}

export const NotificationElement: FunctionComponent<
  NotificationElementProps & {
    onDelete: () => void;
  }
> = ({ type, content, duration, canDelete, onDelete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDelete();
    }, duration * 1000);
    return () => clearTimeout(timer);
  }, [duration, onDelete]);

  return (
    <Alert
      className={type === "default" ? "alert-default" : undefined}
      color={type !== "default" ? type : undefined}
      fade={false}
      toggle={canDelete ? onDelete : undefined}
    >
      {typeof content === "string" ? (
        <span className="alert-inner--text" style={{ wordWrap: "break-word" }}>
          {content}
        </span>
      ) : (
        <>{content}</>
      )}
    </Alert>
  );
};
