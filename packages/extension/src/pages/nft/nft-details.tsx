import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styles from "./nft-details.module.scss";
import { HeaderLayout } from "../../layouts";
import { SelectChain } from "../../layouts/header";
import { Button, Card, CardBody } from "reactstrap";
import { useStore } from "../../stores";
import { InfoNft, NftContract } from "./types";
import * as cosmwasm from "@cosmjs/cosmwasm-stargate";
import { generateMsgAllNft } from "../helpers";

export const NftDetailsPage: FunctionComponent<{
  match?: {
    params: {
      nftId: string;
    };
  };
}> = observer(({ match }) => {
  const nftId = match?.params?.nftId || "";
  const [info, setInfo] = useState<InfoNft>({});
  const [isLoading, setIsLoading] = useState(false);
  const { chainStore } = useStore();
  const getInfoNft = async () => {
    try {
      if (!nftId) return;
      setIsLoading(true);
      const client = await cosmwasm.CosmWasmClient.connect(
        chainStore.current.rpc
      );
      const msg = generateMsgAllNft(nftId);
      const res = await client.queryContractSmart(NftContract, msg);
      if (res) {
        setInfo({
          ...res?.info?.extension,
          ...res?.access,
          token_uri: res?.info?.token_uri,
          tokenId: nftId,
        });
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getInfoNft();
  }, []);

  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <div
        style={{
          fontSize: 24,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        NFT Detail
      </div>
      <Card className={styles.card}>
        {isLoading ? (
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <i className="fas fa-spinner fa-spin" />
          </span>
        ) : (
          <div className={styles.cardBody}>
            <img
              src={info.token_uri}
              className={styles.imgDetail}
              alt={"details"}
              style={{
                border: "0.5px solid #E4E4E4",
                borderRadius: 12,
              }}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = require("./img/not-found.png");
              }}
            />
            <div className={styles.imgName}>{info?.image || "-"}</div>
            <div className={styles.content}>
              <div className={styles.tokenId}>
                <img src={require("./img/layer.png")} alt={"layer"} />
                <span>{info?.tokenId}</span>
              </div>
              <span>{info?.name}</span>
            </div>
            <div className={styles.rightContent}>
              {info?.description || "-"}
            </div>
            <div className={styles.rightContent}>
              {info?.external_url || "-"}
            </div>
            <div className={styles.rightContent}>{info?.image_data || "-"}</div>
            <div
              className={styles.rightContent}
              style={{
                cursor: "pointer",
                color: "blue",
              }}
              onClick={() => window.open(info?.youtube_url)}
            >
              {info?.youtube_url}
            </div>
          </div>
        )}
      </Card>

      {/* <Card className={styles.card}>
        <div
          style={{
            padding: 20
          }}
        >
          <div>Transactions list</div>
          {arr.map((e) => {
            return (
              <div
                style={{
                  paddingTop: 16
                }}
              >
                <div
                  style={{
                    backgroundColor: '#F3F1F5',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'rgba(95, 94, 119, 1)',
                    fontSize: 13
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{e.txHash}</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span>Send </span>
                      {e.status ? (
                        <img src={require('./check.png')} alt={'layer'} />
                      ) : (
                        <img src={require('./shape.png')} alt={'layer'} />
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span
                      style={{
                        color: e.status
                          ? 'rgba(75, 177, 12, 1)'
                          : 'rgba(239, 99, 99, 1)'
                      }}
                    >
                      {e.status ? '+ ' : '- '}
                      {e.amount} {e.denom}
                    </span>
                    <span>{e.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card> */}
    </HeaderLayout>
  );
});
