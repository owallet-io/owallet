import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import { RectButton } from '../../../../components/rect-button';
import { colors, metrics, spacing, typography } from '../../../../themes';
import { _keyExtract } from '../../../../utils/helper';

const myAccounts = [
  {
    name: "Stephen Harris",
    image: "../../../../assets/image/address_default.png",
    address: "orai10fa56n...14zasmp",
  },
  {
    name: "Stephen Harris",
    image: "../../../../assets/image/address_default.png",
    address: "orai10fa56n...14zasmp",
  },
];

const MnemonicSeed = ({ styles }) => {
  const renderItem = ({ item }) => {
    return (
      <RectButton
        style={{
          ...styles.containerAccount,
        }}
      >
        <View
          style={{
            justifyContent: "flex-start",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            style={{
              width: spacing["38"],
              height: spacing["38"],
            }}
            source={require("../../../../assets/image/address_default.png")}
            fadeDuration={0}
          />
          <View
            style={{
              justifyContent: "space-between",
              marginLeft: spacing["12"],
            }}
          >
            <Text
              style={{
                ...typography.h6,
                color: colors["gray-900"],
                fontWeight: "900",
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={{
                ...typography.h7,
                color: colors["gray-300"],
                fontWeight: "800",
                fontSize: 12,
              }}
            >
              {item.address}
            </Text>
          </View>
        </View>

        <View>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: spacing["32"],
              backgroundColor: colors["purple-700"],
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: spacing["32"],
                backgroundColor: colors["white"],
              }}
            />
          </View>
        </View>
      </RectButton>
    );
  };
  return (
    <View
        style={{
          width: metrics.screenWidth - 36,
          height: metrics.screenHeight / 4,
        }}
      >
        <FlatList
          data={myAccounts}
          renderItem={renderItem}
          keyExtractor={_keyExtract}
          ListFooterComponent={() => (
            <View
              style={{
                height: spacing["16"],
              }}
            />
          )}
        />
      </View>
  );
};

export default MnemonicSeed;