// import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
// import { RegisterConfig } from "@owallet/hooks";
// import { observer } from "mobx-react-lite";
// import { FormattedMessage, useIntl } from "react-intl";
// import { BIP44Option, useBIP44Option } from "../advanced-bip44";
// import style from "../style.module.scss";
// import { ButtonGroup, Form } from "reactstrap";
// import { Input, PasswordInput } from "../../../components/form";
// import { BackButton } from "../index";
// import { NewMnemonicConfig, useNewMnemonicConfig, NumWords } from "./hook";
// import { useStore } from "../../../stores";
// import { Button } from "../../../components/common/button";
// import { Text } from "../../../components/common/text";
// import { Card } from "../../../components/common/card";
// import useForm from "react-hook-form";
// import colors from "../../../theme/colors";
// import { toast } from "react-toastify";

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const bip39 = require("bip39");

// export const TypeNewMnemonic = "new-mnemonic";

// interface FormData {
//   name: string;
//   words: string;
//   password: string;
//   confirmPassword: string;
// }

// const MnemonicBoard: FunctionComponent<{
//   mnemonic: string;
//   type?: "solid" | "dashed";
//   onWordClick?: (index: number) => void;
// }> = ({ mnemonic, onWordClick, type = "solid" }) => {
//   return (
//     <div
//       style={{
//         border: `1px ${type}`,
//         borderRadius: 8,
//         borderColor: colors["primary-surface-default"],
//         padding: "12px 0px 8px 8px",
//         flexDirection: "row",
//         display: "flex",
//         flexWrap: "wrap",
//         width: "100%",
//       }}
//     >
//       {mnemonic.split(" ").map((word, index) => {
//         return (
//           <div
//             key={word + index}
//             onClick={() => {
//               onWordClick && onWordClick(index);
//             }}
//             style={{
//               cursor: "pointer",
//               padding: "4px 8px",
//               backgroundColor: colors["neutral-surface-action3"],
//               borderRadius: 999,
//               display: "flex",
//               flexDirection: "row",
//               alignItems: "center",
//               marginRight: 12,
//               marginBottom: 12,
//             }}
//           >
//             <div
//               style={{
//                 backgroundColor: colors["primary-surface-subtle"],
//                 borderRadius: 999,
//                 marginRight: 2,
//                 padding: 7,
//                 paddingTop: 0,
//                 paddingBottom: 0,
//               }}
//             >
//               <Text
//                 weight="600"
//                 color={colors["primary-surface-default"]}
//                 size={12}
//               >
//                 {index + 1}
//               </Text>
//             </div>
//             <Text weight="500">{word}</Text>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export const NewMnemonicIntro: FunctionComponent<{
//   registerConfig: RegisterConfig;
// }> = observer(({ registerConfig }) => {
//   const { analyticsStore } = useStore();

//   return (
//     <Button
//       onClick={(e) => {
//         e.preventDefault();

//         registerConfig.setType(TypeNewMnemonic);
//         analyticsStore.logEvent("Create account started", {
//           registerType: "seed",
//         });
//       }}
//       text={<FormattedMessage id="register.intro.button.new-account.title" />}
//     />
//   );
// });

// export const NewMnemonicPage: FunctionComponent<{
//   registerConfig: RegisterConfig;
// }> = observer(({ registerConfig }) => {
//   const newMnemonicConfig = useNewMnemonicConfig(registerConfig);
//   const bip44Option = useBIP44Option();

//   return (
//     <React.Fragment>
//       {newMnemonicConfig.mode === "generate" ? (
//         <GenerateMnemonicModePage
//           registerConfig={registerConfig}
//           newMnemonicConfig={newMnemonicConfig}
//           bip44Option={bip44Option}
//         />
//       ) : null}
//       {newMnemonicConfig.mode === "verify" ? (
//         <VerifyMnemonicModePage
//           registerConfig={registerConfig}
//           newMnemonicConfig={newMnemonicConfig}
//           bip44Option={bip44Option}
//         />
//       ) : null}
//     </React.Fragment>
//   );
// });

// export const GenerateMnemonicModePage: FunctionComponent<{
//   registerConfig: RegisterConfig;
//   newMnemonicConfig: NewMnemonicConfig;
//   bip44Option: BIP44Option;
// }> = observer(({ registerConfig, newMnemonicConfig, bip44Option }) => {
//   const intl = useIntl();

//   const { register, handleSubmit, getValues, errors, setValue } =
//     useForm<FormData>({
//       defaultValues: {
//         name: newMnemonicConfig.name,
//         words: newMnemonicConfig.mnemonic,
//         password: "",
//         confirmPassword: "",
//       },
//     });

//   return (
//     <div>
//       <Card
//         type="ink"
//         containerStyle={{
//           alignItems: "center",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//         }}
//       >
//         <Text containerStyle={{ textAlign: "center" }} size={28} weight="700">
//           Save your Recovery Phrase
//         </Text>
//         <Text
//           containerStyle={{ textAlign: "center" }}
//           weight="500"
//           color={colors["neutral-text-body"]}
//         >
//           Write down this recovery phrase in the exact order and keep it in a
//           safe place
//         </Text>
//       </Card>

