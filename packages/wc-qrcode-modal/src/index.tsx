import React from "react";
import ReactDOM from "react-dom/client";
import { Modal, ModalUIOptions } from "./modal";
import SignClient from "@walletconnect/sign-client";
import { ProposalTypes } from "@walletconnect/types";
import SessionProperties = ProposalTypes.SessionProperties;

export class OWalletQRCodeModalV2 {
  constructor(
    public readonly signClient: SignClient,
    protected readonly uiOptions?: ModalUIOptions
  ) {}

  async connect(chainIds: string[]): Promise<SessionProperties | undefined> {
    const { uri, approval } = await this.signClient.connect({
      requiredNamespaces: {
        cosmos: {
          methods: [
            "cosmos_getAccounts",
            "cosmos_signDirect",
            "cosmos_signAmino",
            "owallet_getKey",
            "owallet_signAmino",
            "owallet_signDirect",
            "owallet_signArbitrary",
            "owallet_enable",
            // "owallet_signEthereum",
            "owallet_experimentalSuggestChain",
            "owallet_suggestToken",
          ],
          chains: [...chainIds.map((chainId) => `cosmos:${chainId}`)],
          events: [
            "accountsChanged",
            "chainChanged",
            "owallet_accountsChanged",
          ],
        },
      },
    });

    if (!uri) {
      throw new Error("No uri");
    }

    try {
      this.open(uri, () => {});
      const session = await approval();
      return session.sessionProperties;
    } catch (e) {
      console.error(e);
    } finally {
      this.close();
    }
  }

  private root: ReturnType<typeof ReactDOM.createRoot> | null = null;

  open(uri: string, cb: any) {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("id", "owallet-qrcode-modal-v2");
    document.body.appendChild(wrapper);

    this.root = ReactDOM.createRoot(wrapper);
    this.root.render(
      <Modal
        uri={uri}
        close={() => {
          this.close();
          cb();
        }}
        uiOptions={this.uiOptions}
      />
    );
  }

  close() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    const wrapper = document.getElementById("owallet-qrcode-modal-v2");
    if (wrapper) {
      document.body.removeChild(wrapper);
    }
  }
}
