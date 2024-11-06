import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { SignModal } from "../../modals/sign";
import { HomeBaseModal } from "../../modals/home-base";
import { AppState, BackHandler, Platform } from "react-native";
import { WCMessageRequester } from "@stores/wallet-connect/msg-requester";
import { ADR36SignModal } from "@src/modals/sign/sign-adr36-modal";
import { SignEthereumModal } from "@src/modals/sign/sign-ethereum-modal";
import { LoadingModal } from "@src/modals/loading";
import { WalletConnectAccessModal } from "@src/modals/permission/wallet-connect-access";
import { GlobalPermissionModal } from "@src/modals/permission/global-permission";
import { SuggestChainModal } from "@src/modals/permission/suggest-chain";
import { BasicAccessModal } from "@src/modals/permission/basic-access";
import { SignOasisModal } from "@src/modals/sign/sign-oasis";
import { SignBtcModal } from "@src/modals/sign/sign-btc";
import { BasicAccessEVMModal } from "@src/modals/permission/basic-access-evm";
import { SignTronModal } from "../../modals/sign/sign-tron";

export const InteractionModalsProivder: FunctionComponent = observer(
  ({ children }) => {
    const {
      signInteractionStore,
      signEthereumInteractionStore,
      signOasisInteractionStore,
      signBtcInteractionStore,
      signTronInteractionStore,
      permissionStore,
      chainSuggestStore,
      walletConnectStore,
      keyRingStore,
      tokensStore,
      modalStore,
    } = useStore();

    const [showGoBackToBrowserIOS, setShowGoBackToBrowserIOS] = useState(false);

    useEffect(() => {
      if (walletConnectStore.needGoBackToBrowser) {
        if (Platform.OS === "android") {
          BackHandler.exitApp();
        } else {
          setShowGoBackToBrowserIOS(true);
        }
      }
    }, [walletConnectStore.needGoBackToBrowser]);

    useEffect(() => {
      const listener = AppState.addEventListener("change", (e) => {
        if (e === "background" || e === "inactive") {
          setShowGoBackToBrowserIOS(false);
          walletConnectStore.clearNeedGoBackToBrowser();
        }
      });

      return () => {
        listener.remove();
      };
    }, [walletConnectStore]);

    const mergedPermissionData = permissionStore.waitingPermissionMergedData;
    const mergedDataForEVM = permissionStore.waitingPermissionMergedDataForEVM;
    // useEffect(() => {
    //   for (const data of permissionStore.waitingDatas) {
    //     // Currently, there is no modal to permit the permission of external apps.
    //     // All apps should be embeded explicitly.
    //     // If such apps needs the permissions, add these origins to the privileged origins.
    //     // if (data.data.origins.length !== 1) {
    //     //   // permissionStore.rejectAll();
    //     // }
    //   }
    // }, [permissionStore, permissionStore.waitingDatas]);
    //
    // const renderAccessModal = () => {
    //   if (permissionStore.waitingDatas) {
    //     return permissionStore.waitingDatas.map((wd) => {
    //       return (
    //         <AccessModal
    //           waitingData={wd}
    //           isOpen={true}
    //           close={() => permissionStore.rejectAll()}
    //         />
    //       );
    //     });
    //   }
    // };
    console.log(
      signOasisInteractionStore.waitingData,
      "signOasisInteractionStore.waitingData"
    );
    return (
      <React.Fragment>
        {signInteractionStore.waitingData &&
        !signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc ? (
          <SignModal
            isOpen={true}
            close={() => {
              signInteractionStore.rejectWithProceedNext(
                signInteractionStore.waitingData?.id!,
                () => {}
              );
            }}
            interactionData={signInteractionStore.waitingData}
          />
        ) : null}

        {signOasisInteractionStore.waitingData ? (
          <SignOasisModal
            isOpen={true}
            close={() => {
              signOasisInteractionStore.rejectWithProceedNext(
                signOasisInteractionStore.waitingData?.id!,
                () => {}
              );
            }}
            interactionData={signOasisInteractionStore.waitingData}
          />
        ) : null}
        {signTronInteractionStore.waitingData ? (
          <SignTronModal
            isOpen={true}
            close={() => {
              signTronInteractionStore.rejectWithProceedNext(
                signTronInteractionStore.waitingData?.id!,
                () => {}
              );
            }}
            interactionData={signTronInteractionStore.waitingData}
          />
        ) : null}
        {signEthereumInteractionStore.waitingData ? (
          <SignEthereumModal
            isOpen={true}
            close={() => {
              signEthereumInteractionStore.rejectWithProceedNext(
                signEthereumInteractionStore.waitingData?.id!,
                () => {}
              );
            }}
            interactionData={signEthereumInteractionStore.waitingData}
          />
        ) : null}
        {signBtcInteractionStore.waitingData ? (
          <SignBtcModal
            isOpen={true}
            close={() => {
              signBtcInteractionStore.rejectWithProceedNext(
                signBtcInteractionStore.waitingData?.id!,
                () => {}
              );
            }}
            interactionData={signBtcInteractionStore.waitingData}
          />
        ) : null}
        {signOasisInteractionStore.waitingData ? (
          <SignOasisModal
            isOpen={true}
            close={() => {
              signOasisInteractionStore.rejectWithProceedNext(
                signOasisInteractionStore.waitingData?.id!,
                () => {}
              );
            }}
            interactionData={signOasisInteractionStore.waitingData}
          />
        ) : null}

        {keyRingStore.status === "unlocked" &&
        (walletConnectStore.isPendingClientFromDeepLink ||
          walletConnectStore.isPendingWcCallFromDeepLinkClient) ? (
          <LoadingModal isOpen={true} close={() => {}} />
        ) : null}

        {/*{showGoBackToBrowserIOS ? (*/}
        {/*    <GoBackToBrowserModal*/}
        {/*        isOpen={showGoBackToBrowserIOS}*/}
        {/*        setIsOpen={v => {*/}
        {/*            if (!v) {*/}
        {/*                setShowGoBackToBrowserIOS(false);*/}
        {/*                walletConnectStore.clearNeedGoBackToBrowser();*/}
        {/*            }*/}
        {/*        }}*/}
        {/*    />*/}
        {/*) : null}*/}

        {permissionStore.waitingGlobalPermissionData ? (
          <GlobalPermissionModal
            isOpen={true}
            close={async () => {
              await permissionStore.rejectGlobalPermissionAll();
            }}
          />
        ) : null}

        {mergedPermissionData
          ? (() => {
              const data = mergedPermissionData;
              if (data.origins.length === 1) {
                if (WCMessageRequester.isVirtualURL(data.origins[0])) {
                  return (
                    <WalletConnectAccessModal
                      isOpen={true}
                      // close={async () => await permissionStore.rejectPermissionWithProceedNext(data.ids, () => {})}
                      close={() => {}}
                      key={data.ids.join(",")}
                      data={data}
                    />
                  );
                }
              }

              return (
                <BasicAccessModal
                  isOpen={true}
                  close={async () =>
                    await permissionStore.rejectPermissionWithProceedNext(
                      data.ids,
                      () => {}
                    )
                  }
                  // close={() => {}}
                  key={data.ids.join(",")}
                  data={data}
                />
              );
            })()
          : null}

        {mergedDataForEVM && !mergedPermissionData
          ? (() => {
              const data = mergedDataForEVM;

              return (
                <BasicAccessEVMModal
                  isOpen={true}
                  close={async () =>
                    await permissionStore.rejectPermissionWithProceedNext(
                      data.ids,
                      () => {}
                    )
                  }
                  // close={() => {}}
                  key={data.ids.join(",")}
                  data={data}
                />
              );
            })()
          : null}

        {chainSuggestStore.waitingSuggestedChainInfo ? (
          <SuggestChainModal
            isOpen={true}
            close={async () => {
              await chainSuggestStore.rejectAll();
            }}
          />
        ) : null}

        {modalStore.getOptions?.isOpen ? (
          <HomeBaseModal
            bottomSheetModalConfig={{
              snapPoints: ["40%", "70%"],
              index: 1,
            }}
            {...modalStore.getOptions}
            isOpen={true}
            close={() => modalStore.close()}
          />
        ) : null}

        {children}
      </React.Fragment>
    );
  }
);
