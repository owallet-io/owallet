import { MessageSender, WorkerCmd } from '@owallet/router';
import React, { FunctionComponent, useEffect } from 'react';

const onMesssage = async (
  message: { cmd: WorkerCmd; params: any },
  sender: MessageSender,
  sendResponse: (response: any) => void
) => {
  if (sender.id !== browser.runtime.id) return;
  let ret = null;
  switch (message.cmd) {
    case 'reload-url':
      ret = handleReloadUrl(message.params);
      break;
  }

  sendResponse(ret);
};

const handleReloadUrl = ({ tabId, routerId, url }: any) => {
  const views = browser.extension
    .getViews({
      // Request only for the same tab as the requested frontend.
      // But the browser popup itself has no information about tab.
      // Also, if user has multiple windows on, we need another way to distinguish them.
      // See the comment right below this part.
      tabId
    })
    .filter((window) => {
      // You need to request interaction with the frontend that requested the message.
      // It is difficult to achieve this with the browser api alone.
      // Check the router id under the window of each view
      // and process only the view that has the same router id of the requested frontend.
      return (
        routerId == null ||
        routerId === (window as any).owalletExtensionRouterId
      );
    });
  if (views.length > 0) {
    for (const view of views) {
      view.location.href = url;
    }
  }
  return true;
};

export const ServiceWorkerHandler: FunctionComponent = () => {
  useEffect(() => {
    browser.runtime.onMessage.addListener(onmessage);
    return () => browser.runtime.onMessage.removeListener(onMesssage);
  });

  // show status ?
  return null;
};
