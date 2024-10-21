export const isRunningInSidePanel = (): boolean => {
  return new URL(window.location.href).pathname === "/sidePanel.html";
};

export const handleExternalInteractionWithNoProceedNext = () => {
  if (window.isStartFromInteractionWithSidePanelEnabled) {
    window.close();
  } else {
    if (isRunningInSidePanel()) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    } else {
      window.close();
    }
  }
};

export const handleExternalInteractionBeforeFnWithNoProceedNext = async (
  beforeFn: () => Promise<void>
) => {
  if (window.isStartFromInteractionWithSidePanelEnabled) {
    await beforeFn();
    window.close();
  } else {
    if (isRunningInSidePanel()) {
      if (window.history.length > 1) {
        await beforeFn();
        window.history.back();
      } else {
        await beforeFn();
        window.close();
      }
    } else {
      await beforeFn();
      window.close();
    }
  }
};
