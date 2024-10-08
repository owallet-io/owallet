import { useTheme } from "@src/themes/theme-provider";
import { TextStyle, ViewStyle } from "react-native";
interface IMapStyle {
  btn: ViewStyle;
  text: TextStyle;
}

const useSize = ({ size }): IMapStyle => {
  let sizeStyle: IMapStyle;
  switch (size) {
    case "small":
      sizeStyle = {
        btn: {
          borderRadius: 8,
          height: 32,
        },
        text: {
          fontSize: 14,
          fontWeight: "700",
        },
      };
      break;
    case "medium":
      sizeStyle = {
        btn: {
          borderRadius: 12,
          height: 40,
        },
        text: {
          fontSize: 14,
          fontWeight: "400",
        },
      };
      break;
    case "large":
      sizeStyle = {
        btn: {
          borderRadius: 8,
          height: 48,
        },
        text: {
          fontSize: 14,
          fontWeight: "600",
        },
      };
      break;
    case "default":
      sizeStyle = {
        btn: {
          borderRadius: 8,
          height: 48,
        },
        text: {
          fontSize: 14,
          fontWeight: "600",
        },
      };
      break;
    default:
      sizeStyle = {
        btn: {
          borderRadius: 8,
          height: 55,
        },
        text: {
          fontSize: 16,
          fontWeight: "700",
        },
      };
      break;
  }
  return sizeStyle;
};

export const useMapStyles = ({
  type,
  disabled,
  size,
  contentAlign,
}): IMapStyle => {
  const { colors } = useTheme();
  const formatSize = useSize({ size });

  const getBackgroundColor = (type: string, disabled: boolean) => {
    switch (type) {
      case "danger":
        return disabled
          ? colors["background-btn-disable-danger"]
          : colors["error-surface-default"];
      case "primary":
        return disabled
          ? colors["neutral-surface-disable"]
          : colors["primary-surface-default"];
      case "secondary":
        return disabled
          ? colors["neutral-surface-disable"]
          : colors["neutral-surface-action3"];
      case "link":
        return "transparent";
      default:
        return disabled
          ? colors["primary-surface-disable"]
          : colors["primary-surface-default"];
    }
  };

  const getTextColor = (type: string, disabled: boolean) => {
    switch (type) {
      case "danger":
        return disabled
          ? colors["text-btn-disable-danger"]
          : colors["neutral-icon-on-dark"];
      case "primary":
        return disabled
          ? colors["neutral-text-action-on-dark-bg"]
          : colors["white"];
      case "secondary":
        return disabled
          ? colors["text-btn-disable-color"]
          : colors["neutral-text-action-on-light-bg"];
      case "link":
        return disabled
          ? colors["text-btn-disable-color"]
          : colors["primary-surface-default"];
      default:
        return disabled ? colors["neutral-text-disable"] : colors["white"];
    }
  };

  const getJustifyContent = (contentAlign: string) => {
    switch (contentAlign) {
      case "left":
        return "flex-start";
      case "right":
        return "flex-end";
      case "center":
      default:
        return "center";
    }
  };

  const typeStyleBtn: IMapStyle = {
    btn: {
      borderRadius: formatSize.btn.borderRadius,
      height: formatSize.btn.height,
      backgroundColor: getBackgroundColor(type, disabled),
      justifyContent: getJustifyContent(contentAlign),
    },
    text: {
      color: getTextColor(type, disabled),
      fontSize: formatSize.text.fontSize,
      fontWeight: formatSize.text.fontWeight,
    },
  };

  return typeStyleBtn;
};
