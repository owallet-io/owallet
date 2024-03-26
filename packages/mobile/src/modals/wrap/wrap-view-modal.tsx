import { StyleProp, View, ViewProps } from "react-native";
import { FC, ReactNode } from "react";
import { Text } from "@src/components/text";
import { OWTextProps } from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
interface IWrapViewModal extends ViewProps {
  title?: string;
  subTitle?: string;
  TitleComponent?: ReactNode;
  titleProps?: OWTextProps;
  subTitleProps?: OWTextProps;
  disabledScrollView?: boolean;
}

const WrapViewModal: FC<IWrapViewModal> = ({
  title,
  subTitle,
  titleProps,
  subTitleProps,
  style,
  TitleComponent,
  disabledScrollView = true,
  ...props
}) => {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const ContainerElement = disabledScrollView ? View : ScrollView;
  return (
    <ContainerElement
      {...props}
      keyboardDismissMode={"interactive"}
      style={[
        {
          backgroundColor: colors["neutral-surface-card"],
          flex: 1,
          padding: 16,
          paddingBottom: 16 + (bottom || 0),
        },
        style,
      ]}
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
      {props.children}
    </ContainerElement>
  );
};
export default WrapViewModal;
