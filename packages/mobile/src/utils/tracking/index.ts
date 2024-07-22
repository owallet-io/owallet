import ByteBrew from "react-native-bytebrew-sdk";
import { BranchEvent, BranchEventParams } from "react-native-branch";
export const tracking = (
  eventName: string,
  eventValue?: BranchEventParams | string | number
) => {
  ByteBrew.NewCustomEvent(eventName, eventValue as string);
  let event = new BranchEvent(eventName, null, eventValue as BranchEventParams);
  event.logEvent();
};