//       <Form
//         className={style.formContainer}
//         onSubmit={handleSubmit(async (data: FormData) => {
//           newMnemonicConfig.setName(data.name);
//           newMnemonicConfig.setPassword(data.password);
//           newMnemonicConfig.setMode("verify");
//         })}
//       >
//         <Input
//           label={intl.formatMessage({
//             id: "register.name",
//           })}
//           leftIcon={<img src={require("assets/icon/wallet.svg")} alt="" />}
//           rightIcon={<img src={require("assets/icon/circle-del.svg")} alt="" />}
//           onAction={() => {
//             setValue("name", "");
//           }}
//           styleInputGroup={{}}
//           type="text"
//           name="name"
//           ref={register({
//             required: intl.formatMessage({
//               id: "register.name.error.required",
//             }),
//           })}
//           error={errors.name && errors.name.message}
//         />
//         <div className={style.titleGroup}>
//           <span />

//           <div style={{ float: "right" }}>
//             <ButtonGroup size="sm" style={{ marginBottom: "4px" }}>
//               <Button
//                 size="small"
//                 color={
//                   newMnemonicConfig.numWords !== NumWords.WORDS12
//                     ? "secondary"
//                     : "primary"
//                 }
//                 onClick={() => {
//                   newMnemonicConfig.setNumWords(NumWords.WORDS12);
//                 }}
//                 containerStyle={{ marginRight: 4 }}
//               >
//                 <FormattedMessage id="register.create.toggle.word12" />
//               </Button>
//               <Button
//                 size="small"
//                 color={
//                   newMnemonicConfig.numWords !== NumWords.WORDS24
//                     ? "secondary"
//                     : "primary"
//                 }
//                 onClick={() => {
//                   newMnemonicConfig.setNumWords(NumWords.WORDS24);
//                 }}
//               >
//                 <FormattedMessage id="register.create.toggle.word24" />
//               </Button>
//             </ButtonGroup>
//           </div>
//         </div>
//         <MnemonicBoard mnemonic={newMnemonicConfig.mnemonic} />
//         {/* <TextArea
//           className={style.mnemonic}
//           style={{
//             color: "#7664e4"
//           }}
//           autoCapitalize="none"
//           placeholder={intl.formatMessage({
//             id: "register.create.textarea.mnemonic.place-holder"
//           })}
//           name="words"
//           rows={newMnemonicConfig.numWords === NumWords.WORDS24 ? 5 : 3}
//           readOnly={true}
//           value={newMnemonicConfig.mnemonic}
//           ref={register({
//             required: "Mnemonic is required",
//             validate: (value: string): string | undefined => {
//               if (value.split(" ").length < 8) {
//                 return intl.formatMessage({
//                   id: "register.create.textarea.mnemonic.error.too-short"
//                 });
//               }

//               if (!bip39.validateMnemonic(value)) {
//                 return intl.formatMessage({
//                   id: "register.create.textarea.mnemonic.error.invalid"
//                 });
//               }
//             }
//           })}
//           error={errors.words && errors.words.message}
//         /> */}

//         <div
//           onClick={async (e) => {
//             e.preventDefault();
//             await navigator.clipboard.writeText(newMnemonicConfig.mnemonic);
//             toast("Copied!", {
//               type: "success",
//             });
//           }}
//           style={{
//             flexDirection: "row",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             width: "100%",
//             cursor: "pointer",
//             padding: 22,
//           }}
//         >
//           <img src={require("assets/icon/tdesign_copy.svg")} alt="" />
//           <Text color={colors["primary-text-action"]} weight="600">
//             Copy to clipboard
//           </Text>
//         </div>

//         {registerConfig.mode === "create" ? (
//           <React.Fragment>
//             <PasswordInput
//               placeHolder={intl.formatMessage({
//                 id: "register.create.input.password",
//               })}
//               styleInputGroup={{
//                 marginBottom: 15,
//               }}
//               name="password"
//               ref={register({
//                 required: intl.formatMessage({
//                   id: "register.create.input.password.error.required",
//                 }),
//                 validate: (password: string): string | undefined => {
//                   if (password.length < 8) {
//                     return intl.formatMessage({
//                       id: "register.create.input.password.error.too-short",
//                     });
//                   }
//                 },
//               })}
//               error={errors.password && errors.password.message}
//             />
//             <PasswordInput
//               placeHolder={intl.formatMessage({
//                 id: "register.create.input.confirm-password",
//               })}
//               styleInputGroup={{
//                 marginBottom: 15,
//               }}
//               name="confirmPassword"
//               ref={register({
//                 required: intl.formatMessage({
//                   id: "register.create.input.confirm-password.error.required",
//                 }),
//                 validate: (confirmPassword: string): string | undefined => {
//                   if (confirmPassword !== getValues()["password"]) {
//                     return intl.formatMessage({
//                       id: "register.create.input.confirm-password.error.unmatched",
//                     });
//                   }
//                 },
//               })}
//               error={errors.confirmPassword && errors.confirmPassword.message}
//             />
//           </React.Fragment>
//         ) : null}
//         {/* <AdvancedBIP44Option bip44Option={bip44Option} /> */}
//         <Button color="primary">
//           <FormattedMessage id="register.create.button.next" />
//         </Button>
//       </Form>
//       <BackButton
//         onClick={() => {
//           registerConfig.clear();
//         }}
//       />
//     </div>
//   );
// });

