import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { TextInput } from "../../components/input";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Button } from "../../components/button";
import { Gutter } from "../../components/gutter";
import { Box } from "../../components/box";
import { TextButton } from "../../components/button-text";
import { ColorPalette } from "../../styles";
import { H1, Subtitle4 } from "../../components/typography";
import { Tooltip } from "../../components/tooltip";
import AnimLogo from "../../public/assets/lottie/unlock/logo.json";
import AnimLogoLight from "../../public/assets/lottie/unlock/logo-light.json";
import lottie, { AnimationItem } from "lottie-web";
import { GuideBox } from "../../components/guide-box";
import { LoadingIcon } from "../../components/icon";
import { XAxis } from "../../components/axis";
import { autorun } from "mobx";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { Buffer } from "buffer/";
import { handleExternalInteractionWithNoProceedNext } from "../../utils";
import images from "assets/images";

export const UnlockPage: FunctionComponent = observer(() => {
  const { keyRingStore, interactionStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const [isStartWithMigrating] = useState(() => keyRingStore.isMigrating);
  useEffect(() => {
    if (isStartWithMigrating) {
      autorun(() => {
        if (!keyRingStore.isMigrating) {
          window.close();
        }
      });
    }
  }, [isStartWithMigrating, keyRingStore.isMigrating]);

  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const [isMigrationSecondPhase, setIsMigrationSecondPhase] = useState(false);

  const [migrationSecondPhasePassword, setMigrationSecondPhasePassword] =
    useState("");

  // const animContainerRef = useRef<HTMLDivElement | null>(null);
  // const animRef = useRef<AnimationItem | null>(null);
  // useEffect(() => {
  //   if (animContainerRef.current) {
  //     const anim = lottie.loadAnimation({
  //       container: animContainerRef.current,
  //       renderer: "svg",
  //       loop: true,
  //       autoplay: false,
  //       animationData: theme.mode === "light" ? AnimLogoLight : AnimLogo,
  //     });

  //     animRef.current = anim;

  //     return () => {
  //       anim.destroy();

  //       animRef.current = null;
  //     };
  //   }
  // }, []);

  // const animLoading = isLoading || keyRingStore.isMigrating;
  // useEffect(() => {
  //   if (animRef.current) {
  //     if (animLoading) {
  //       animRef.current.goToAndPlay(0);
  //     } else {
  //       setTimeout(() => {
  //         animRef.current?.goToAndStop(0);
  //       }, 50);
  //     }
  //   }
  // }, [animLoading]);

  const [viewPostMessageId] = useState(() => {
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    return Buffer.from(bytes).toString("hex");
  });

  const tryUnlock = async (password: string) => {
    try {
      setIsLoading(true);

      await keyRingStore.unlockWithoutSyncStatus(password);

      let closeWindowAfterProceedNext = false;

      // Approve all waiting interaction for the enabling key ring.
      const interactions = interactionStore.getAllData("unlock");
      if (interactions.length > 0) {
        let onlyHasExternal = true;
        for (const interaction of interactions) {
          if (interaction.isInternal) {
            onlyHasExternal = false;
          }
        }
        await interactionStore.approveWithProceedNextV2(
          interactions.map((interaction) => interaction.id),
          {},
          (proceedNext) => {
            if (onlyHasExternal) {
              if (!proceedNext) {
                closeWindowAfterProceedNext = true;
              }
            }
          }
        );
      }

      for (const view of browser.extension.getViews()) {
        view.postMessage(
          {
            type: "__keplr_unlocked_from_view",
            viewId: viewPostMessageId,
          },
          window.location.origin
        );
      }

      if (closeWindowAfterProceedNext) {
        handleExternalInteractionWithNoProceedNext();
      }

      await keyRingStore.refreshKeyRingStatus();

      setError(undefined);
    } catch (e) {
      console.log(e);
      setError(e);

      setIsMigrationSecondPhase(false);
      setMigrationSecondPhasePassword("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (e.data?.type === "__keplr_unlocked_from_view") {
        if (e.data.viewId !== viewPostMessageId) {
          let closeWindowAfterProceedNext = false;

          // Approve all waiting interaction for the enabling key ring.
          const interactions = interactionStore.getAllData("unlock");
          if (interactions.length > 0) {
            let onlyHasExternal = true;
            for (const interaction of interactions) {
              if (interaction.isInternal) {
                onlyHasExternal = false;
              }
            }
            await interactionStore.approveWithProceedNextV2(
              interactions.map((interaction) => interaction.id),
              {},
              (proceedNext) => {
                if (onlyHasExternal) {
                  if (!proceedNext) {
                    closeWindowAfterProceedNext = true;
                  }
                }
              }
            );
          }

          if (closeWindowAfterProceedNext) {
            handleExternalInteractionWithNoProceedNext();
          }

          keyRingStore.refreshKeyRingStatus();
        }
      }
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, [interactionStore, keyRingStore, viewPostMessageId]);

  return (
    <Box height="100vh" paddingX="1.5rem">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (isMigrationSecondPhase) {
            return;
          }

          if (keyRingStore.needMigration) {
            try {
              setIsLoading(true);

              await keyRingStore.checkLegacyKeyRingPassword(password);
              setIsMigrationSecondPhase(true);
              setMigrationSecondPhasePassword(password);

              setError(undefined);
            } catch (e) {
              console.log(e);
              setError(e);
            } finally {
              setIsLoading(false);
            }
          } else {
            await tryUnlock(password);
          }
        }}
      >
        <Box alignX="center">
          <Gutter size="6rem" />

          {/* <div
            ref={animContainerRef}
            style={{
              width: "12rem",
              height: "9.5rem",
            }}
          /> */}

          <img height={200} src={images.img_owallet} alt="img_owallet" />
        </Box>

        <ParagraphSection
          needMigration={keyRingStore.needMigration}
          isMigrationSecondPhase={
            isMigrationSecondPhase || keyRingStore.isMigrating
          }
        />

        <BottomFormSection
          password={password}
          setPassword={setPassword}
          error={error}
          setError={setError}
          isMigrationSecondPhase={
            isMigrationSecondPhase || keyRingStore.isMigrating
          }
        />

        {(() => {
          if (isMigrationSecondPhase || keyRingStore.isMigrating) {
            return (
              <Box position="relative">
                <Button
                  type="button"
                  text={intl.formatMessage({
                    id: "page.unlock.star-migration-button",
                  })}
                  size="large"
                  disabled={keyRingStore.isMigrating}
                  style={{
                    opacity: keyRingStore.isMigrating ? 0 : 1,
                  }}
                  isLoading={isLoading}
                  onClick={() => {
                    tryUnlock(migrationSecondPhasePassword);
                  }}
                />

                {keyRingStore.isMigrating ? (
                  <Box
                    position="absolute"
                    style={{
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                    alignX="center"
                    alignY="center"
                  >
                    <XAxis alignY="center">
                      <Subtitle4
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-300"]
                            : ColorPalette["gray-200"]
                        }
                      >
                        <FormattedMessage id="page.unlock.upgrade-in-progress" />
                      </Subtitle4>
                      <Gutter size="0.5rem" />
                      <LoadingIcon
                        color={ColorPalette["gray-200"]}
                        width="1.5rem"
                        height="1.5rem"
                      />
                    </XAxis>
                  </Box>
                ) : null}
              </Box>
            );
          }

          return (
            <Button
              type="submit"
              text={intl.formatMessage({ id: "page.unlock.unlock-button" })}
              size="large"
              disabled={password.length === 0}
              isLoading={
                isLoading ||
                (() => {
                  const interactions = interactionStore.getAllData("unlock");
                  for (const interaction of interactions) {
                    if (
                      interactionStore.isObsoleteInteraction(interaction.id)
                    ) {
                      return true;
                    }
                  }
                  return false;
                })()
              }
            />
          );
        })()}

        <Gutter size="3.125rem" />
        {/* 
        {!isMigrationSecondPhase && !keyRingStore.isMigrating ? (
          <TextButton
            text={intl.formatMessage({
              id: "page.unlock.forgot-password-button",
            })}
            type="button"
            size="small"
            color="faint"
            onClick={() => {
              browser.tabs.create({
                url: `https://help.keplr.app/faq?tab=3&topic=5`,
              });
            }}
            style={{ width: "100%", color: ColorPalette["gray-300"] }}
          />
        ) : null} */}
      </form>
    </Box>
  );
});

const ParagraphSection: FunctionComponent<{
  needMigration: boolean;
  isMigrationSecondPhase: boolean;
}> = ({ needMigration, isMigrationSecondPhase }) => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Box
        minHeight={needMigration ? "5rem" : "3.5rem"}
        alignX="center"
        alignY="center"
        style={{
          textAlign: "center",
        }}
      >
        {needMigration ? (
          <React.Fragment>
            <H1
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            >
              <FormattedMessage id="page.unlock.paragraph-section.keplr-here" />
            </H1>
            <Gutter size="0.75rem" />
            <Subtitle4
              color={ColorPalette["gray-200"]}
              style={{
                opacity: isMigrationSecondPhase ? 0 : 1,
              }}
            >
              <FormattedMessage id="page.unlock.paragraph-section.enter-password-to-upgrade" />
            </Subtitle4>

            <Gutter size="1.25rem" />
          </React.Fragment>
        ) : (
          <H1
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["white"]
            }
          >
            <FormattedMessage id="page.unlock.paragraph-section.welcome-back" />
          </H1>
        )}
      </Box>
    </React.Fragment>
  );
};

