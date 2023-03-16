import React, { FunctionComponent } from 'react';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';

import styleDetailsTab from '../details-tab.module.scss';
import { FormattedMessage, useIntl } from 'react-intl';
import { Badge, Label } from 'reactstrap';
import classnames from 'classnames';

export const TronDetailsTab: FunctionComponent<{ dataSign }> = observer(
  ({ dataSign }) => {
    return (
      <div className={styleDetailsTab.container}>
        <Label
          for="signing-messages"
          className="form-control-label"
          style={{ display: 'flex' }}
        >
          <FormattedMessage id="sign.list.messages.label" />
          <Badge className={classnames('ml-2', styleDetailsTab.msgsBadge)}>
            {JSON.stringify(dataSign).length}
          </Badge>
        </Label>
        <div
          id="signing-messages"
          style={{
            overflow: 'auto',
            height: 80
          }}
          className={styleDetailsTab.msgContainer}
        >
          {JSON.stringify(dataSign, null, 2)}
        </div>
      </div>
    );
  }
);

export const MsgRender: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({ icon = 'fas fa-question', title, children }) => {
  return (
    <div className={styleDetailsTab.msg}>
      <div className={styleDetailsTab.icon}>
        <div style={{ height: '2px' }} />
        <i className={icon} />
        <div style={{ flex: 1 }} />
      </div>
      <div className={styleDetailsTab.contentContainer}>
        <div className={styleDetailsTab.contentTitle}>{title}</div>
        <div className={styleDetailsTab.content}>{children}</div>
      </div>
    </div>
  );
};
