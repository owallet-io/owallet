import ByteBrew from "react-native-bytebrew-sdk";
export const tracking = (eventName: string, eventValue?: string | number) => {
  ByteBrew.NewCustomEvent(eventName, eventValue as string);
};
