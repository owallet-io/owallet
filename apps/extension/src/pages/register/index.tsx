import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import {
  FixedWidthSceneTransition,
  SceneTransitionRef,
} from "../../components/transition";
import { RegisterIntroScene } from "./intro";
import { NewMnemonicScene } from "./new-mnemonic";
import { Box } from "../../components/box";
import { VerifyMnemonicScene } from "./verify-mnemonic";
import { RecoverMnemonicScene } from "./recover-mnemonic";
import { RegisterIntroNewUserScene } from "./intro-new-user";
import {
  RegisterHeader,
  RegisterHeaderProvider,
  useRegisterHeaderContext,
} from "./components/header";
import { RegisterIntroExistingUserScene } from "./intro-existing-user";
import { RegisterNamePasswordScene } from "./name-password";
import { ConnectHardwareWalletScene } from "./connect-hardware";
import { ConnectLedgerScene } from "./connect-ledger";
import { RegisterNamePasswordHardwareScene } from "./name-password-hardware";
import { FinalizeKeyScene } from "./finalize-key";
import { EnableChainsScene } from "./enable-chains";
import { SelectDerivationPathScene } from "./select-derivation-path";
import { useStore } from "../../stores";
import { useSearchParams } from "react-router-dom";
import { BackUpPrivateKeyScene } from "./back-up-private-key";

const Container = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const RegisterPage: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore } = useStore();

  const isReady = useMemo(() => {
    // if (chainStore.isInitializing) {
    //   return false;
    // }

    if (!keyRingStore.isInitialized) {
      return false;
    }

    if (keyRingStore.status === "locked") {
      window.close();
    }

    return true;
  }, [
    chainStore.isInitializing,
    keyRingStore.isInitialized,
    keyRingStore.status,
  ]);

  const intervalOnce = useRef(false);
  console.log(
    "isReady 1",
    isReady,
    chainStore.isInitializing,
    keyRingStore.isInitialized,
    keyRingStore.status
  );
  useEffect(() => {
    if (isReady && !intervalOnce.current) {
      intervalOnce.current = true;
      setInterval(() => {
        keyRingStore.fetchKeyRingStatus().then((status) => {
          if (status === "locked") {
            window.close();
          }
        });
      }, 5000);
    }
  }, [isReady, keyRingStore]);

  console.log(
    "isReady 2",
    isReady,
    chainStore.isInitializing,
    keyRingStore.isInitialized,
    keyRingStore.status
  );
  return <Container>{isReady ? <RegisterPageImpl /> : null}</Container>;
});

const RegisterPageImpl: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const sceneRef = useRef<SceneTransitionRef | null>(null);
  const theme = useTheme();

  const [searchParams] = useSearchParams();

  const [initials] = useState(() => {
    const route = searchParams.get("route");
    const vaultId = searchParams.get("vaultId");
    const skipWelcome = searchParams.get("skipWelcome") === "true";

    if (vaultId) {
      if (chainStore.lastSyncedEnabledChainsVaultId !== vaultId) {
        window.close();
      }
    }

    if (route === "enable-chains") {
      const initialSearchValue = searchParams.get("initialSearchValue");

      return {
        header: {
          // TODO: ...
          mode: "intro" as const,
        },
        scene: {
          name: "enable-chains",
          props: {
            vaultId,
            stepPrevious: -1,
            stepTotal: 0,
            skipWelcome,
            initialSearchValue,
          },
        },
      };
    }

    const chainIds = searchParams.get("chainIds");
    if (route === "select-derivation-path" && chainIds) {
      return {
        header: {
          // TODO: ...
          mode: "intro" as const,
        },
        scene: {
          name: "select-derivation-path",
          props: {
            vaultId,
            chainIds: chainIds.split(",").map((chainId) => chainId.trim()),
            totalCount: chainIds.split(",").length,
            skipWelcome,
          },
        },
      };
    }

    return {
      header: {
        mode: "intro" as const,
      },
      scene: {
        name: "intro",
      },
    };
  });

  const headerContext = useRegisterHeaderContext(initials.header);

  return (
    <RegisterHeaderProvider {...headerContext}>
      <RegisterHeader sceneRef={sceneRef} />
      <Box
        position="relative"
        marginX="auto"
        backgroundColor={ColorPalette.white}
        borderRadius="1.5rem"
        style={{
          boxShadow: "0px 1px 4px 0px rgba(43, 39, 55, 0.10)",
        }}
      >
        <FixedWidthSceneTransition
          ref={sceneRef}
          scenes={[
            {
              name: "intro",
              element: RegisterIntroScene,
              width: "31rem",
            },
            {
              name: "new-user",
              element: RegisterIntroNewUserScene,
              width: "53.75rem",
            },
            {
              name: "existing-user",
              element: RegisterIntroExistingUserScene,
              width: "53.75rem",
            },
            {
              name: "new-mnemonic",
              element: NewMnemonicScene,
              width: "33.75rem",
            },
            {
              name: "verify-mnemonic",
              element: VerifyMnemonicScene,
              width: "35rem",
            },
            {
              name: "recover-mnemonic",
              element: RecoverMnemonicScene,
              width: "33.75rem",
            },
            {
              name: "connect-hardware-wallet",
              element: ConnectHardwareWalletScene,
              width: "31rem",
            },
            {
              name: "connect-ledger",
              element: ConnectLedgerScene,
              width: "40rem",
            },
            {
              name: "back-up-private-key",
              element: BackUpPrivateKeyScene,
              width: "28rem",
            },
            {
              name: "name-password",
              element: RegisterNamePasswordScene,
              width: "29rem",
            },
            {
              name: "name-password-hardware",
              element: RegisterNamePasswordHardwareScene,
              width: "29rem",
            },
            {
              name: "finalize-key",
              element: FinalizeKeyScene,
              width: "17.5rem",
            },
            {
              name: "enable-chains",
              element: EnableChainsScene,
              width: "34.5rem",
            },
            {
              name: "select-derivation-path",
              element: SelectDerivationPathScene,
              width: "40rem",
            },
          ]}
          initialSceneProps={initials.scene}
          transitionAlign="center"
        />
      </Box>
    </RegisterHeaderProvider>
  );
});
