import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { BTCSigningView } from "./view";
import { Splash } from "../../../components/splash";

export const SignBtcTxPage: FunctionComponent = observer(() => {
  const { signBtcInteractionStore } = useStore();

  useInteractionInfo({
    onWindowClose: () => {
      signBtcInteractionStore.rejectAll();
    },
  });

  return (
    <React.Fragment>
      {signBtcInteractionStore.waitingData ? (
        <BTCSigningView
          key={signBtcInteractionStore.waitingData.id}
          interactionData={signBtcInteractionStore.waitingData}
        />
      ) : (
        <Splash />
      )}
    </React.Fragment>
  );
});
