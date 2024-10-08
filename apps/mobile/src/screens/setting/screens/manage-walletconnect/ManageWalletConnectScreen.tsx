import { unknownToken } from "@owallet/common";
import { OWBox } from "@src/components/card";
import { OWEmpty } from "@src/components/empty";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { PageWithScrollView } from "@src/components/page";
import OWText from "@src/components/text/ow-text";
import { useStore } from "@src/stores";
import { metrics } from "@src/themes";

import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
interface WalletConnectSession {
  topic: string;
  namespaces: Record<
    string,
    | {
        accounts: string[];
        methods: string[];
        events: string[];
      }
    | undefined
  >;
  peer: {
    metadata: {
      name?: string;
      description?: string;
      url?: string;
      icons?: string[];
    };
  };
  isV2: boolean;
}

export const ManageWalletConnectScreen = observer(() => {
  const { walletConnectStore } = useStore();
  const sessions: WalletConnectSession[] = walletConnectStore
    .getSessions()
    .map((session) => {
      return {
        ...session,
        isV2: true,
      };
    });
  const { colors } = useTheme();
  return (
    <PageWithScrollView>
      <OWBox
        type="normal"
        style={{
          backgroundColor: colors["neutral-surface-card"],
          width: metrics.screenWidth - 32,
          marginHorizontal: 16,
          marginTop: 5,
        }}
      >
        <FlatList
          data={sessions}
          renderItem={({ item }) => {
            return (
              <ConnectedItem
                key={item.topic}
                session={item}
                onClickClose={async () => {
                  await walletConnectStore.disconnect(item.topic);
                }}
              />
            );
          }}
          //   ItemSeparatorComponent={() => <Gutter size={8} />}
          ListEmptyComponent={() => {
            return <OWEmpty />;
          }}
        />
      </OWBox>
    </PageWithScrollView>
  );
});

const ConnectedItem = ({ session, onClickClose }) => {
  const appName =
    session.peer?.metadata?.name || session.peer?.metadata?.url || "unknown";
  const metadata = session.peer?.metadata;
  const iconUrl = useMemo(() => {
    if (metadata?.icons && metadata?.icons.length > 0) {
      return metadata?.icons[metadata?.icons.length - 1];
    }
  }, [metadata?.icons]);
  const styles = styleling();
  const { colors } = useTheme();
  return (
    <View style={styles.wrapConnectItem}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <View style={styles.iconLeft}>
          <OWIcon
            size={32}
            style={{
              borderRadius: 999,
            }}
            type="images"
            source={{ uri: iconUrl || unknownToken.coinImageUrl }}
          />
        </View>

        <OWText size={16} color={colors["neutral-text-title"]}>
          {appName}
        </OWText>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: colors["neutral-surface-action2"],
          padding: 6,
          borderRadius: 999,
        }}
        onPress={onClickClose}
      >
        {/* <CloseIcon size={24} color={style.get("color-text-low").color} /> */}
        <OWIcon
          size={24}
          color={colors["error-surface-default"]}
          name="tdesign_delete"
        />
      </TouchableOpacity>
    </View>
  );
};

const styleling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    wrapConnectItem: {
      // backgroundColor: colors["background-item-list"],
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,

      // justifyContent: "center",
    },
    iconLeft: {
      backgroundColor: colors["neutral-surface-action2"],
      padding: 6,
      borderRadius: 999,
    },
  });
};
