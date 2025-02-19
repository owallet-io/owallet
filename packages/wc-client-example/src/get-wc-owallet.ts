import { BroadcastMode, OWallet } from "@owallet/types";
import SignClient from "@walletconnect/sign-client";
import { OWalletQRCodeModalV2 } from "@owallet/wc-qrcode-modal";
import { OWalletWalletConnectV2 } from "@owallet/wc-client";
import { EmbedChainInfos } from "./config";
import { fetchRetry } from "@owallet/common";
// import { simpleFetch } from "@owallet/simple-fetch";

let owallet: OWallet | undefined = undefined;
let promise: Promise<OWallet> | undefined = undefined;

type sendResponse = {
  tx_response: {
    txhash?: string;
    code?: number;
    raw_log?: string;
  };
};

async function sendTx(
  chainId: string,
  tx: Uint8Array,
  mode: BroadcastMode
): Promise<Uint8Array> {
  const params = {
    tx_bytes: Buffer.from(tx as any).toString("base64"),
    mode: (() => {
      switch (mode) {
        case "async":
          return "BROADCAST_MODE_ASYNC";
        case "block":
          return "BROADCAST_MODE_BLOCK";
        case "sync":
          return "BROADCAST_MODE_SYNC";
        default:
          return "BROADCAST_MODE_UNSPECIFIED";
      }
    })(),
  };
  const baseUrl = EmbedChainInfos.find(
    (chainInfo) => chainInfo.chainId === chainId
  )?.rest;
  const response: any = await fetchRetry(`${baseUrl}/cosmos/tx/v1beta1/txs`, {
    method: "POST",
    body: JSON.stringify(params),
  });
  console.log(response, "response");
  if (response.tx_response.code != null && response.tx_response.code !== 0) {
    throw new Error(response.tx_response["raw_log"]);
  }

  if (response.tx_response.txhash == null) {
    throw new Error("Invalid response");
  }

  return Buffer.from(response.tx_response.txhash, "hex");
}

export function getWCOWallet(): Promise<OWallet> {
  if (owallet) {
    return Promise.resolve(owallet);
  }

  const fn = async () => {
    const signClient = await SignClient.init({
      // If do you have your own project id, you can set it.
      projectId: "2bd21bae70d0708420acba90a33cd752",
      metadata: {
        name: "WC Test Dapp",
        description: "WC Test Dapp",
        url: "http://localhost:1234/",
        icons: [
          "https://raw.githubusercontent.com/chainapsis/owallet/master/apps/extension/src/public/assets/orai_wallet_logo.png",
        ],
      },
    });

    if (signClient.session.getAll().length <= 0) {
      const modal = new OWalletQRCodeModalV2(signClient);

      // You can pass the chain ids that you want to connect to the modal.
      const sessionProperties = await modal.connect(["cosmoshub-4"]);

      owallet = new OWalletWalletConnectV2(signClient, {
        sendTx,
        sessionProperties,
      });
    } else {
      owallet = new OWalletWalletConnectV2(signClient, {
        sendTx,
      });
    }

    return Promise.resolve(owallet);
  };

  if (!promise) {
    promise = fn();
  }

  return promise;
}
