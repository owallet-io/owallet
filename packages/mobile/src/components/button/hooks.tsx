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
  let typeStyleBtn: IMapStyle;
  switch (type) {
    case "danger":
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: disabled
            ? colors["background-btn-disable-danger"]
            : colors["error-surface-default"],
        },
        text: {
          color: disabled
            ? colors["text-btn-disable-danger"]
            : colors["neutral-icon-on-dark"],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight,
        },
      };
      break;
    case "primary":
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: disabled
            ? colors["neutral-surface-disable"]
            : colors["primary-surface-default"],
        },
        text: {
          color: disabled
            ? colors["neutral-text-action-on-dark-bg"]
            : colors["white"],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight,
        },
      };
      break;
    case "secondary":
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: disabled
            ? colors["neutral-surface-disable"]
            : colors["neutral-surface-action3"],
        },
        text: {
          color: disabled
            ? colors["text-btn-disable-color"]
            : colors["neutral-text-action-on-light-bg"],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight,
        },
      };
      break;
    case "link":
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: "transparent",
        },
        text: {
          color: disabled
            ? colors["text-btn-disable-color"]
            : colors["primary-surface-default"],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight,
        },
      };
      break;

    default:
      typeStyleBtn = {
        btn: {
          borderRadius: formatSize.btn.borderRadius,
          height: formatSize.btn.height,
          backgroundColor: disabled
            ? colors["primary-surface-disable"]
            : colors["primary-surface-default"],
        },
        text: {
          color: disabled ? colors["neutral-text-disable"] : colors["white"],
          fontSize: formatSize.text.fontSize,
          fontWeight: formatSize.text.fontWeight,
        },
      };
      break;
  }
  switch (contentAlign) {
    case "left":
      typeStyleBtn = {
        ...typeStyleBtn,
        btn: {
          ...typeStyleBtn.btn,
          justifyContent: "flex-start",
        },
      };
      break;
    case "center":
      typeStyleBtn = {
        ...typeStyleBtn,
        btn: {
          ...typeStyleBtn.btn,
          justifyContent: "center",
        },
      };
      break;
    case "right":
      typeStyleBtn = {
        ...typeStyleBtn,
        btn: {
          ...typeStyleBtn.btn,
          justifyContent: "flex-end",
        },
      };
      break;
    default:
      typeStyleBtn = {
        ...typeStyleBtn,
        btn: {
          ...typeStyleBtn.btn,
          justifyContent: "center",
        },
      };
      break;
  }
  return typeStyleBtn;
};
