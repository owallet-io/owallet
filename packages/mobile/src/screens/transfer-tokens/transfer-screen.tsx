import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { CText as Text } from '../../components/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardBody } from '../../components/card';
import { spacing } from '../../themes';
import TransferTokensHeader from './transfer-header';
import TransferTokensOptions from './transfer-options';
import TransferViewBtn from './transfer-view-btn';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { useTheme } from '@react-navigation/native';

const styles = StyleSheet.create({
  sendTokenCard: {
    borderRadius: spacing['24'],
    padding: spacing['12']
  }
});

const TransferTokensScreen: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { colors } = useTheme();

  return (
    <PageWithScrollViewInBottomTabView
      style={[containerStyle]}
      backgroundColor={colors['background']}
    >
      {/* <TransferTokensHeader /> */}
      <View style={{ alignItems: 'center', marginTop: 17 }}>
        <Text
          style={{
            fontWeight: '800',
            fontSize: 24,
            marginBottom: 16
          }}
        >
          Transfer
        </Text>
      </View>
      <Card
        style={{
          ...styles.sendTokenCard,
          backgroundColor: colors['card-background']
        }}
      >
        <CardBody>
          <TransferTokensOptions />
          <TransferViewBtn />
        </CardBody>
      </Card>
    </PageWithScrollViewInBottomTabView>
  );
});

export default TransferTokensScreen;
