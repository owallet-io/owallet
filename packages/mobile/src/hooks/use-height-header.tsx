// import { useHeaderHeight } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useGetHeightHeader = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = 0;
  const actualHeightHeight =
    headerHeight <= 0 ? safeAreaInsets.top : headerHeight - safeAreaInsets.top;
  return actualHeightHeight;
};
