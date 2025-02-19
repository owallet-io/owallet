import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { AppState, BackHandler, View, ViewStyle } from "react-native";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import { ModalBase } from "./base";
import { ModalContext, useModalState } from "./hooks";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
export interface ModalOptions {
  readonly align?: "top" | "center" | "bottom";
  readonly containerStyle?: ViewStyle;
  readonly disableSafeArea?: boolean;
}

export interface Modal {
  readonly key: string;
  readonly element: React.ElementType;
  isOpen: boolean;
  props: any;
  close: () => void;
  onCloseTransitionEnd: () => void;
  readonly bottomSheetModalConfig?: Omit<
    BottomSheetProps,
    "snapPoints" | "children"
  >;
  options: ModalOptions;
}

export class ModalsRendererState {
  @observable.shallow
  protected _modals: Modal[] = [];

  protected static lastKey: number = 0;

  protected static getKey(): string {
    ModalsRendererState.lastKey++;
    return ModalsRendererState.lastKey.toString();
  }

  constructor() {
    makeObservable(this);
  }

  get modals(): Modal[] {
    return this._modals;
  }

  @action
  pushModal<P>(
    modal: React.ElementType<P>,
    props: P,
    close: () => void,
    bottomSheetModalConfig,
    onCloseTransitionEnd: () => void,
    options: ModalOptions = {
      align: "bottom",
    }
  ): string {
    const key = ModalsRendererState.getKey();

    this._modals.push({
      key,
      element: modal,
      isOpen: true,
      close,
      onCloseTransitionEnd,
      props,
      bottomSheetModalConfig,
      options,
    });

    return key;
  }

  @action
  closeModal(key: string) {
    const index = this._modals.findIndex((modal) => modal.key === key);
    if (index >= 0) {
      this._modals[index] = {
        ...this._modals[index],
        isOpen: false,
      };
    }
  }

  @action
  updateModal(key: string, props: any) {
    const index = this._modals.findIndex((modal) => modal.key === key);
    if (index >= 0) {
      this._modals[index] = {
        ...this._modals[index],
        props,
      };
    }
  }

  @action
  removeModal(key: string) {
    const i = this._modals.findIndex((modal) => modal.key === key);
    if (i >= 0) {
      this._modals.splice(i, 1);
    }
  }
}

export const globalModalRendererState = new ModalsRendererState();

/*
 If the animation only works when the app is foreground.
 It let the modal to be stoped during closing on background.
 And when the app becomes foregound,the closing resumes.
 It looks strange and it make hard to estimate the modal unmounted.
 So, to prevent this problem, if the state is not in foreground, forcely remove the modals.
 */
AppState.addEventListener("change", (state) => {
  if (state !== "active" && state !== "inactive") {
    for (const modal of globalModalRendererState.modals) {
      if (!modal.isOpen) {
        globalModalRendererState.removeModal(modal.key);
      }
    }
  }
});

export const ModalsProvider: FunctionComponent = observer(({ children }) => {
  const hasOpenedModal =
    globalModalRendererState.modals.find((modal) => modal.isOpen) != null;

  useEffect(() => {
    if (hasOpenedModal) {
      const handler = () => {
        const openedModals = globalModalRendererState.modals.filter(
          (modal) => modal.isOpen
        );
        // The topmost modal can be closed by the back button if this modal can be closed by pressing the backdrop.
        if (openedModals.length > 0) {
          const topmost = openedModals[openedModals.length - 1];
          topmost.close();
          return true;
        }
      };

      BackHandler.addEventListener("hardwareBackPress", handler);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", handler);
      };
    }
  }, [hasOpenedModal]);

  return (
    <React.Fragment>
      {children}
      {globalModalRendererState.modals.length > 0 ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
          pointerEvents="box-none"
        >
          <ModalRenderersRoot />
        </View>
      ) : null}
    </React.Fragment>
  );
});

export const ModalRenderersRoot: FunctionComponent = observer(() => {
  return (
    <React.Fragment>
      {globalModalRendererState.modals.map((modal) => {
        return <ModalRenderer key={modal.key} modal={modal} />;
      })}
    </React.Fragment>
  );
}) as FunctionComponent;

export const ModalRenderer: FunctionComponent<{
  modal: Modal;
}> = observer(({ modal }) => {
  const [isOpenTransitioning, setIsOpenTransitioning] = useState(true);
  return (
    <ModalContext.Provider
      value={useMemo(() => {
        return {
          key: modal.key,
          isTransitionClosing: !modal.isOpen,
          isTransitionOpening: isOpenTransitioning,
          align: modal.options.align,
          isOpen: modal.props.isOpen,
          bottomSheetModalConfig: modal.bottomSheetModalConfig,
          close: modal.close,
        };
      }, [
        isOpenTransitioning,
        modal.close,
        modal.isOpen,
        modal.key,
        modal.options.align,
        modal.props.isOpen,
        modal.bottomSheetModalConfig,
      ])}
    >
      <ModalBase
        align={modal.options.align}
        isOpen={modal.isOpen}
        onOpenTransitionEnd={() => {
          setIsOpenTransitioning(false);
        }}
        onCloseTransitionEnd={() => {
          globalModalRendererState.removeModal(modal.key);
          modal.onCloseTransitionEnd();
        }}
        close={() => {
          modal.close();
        }}
        bottomSheetModalConfig={modal.bottomSheetModalConfig}
        containerStyle={modal.options.containerStyle}
        disableSafeArea={modal.options.disableSafeArea}
      >
        {React.createElement(modal.element, modal.props)}
      </ModalBase>
    </ModalContext.Provider>
  );
});
