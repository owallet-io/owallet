import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Pincode } from "@src/components/pincode/pincode-component";
import ByteBrew from "react-native-bytebrew-sdk";

export const PincodeScreen: FunctionComponent = observer((props) => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          onVerifyPincode: Function;
          onGoBack?: Function;
          needConfirmation?: boolean;
          label?: string;
          subLabel?: string;
        }
      >,
      string
    >
  >();

  const { onVerifyPincode, onGoBack, label, subLabel } = route?.params;
  ByteBrew.NewCustomEvent(`Pincode Screen`);
  return (
    <>
      <Pincode
        onVerifyPincode={onVerifyPincode}
        subLabel={subLabel}
        label={label}
        needConfirmation={false}
        onGoBack={onGoBack}
      />
    </>
  );
});
