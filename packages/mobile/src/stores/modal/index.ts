import { observable, action, makeObservable, computed } from "mobx";
import { ReactElement, ReactNode } from "react";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
interface IOptions {
  isOpen?: boolean;
  bottomSheetModalConfig: Omit<BottomSheetProps, "snapPoints" | "children">;
}
export class ModalStore {
  @observable
  protected options: IOptions;
  protected children: ReactElement | ReactNode;

  constructor() {
    this.options = {
      isOpen: false,
      bottomSheetModalConfig: null,
    };

    makeObservable(this);
  }

  @action
  setOptions(options?: IOptions) {
    this.options = {
      ...options,
      isOpen: true,
    };
  }

  @computed
  get getOptions() {
    return this.options;
  }

  @action
  setChildren(children: ReactElement | ReactNode) {
    this.children = children;
  }

  @action
  getChildren() {
    return this.children;
  }

  @action
  close() {
    this.options = {
      isOpen: false,
      bottomSheetModalConfig: null,
    };
    this.children = null;
  }
}
