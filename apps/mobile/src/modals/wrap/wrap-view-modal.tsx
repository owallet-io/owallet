import { StyleProp, View, ViewProps } from "react-native";
import { FC, ReactNode } from "react";
import { Text } from "@src/components/text";
import { OWTextProps } from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { Box } from "@components/box";

interface IWrapViewModal extends ViewProps {
  title?: string;
  subTitle?: string;
  TitleComponent?: ReactNode;
  titleProps?: OWTextProps;
  subTitleProps?: OWTextProps;
  disabledScrollView?: boolean;
  buttonBottom?: ReactNode | null;
  containerStyle?: ViewProps["style"];
}

const WrapViewModal: FC<IWrapViewModal> = ({
  title,
  subTitle,
  titleProps,
  subTitleProps,
  style,
  TitleComponent,
  disabledScrollView = true,
  buttonBottom,
  containerStyle,
  ...props
}) => {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const ContainerElement = disabledScrollView ? View : ScrollView;
  return (
    <View
    // style={[
    //   {
    //     flex: 1,
    //     paddingHorizontal: 16,
    //     backgroundColor: colors["neutral-surface-card"],
    //     borderRadius: 12,
    //   },
    //   containerStyle,
    // ]}
    >
      {typeof title === "function" ? (
        TitleComponent
      ) : title?.length > 0 ? (
        <Text
          size={16}
          color={colors["neutral-text-title"]}
          weight={"700"}
          {...titleProps}
          style={[
            {
              textAlign: "center",
              paddingVertical: 8,
            },
            titleProps?.style,
          ]}
        >
          {title}
        </Text>
      ) : null}
      {subTitle && (
        <Text
          color={colors["neutral-text-body"]}
          size={14}
          weight={"500"}
          {...subTitleProps}
          style={[
            {
              textAlign: "center",
              paddingVertical: 8,
            },
            subTitleProps?.style,
          ]}
        >
          {subTitle}
        </Text>
      )}
      {/*<ContainerElement*/}
      {/*  {...props}*/}
      {/*  showsVerticalScrollIndicator={false}*/}
      {/*  keyboardDismissMode={"interactive"}*/}
      {/*  style={[*/}
      {/*    {*/}
      {/*      backgroundColor: colors["neutral-surface-card"],*/}
      {/*      flex: 1,*/}
      {/*      paddingBottom: 16 + (bottom || 0),*/}
      {/*    },*/}
      {/*    style,*/}
      {/*  ]}*/}
      {/*>*/}
      {/*  {props.children}*/}
      {/*</ContainerElement>*/}
      <Box
        backgroundColor={colors["neutral-surface-card"]}
        paddingX={12}
        paddingBottom={12}
      >
        {props.children}
      </Box>
      {buttonBottom ? buttonBottom : null}
    </View>
  );
};
export default WrapViewModal;
