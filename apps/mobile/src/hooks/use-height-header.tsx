import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useGetHeightHeader = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeightHeight =
    headerHeight <= 0 ? safeAreaInsets.top : headerHeight - safeAreaInsets.top;
  return actualHeightHeight;
};
