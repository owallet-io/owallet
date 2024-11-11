import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { FormattedMessage, useIntl } from "react-intl";
// import {XAxis} from '../axis';
// import {Button} from '../button';
// import {Gutter} from '../gutter';
// import {registerCardModal} from './card';
// import {Box} from '../box';
// import * as ExpoImage from 'expo-image';
import { Image, Text } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
// import {Chip} from '../chip';
import { ChainInfo } from "@owallet/types";
import { InteractionWaitingData } from "@owallet/background";
// import {GuideBox} from '../guide-box';
// import {Skeleton} from '../skeleton';
// import {RectButton} from '../rect-button';
import * as WebBrowser from "react-native-inappbrowser-reborn";
// import {ScrollView} from '../scroll-view/common-scroll-view';
import {
  RectButton,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { registerModal } from "@src/modals/base";
import { WCMessageRequester } from "@stores/wallet-connect/msg-requester";
import { Box } from "@components/box";
import { XAxis } from "@components/axis";
import { Button, OWButton } from "@components/button";
import { Gutter } from "@components/gutter";
import { Chip } from "@components/chip";
import { GuideBox } from "@components/guide-box";
import images from "@assets/images";
import { Skeleton } from "@components/skeleton";
import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
// import {WCMessageRequester} from '../../stores/wallet-connect/msg-requester.ts';

export const SuggestChainModal = registerModal(
  observer(() => {
    const { chainSuggestStore } = useStore();

    const waitingData = chainSuggestStore.waitingSuggestedChainInfo;
    if (!waitingData) {
      return null;
    }

    return (
      <SuggestChainPageImpl key={waitingData.id} waitingData={waitingData} />
    );
  })
);

const SuggestChainPageImpl: FunctionComponent<{
  waitingData: InteractionWaitingData<{
    chainInfo: ChainInfo;
    origin: string;
  }>;
}> = observer(({ waitingData }) => {
  const intl = useIntl();

  const { chainSuggestStore, chainStore, keyRingStore, walletConnectStore } =
    useStore();
  const [isLoadingPlaceholder, setIsLoadingPlaceholder] = useState(true);
  const [originUrl, setOriginUrl] = useState<string>("");

  const queryCommunityChainInfo = chainSuggestStore.getCommunityChainInfo(
    waitingData.data.chainInfo.chainId
  );
  const communityChainInfo = queryCommunityChainInfo.chainInfo;

  const reject = async () => {
    await chainSuggestStore.rejectWithProceedNext(waitingData.id, () => {});
  };

  const approve = async () => {
    const chainInfo = communityChainInfo || waitingData.data.chainInfo;

    await chainSuggestStore.approveWithProceedNext(
      waitingData.id,
      chainInfo,
      () => {
        keyRingStore.refreshKeyRingStatus();
        chainStore.updateChainInfosFromBackground();
      }
    );
  };

  useEffect(() => {
    (async () => {
      if (WCMessageRequester.isVirtualURL(waitingData.data.origin)) {
        const id = WCMessageRequester.getIdFromVirtualURL(
          waitingData.data.origin
        );

        const topic = await walletConnectStore.getTopicByRandomId(id);
        if (topic) {
          const session = walletConnectStore.getSession(topic);
          setOriginUrl(session?.peer.metadata.url ?? "");
        } else {
          setOriginUrl(waitingData.data.origin);
        }
      } else {
        setOriginUrl(waitingData.data.origin);
      }
    })();
  }, [waitingData.data.origin, walletConnectStore]);

  useEffect(() => {
    if (!queryCommunityChainInfo.isLoading) {
      setIsLoadingPlaceholder(false);
    }
  }, [queryCommunityChainInfo.isLoading]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingPlaceholder(false);
    }, 1000);
  }, []);

  return (
    <WrapViewModal>
      <Box key={waitingData.id} paddingX={12} paddingBottom={12}>
        {(() => {
          if (isLoadingPlaceholder) {
            return (
              <CommunityInfo
                isNotReady={isLoadingPlaceholder}
                origin={originUrl}
                chainInfo={waitingData.data.chainInfo}
              />
            );
          }

          if (communityChainInfo) {
            return (
              <CommunityInfo
                isNotReady={false}
                origin={originUrl}
                chainInfo={communityChainInfo}
                communityChainInfoUrl={chainSuggestStore.getCommunityChainInfoUrl(
                  communityChainInfo.chainId
                )}
              />
            );
          }

          return (
            <RawInfo
              origin={originUrl}
              chainInfo={waitingData.data.chainInfo}
              communityChainInfoRepoUrl={
                chainSuggestStore.communityChainInfoRepoUrl
              }
            />
          );
        })()}
        <XAxis>
          <OWButton
            size="large"
            label={intl.formatMessage({ id: "button.reject" })}
            type="secondary"
            style={{ flex: 1, width: "100%" }}
            onPress={reject}
          />

          <Gutter size={16} />

          <OWButton
            size="large"
            label={intl.formatMessage({ id: "button.approve" })}
            style={{ flex: 1, width: "100%" }}
            onPress={approve}
          />
        </XAxis>
      </Box>
    </WrapViewModal>
  );
});

const CommunityInfo: FunctionComponent<{
  isNotReady: boolean;
  origin: string;
  chainInfo: ChainInfo;
  communityChainInfoUrl?: string;
}> = ({ origin, chainInfo, isNotReady, communityChainInfoUrl }) => {
  const style = useStyle();
  const { colors } = useTheme();
  return (
    <Box padding={12} alignX="center" alignY="center">
      <Skeleton isNotReady={isNotReady}>
        <OWText variant={"h4"}>
          <FormattedMessage
            id="page.suggest-chain.title"
            values={{ chainName: chainInfo.chainName }}
          />
        </OWText>
      </Skeleton>

      <Gutter size={16} />

      <Skeleton isNotReady={isNotReady}>
        <OWText
          color={colors["neutral-text-body"]}
          style={{
            textAlign: "center",
          }}
        >
          <FormattedMessage
            id="page.suggest-chain.community-info-view.paragraph"
            values={{
              b: (...chunks: any) => (
                <Text style={{ fontWeight: "bold" }}>{chunks}</Text>
              ),
              origin,
              chainId: chainInfo.chainId,
            }}
          />
        </OWText>
      </Skeleton>

      <Gutter size={32} />
    </Box>
  );
};

const RawInfo: FunctionComponent<{
  origin: string;
  chainInfo: ChainInfo;
  communityChainInfoRepoUrl: string;
}> = ({ origin, chainInfo, communityChainInfoRepoUrl }) => {
  const intl = useIntl();
  const style = useStyle();
  const { colors } = useTheme();
  return (
    <Box alignY="center" alignX="center">
      <OWText variant={"h4"}>
        <FormattedMessage
          id="page.suggest-chain.title"
          values={{ chainName: chainInfo.chainName }}
        />
      </OWText>

      <Gutter size={16} />

      <Chip text={origin} />

      <Gutter size={16} />

      <Box
        maxHeight={160}
        backgroundColor={colors["neutral-surface-bg"]}
        padding={16}
        borderRadius={6}
      >
        <ScrollView>
          <OWText color={colors["neutral-text-body"]}>
            {JSON.stringify(chainInfo, null, 2)}
          </OWText>
        </ScrollView>
      </Box>

      <Gutter size={16} />
    </Box>
  );
};