// export const VerifyMnemonicModePage: FunctionComponent<{
//   registerConfig: RegisterConfig;
//   newMnemonicConfig: NewMnemonicConfig;
//   bip44Option: BIP44Option;
// }> = observer(({ registerConfig, newMnemonicConfig, bip44Option }) => {
//   const wordsSlice = useMemo(() => {
//     const words = newMnemonicConfig.mnemonic.split(" ");
//     for (let i = 0; i < words.length; i++) {
//       words[i] = words[i].trim();
//     }
//     return words;
//   }, [newMnemonicConfig.mnemonic]);

//   const [randomizedWords, setRandomizedWords] = useState<string[]>([]);
//   const [suggestedWords, setSuggestedWords] = useState<string[]>([]);

//   useEffect(() => {
//     // Set randomized words.
//     const words = newMnemonicConfig.mnemonic.split(" ");
//     for (let i = 0; i < words.length; i++) {
//       words[i] = words[i].trim();
//     }
//     words.sort((word1, word2) => {
//       // Sort alpahbetically.
//       return word1 > word2 ? 1 : -1;
//     });
//     setRandomizedWords(words);
//     // Clear suggested words.
//     setSuggestedWords([]);
//   }, [newMnemonicConfig.mnemonic]);

//   const { analyticsStore } = useStore();

//   return (
//     <div>
//       <div>
//         <div className={style.buttons}>
//           {/* {suggestedWords.map((word, i) => {
//             return (
//               <Button
//                 key={word + i.toString()}
//                 onClick={() => {
//                   const word = suggestedWords[i];
//                   setSuggestedWords(suggestedWords.slice(0, i).concat(suggestedWords.slice(i + 1)));
//                   randomizedWords.push(word);
//                   setRandomizedWords(randomizedWords.slice());
//                 }}
//               >
//                 {word}
//               </Button>
//             );
//           })} */}

//           <MnemonicBoard
//             mnemonic={suggestedWords.join(" ")}
//             type="dashed"
//             onWordClick={(i) => {
//               const word = suggestedWords[i];
//               setSuggestedWords(
//                 suggestedWords.slice(0, i).concat(suggestedWords.slice(i + 1))
//               );
//               if (word !== "") {
//                 setRandomizedWords(randomizedWords.slice());
//               }
//               randomizedWords.push(word);
//             }}
//           />
//         </div>
//       </div>
//       {randomizedWords.length > 0 ? (
//         <div
//           style={{
//             border: "1px solid",
//             borderColor: colors["primary-surface-default"],
//             borderRadius: 8,
//             padding: "12px 0px 8px 8px",
//             marginTop: 27,
//             minHeight: 157,
//           }}
//         >
//           <div className={style.buttons}>
//             {randomizedWords.map((word, i) => {
//               return (
//                 <Button
//                   size="small"
//                   key={word + i.toString()}
//                   onClick={() => {
//                     const word = randomizedWords[i];
//                     setRandomizedWords(
//                       randomizedWords
//                         .slice(0, i)
//                         .concat(randomizedWords.slice(i + 1))
//                     );
//                     suggestedWords.push(word);
//                     setSuggestedWords(suggestedWords.slice());
//                   }}
//                 >
//                   {word}
//                 </Button>
//               );
//             })}
//           </div>
//         </div>
//       ) : null}

//       <Button
//         color="primary"
//         disabled={suggestedWords.join(" ") !== wordsSlice.join(" ")}
//         containerStyle={{
//           marginTop: "27px",
//         }}
//         onClick={async (e) => {
//           e.preventDefault();

//           try {
//             await registerConfig.createMnemonic(
//               newMnemonicConfig.name,
//               newMnemonicConfig.mnemonic,
//               newMnemonicConfig.password,
//               bip44Option.bip44HDPath
//             );
//             analyticsStore.setUserProperties({
//               registerType: "seed",
//               accountType: "mnemonic",
//             });
//           } catch (e) {
//             alert(e.message ? e.message : e.toString());
//             registerConfig.clear();
//           }
//         }}
//         data-loading={registerConfig.isLoading}
//         loading={registerConfig.isLoading}
//       >
//         <FormattedMessage id="register.verify.button.register" />
//       </Button>
//       <BackButton
//         onClick={() => {
//           newMnemonicConfig.setMode("generate");
//         }}
//       />
//     </div>
//   );
// });