const BottomFormSection: FunctionComponent<{
  password: string;
  setPassword: (password: string) => void;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;

  isMigrationSecondPhase: boolean;
}> = ({ password, setPassword, error, setError, isMigrationSecondPhase }) => {
  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      // Focus the input element at start.
      inputRef.current.focus();
    }
  }, []);

  const [isOnCapsLock, setIsOnCapsLock] = useState(false);

  return (
    <React.Fragment>
      <Box position="relative" width="100%">
        <Box
          position="absolute"
          alignY="center"
          style={{
            top: 0,
            left: 20,
            bottom: 0,
          }}
        >
          <Tooltip
            content={
              <div style={{ whiteSpace: "nowrap" }}>
                <FormattedMessage id="page.unlock.bottom-section.capslock-tooltip" />
              </div>
            }
            enabled={false}
            isAlwaysOpen={isOnCapsLock}
          >
            <div />
          </Tooltip>
        </Box>

        <Gutter size="0.75rem" />
        <Box position="relative">
          <TextInput
            disabled={isMigrationSecondPhase}
            style={{
              opacity: isMigrationSecondPhase ? 0 : 1,
            }}
            ref={inputRef}
            label={intl.formatMessage({
              id: "page.unlock.bottom-section.password-input-label",
            })}
            type="password"
            value={password}
            onChange={(e) => {
              e.preventDefault();

              setPassword(e.target.value);

              // Clear error if the user is typing.
              setError(undefined);
            }}
            onBlur={() => {
              setIsOnCapsLock(false);
            }}
            onKeyUp={(e) => {
              if (e.getModifierState("CapsLock")) {
                setIsOnCapsLock(true);
              } else {
                setIsOnCapsLock(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.getModifierState("CapsLock")) {
                setIsOnCapsLock(true);
              } else {
                setIsOnCapsLock(false);
              }
            }}
            error={
              error
                ? intl.formatMessage({ id: "error.invalid-password" })
                : undefined
            }
          />

          {isMigrationSecondPhase ? (
            <Box
              position="absolute"
              style={{
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <GuideBox
                color="warning"
                title={intl.formatMessage({
                  id: "page.unlock.bottom-section.guide-title",
                })}
                paragraph={intl.formatMessage({
                  id: "page.unlock.bottom-section.guide-paragraph",
                })}
              />
            </Box>
          ) : null}
        </Box>
      </Box>

      <Gutter size="2.125rem" />
    </React.Fragment>
  );
};
