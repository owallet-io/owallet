export type AxisAlignX = "left" | "right" | "center";
export type AxisAlignY = "top" | "bottom" | "center";

export interface XAxisProps {
  alignY?: AxisAlignY;
  style?: any;
}

export interface YAxisProps {
  alignX?: AxisAlignX;
  style?: any;
}
