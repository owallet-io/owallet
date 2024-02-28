import React from "react";
import ReactDom from "react-dom";
import { Modal, ModalUIOptions } from "./modal";

export class OWalletQRCodeModalV1 {
  constructor(protected readonly uiOptions?: ModalUIOptions) {}

  open(uri: string, cb: any) {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("id", "owallet-qrcode-modal-v1");
    document.body.appendChild(wrapper);

    ReactDom.render(
      <Modal
        uri={uri}
        close={() => {
          this.close();
          cb();
        }}
        uiOptions={this.uiOptions}
      />,
      wrapper
    );
  }

  close() {
    const wrapper = document.getElementById("owallet-qrcode-modal-v1");
    if (wrapper) {
      document.body.removeChild(wrapper);
    }
  }
}
