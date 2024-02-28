import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styles from "./nft.module.scss";
import { useHistory } from "react-router";
import { useStore } from "../../stores";
import { Limit, NftContract, StartAfter, InfoNft } from "./types";
import * as cosmwasm from "@cosmjs/cosmwasm-stargate";
import { generateMsgInfoNft, generateMsgNft } from "../helpers";

export const NftPage: FunctionComponent = observer(() => {
  const [token, setToken] = useState<InfoNft[]>(null);
  const history = useHistory();
  const { chainStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const getListNft = async () => {
    try {
      const client = await cosmwasm.CosmWasmClient.connect(
        chainStore.current.rpc
      );
      const msg = generateMsgNft(Limit, accountInfo.bech32Address, StartAfter);
      const res = await client.queryContractSmart(NftContract, msg);
      if (res) {
        fetchInfoNft(res?.tokens?.[0], client);
      }
    } catch (error) {
      setToken([]);
    }
  };

  const fetchInfoNft = async (tokenId, client) => {
    if (!tokenId) return setToken([]);
    const msg = generateMsgInfoNft(tokenId);
    const res = await client.queryContractSmart(NftContract, msg);
    if (res) {
      setToken([
        {
          ...res.extension,
          token_uri: res?.token_uri,
          tokenId,
        },
      ]);
    }
  };

  useEffect(() => {
    getListNft();
  }, []);

  if (!token) {
    return (
      <span
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 100,
        }}
      >
        <i className="fas fa-spinner fa-spin" />
      </span>
    );
  }

  return (
    <div>
      <div>
        <div className={styles.label}>NFT-721</div>
        <div style={{ height: 20 }} />
        <div className={styles.list}>
          {token.map((t) => {
            return <NftItem token={t} history={history} />;
          })}
          {(!token || !token?.length) && (
            <div className={styles.nodata}>
              <img src={require("./img/no-data.png")} alt={"no-data"} />
            </div>
          )}
        </div>
      </div>
      <div>
        <div className={styles.label}>NFT-1155</div>
        <div className={styles.list}>
          <div className={styles.nodata}>
            <img src={require("./img/no-data.png")} alt={"no-data"} />
          </div>
        </div>
      </div>
    </div>
  );
});

export const NftItem = ({ token, history }) => {
  return (
    <div
      className={styles.card}
      onClick={() => history.push(`/token/${token.tokenId}`)}
    >
      <div className={styles.img}>
        <img
          src={token.token_uri}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = require("./img/not-found.png");
          }}
          alt={token.name}
          style={{
            border: "0.5px solid #E4E4E4",
            borderRadius: 6,
          }}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.content}>{token.image || "-"} </div>
        <div className={styles.content}>{token.name || "-"}</div>
        <div className={styles.description}>{token.description || "-"}</div>
      </div>
    </div>
  );
};
