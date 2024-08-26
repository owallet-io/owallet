import { ReactNode } from "react";

interface IContainerModal {
  data: any;
  renderItem: any;
  title?: string;
}
interface IItemModal {
  item?: any;
  active?: any;
  onPress?: any;
  iconComponent?: ReactNode;
  label?: string;
  value?: string;
  subLabel?: string;
}
