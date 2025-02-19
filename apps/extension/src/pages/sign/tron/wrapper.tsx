import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { TronSigningView } from "./view";
import { Splash } from "../../../components/splash";

export const SignTronTxPage: FunctionComponent = observer(() => {
  const { signTronInteractionStore } = useStore();

  useInteractionInfo({
    onWindowClose: () => {
      signTronInteractionStore.rejectAll();
    },
  });

  return (
    <React.Fragment>
      {signTronInteractionStore.waitingData ? (
        <TronSigningView
          key={signTronInteractionStore.waitingData.id}
          interactionData={signTronInteractionStore.waitingData}
        />
      ) : (
        <Splash />
      )}
    </React.Fragment>
  );
});
