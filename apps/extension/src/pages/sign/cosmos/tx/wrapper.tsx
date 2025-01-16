import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { CosmosTxView } from "./view";
import { Splash } from "../../../../components/splash";

export const SignCosmosTxPage: FunctionComponent = observer(() => {
  const { signInteractionStore } = useStore();

  useInteractionInfo({
    onWindowClose: () => {
      signInteractionStore.rejectAll();
    },
  });

  return (
    <React.Fragment>
      {signInteractionStore.waitingData ? (
        <CosmosTxView
          key={signInteractionStore.waitingData.id}
          interactionData={signInteractionStore.waitingData}
        />
      ) : (
        <Splash />
      )}
    </React.Fragment>
  );
});
