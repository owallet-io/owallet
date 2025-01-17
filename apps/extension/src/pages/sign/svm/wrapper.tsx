import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import {SvmSigningView} from "./view";
import { Splash } from "../../../components/splash";

export const SignSvmTxPage: FunctionComponent = observer(() => {
  const { signSvmInteractionStore } = useStore();

  useInteractionInfo({
    onWindowClose: () => {
      signSvmInteractionStore.rejectAll();
    },
  });

  return (
    <React.Fragment>
      {signSvmInteractionStore.waitingData ? (
        <SvmSigningView
          key={signSvmInteractionStore.waitingData.id}
          interactionData={signSvmInteractionStore.waitingData}
        />
      ) : (
        <Splash />
      )}
    </React.Fragment>
  );
});
