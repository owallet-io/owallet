// import React, { FunctionComponent, useState } from "react";
// import { observer } from "mobx-react-lite";
// import { FormattedMessage, useIntl } from "react-intl";
// import { useHistory } from "react-router";
// import style from "../style.module.scss";
// import {
//   Button,
//   ButtonDropdown,
//   DropdownItem,
//   DropdownMenu,
//   DropdownToggle,
//   Modal,
//   ModalBody,
//   Popover,
//   PopoverBody,
// } from "reactstrap";
// import styleAddressBook from "./style.module.scss";
// import { useStore } from "../../../stores";
// // import { PageButton } from "../page-button";
// import { AddAddressModal } from "./add-address-modal";
// import { ExtensionKVStore, EthereumEndpoint } from "@owallet/common";
// import { Bech32Address } from "@owallet/cosmos";
// import { useConfirm } from "../../../components/confirm";
// import {
//   AddressBookSelectHandler,
//   IIBCChannelConfig,
//   IMemoConfig,
//   IRecipientConfig,
//   useAddressBookConfig,
//   useMemoConfig,
//   useRecipientConfig,
// } from "@owallet/hooks";
// import { Input } from "../../../components/form";

// export const AddressBookPage: FunctionComponent<{
//   onBackButton?: () => void;
//   hideChainDropdown?: boolean;
//   selectHandler?: AddressBookSelectHandler;
//   ibcChannelConfig?: IIBCChannelConfig;
//   isInTransaction?: boolean;
//   isCloseIcon?: boolean;
// }> = observer(
//   ({
//     onBackButton,
//     hideChainDropdown,
//     selectHandler,
//     ibcChannelConfig,
//     isCloseIcon,
//     //isInTransaction,
//   }) => {
//     const intl = useIntl();
//     const history = useHistory();

//     const { chainStore } = useStore();
//     const current = chainStore.current;

//     const [selectedChainId, setSelectedChainId] = useState(
//       ibcChannelConfig?.channel
//         ? ibcChannelConfig.channel.counterpartyChainId
//         : current.chainId
//     );

//     const recipientConfig = useRecipientConfig(
//       chainStore,
//       selectedChainId,
//       EthereumEndpoint
//     );
//     const memoConfig = useMemoConfig(chainStore, selectedChainId);

//     const addressBookConfig = useAddressBookConfig(
//       new ExtensionKVStore("address-book"),
//       chainStore,
//       selectedChainId,
//       selectHandler
//         ? selectHandler
//         : {
//             setRecipient: (): void => {
//               // noop
//             },
//             setMemo: (): void => {
//               // noop
//             },
//           }
//     );
//     const [addressBookList, setAddressBookList] = useState(
//       addressBookConfig.addressBookDatas
//     );
//     const [search, setSearch] = useState("");
//     React.useEffect(() => {
//       if (search) {
//         setAddressBookList(
//           addressBookConfig.addressBookDatas.filter(
//             (add) => add.name.includes(search) || add.address.includes(search)
//           )
//         );
//       } else {
//         setAddressBookList(addressBookConfig.addressBookDatas);
//       }
//       return () => {};
//     }, [addressBookConfig?.addressBookDatas, search]);

//     const [dropdownOpen, setOpen] = useState(false);
//     const toggle = () => setOpen(!dropdownOpen);

//     const [typeAddress, setTypeAddress] = useState("Add");
//     const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);
//     const [addAddressModalIndex, setAddAddressModalIndex] = useState(-1);
//     // const [modalMore, setModalMore] = useState(false);
//     const confirm = useConfirm();

//     // const addressBookIcons = (index: number, name?: string) => {
//     //   return [
//     //     <i
//     //       key="edit"
//     //       className="fas fa-pen"
//     //       style={{ cursor: 'pointer' }}
//     //       onClick={(e) => {
//     //         e.preventDefault();
//     //         e.stopPropagation();
//     //         setTypeAddress('Edit');
//     //         setAddAddressModalOpen(true);
//     //         setAddAddressModalIndex(index);
//     //       }}
//     //     />,
//     //     <i
//     //       key="remove"
//     //       className="fas fa-trash"
//     //       style={{ cursor: 'pointer' }}
//     //       onClick={async (e) => {
//     //         e.preventDefault();
//     //         e.stopPropagation();

//     //         if (
//     //           await confirm.confirm({
//     //             styleYesBtn: {
//     //               background: '#EF466F'
//     //             },
//     //             styleModalBody: {
//     //               backgroundColor: '#353945'
//     //             },
//     //             styleNoBtn: {
//     //               backgroundColor: '#F8F8F9',
//     //               color: '#777E90'
//     //             },
//     //             yes: 'Delete',
//     //             no: 'Cancel',
//     //             title: name,
//     //             paragraph: intl.formatMessage({
//     //               id: 'setting.address-book.confirm.delete-address.paragraph'
//     //             })
//     //           })
//     //         ) {
//     //           setAddAddressModalOpen(false);
//     //           setAddAddressModalIndex(-1);
//     //           await addressBookConfig.removeAddressBook(index);
//     //         }
//     //       }}
//     //     />
//     //   ];
//     // };

//     return (
//       <>
//         {!isCloseIcon && (
//           <div
//             onClick={onBackButton}
//             style={{
//               cursor: "pointer",
//               textAlign: "right",
//             }}
//           >
//             <img src={require("assets/img/close.svg")} alt="total-balance" />
//           </div>
//         )}
//         <div className={styleAddressBook.container}>
//           <div
//             className={styleAddressBook.innerTopContainer}
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//             }}
//           >
//             {hideChainDropdown ? null : (
//               <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
//                 <DropdownToggle
//                   caret
//                   style={{ boxShadow: "none", paddingLeft: 0 }}
//                 >
//                   {chainStore.getChain(selectedChainId).chainName}
//                 </DropdownToggle>
//                 <DropdownMenu>
//                   {chainStore.chainInfos.map((chainInfo) => {
//                     return (
//                       <DropdownItem
//                         key={chainInfo.chainId}
//                         onClick={() => {
//                           setSelectedChainId(chainInfo.chainId);
//                         }}
//                         className={styleAddressBook.chainItem}
//                       >
//                         {chainInfo.chainName}
//                       </DropdownItem>
//                     );
//                   })}
//                 </DropdownMenu>
//               </ButtonDropdown>
//             )}
//             <div className={styleAddressBook.addressBtnWrap}>
//               <div
//                 onClick={(e) => {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   setTypeAddress("Add");
//                   setAddAddressModalOpen(true);
//                   setAddAddressModalIndex(-1);
//                 }}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   cursor: "pointer",
//                 }}
//               >
//                 <img
//                   src={require("assets/svg/add-account.svg")}
//                   alt=""
//                   style={{ marginRight: 4 }}
//                 />
//                 <span style={{ fontSize: 12, fontWeight: 600 }}>
//                   <FormattedMessage id="setting.address-book.button.add" />
//                 </span>
//               </div>
//             </div>
//           </div>
//           <div>
//             <Input
//               type={"text"}
//               classNameInputGroup={styleAddressBook.inputGroup}
//               className={styleAddressBook.input}
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//               }}
//               placeholder={"Search Name/Address"}
//               rightIcon={
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     width: 50,
//                     backgroundColor: "rgba(230, 232, 236, 0.2)",
//                   }}
//                 >
//                   <img src={require("assets/img/light.svg")} alt="" />
//                 </div>
//               }
//             />
//           </div>
//           <div style={{ flex: "1 1 0", overflowY: "auto" }}>
//             {addressBookList.map((data, i) => {
//               return (
//                 // <PageButton
//                 //   key={i.toString()}
//                 //   title={data.name}
//                 //   paragraph={
//                 //     data.address.indexOf(
//                 //       chainStore.getChain(selectedChainId).bech32Config
//                 //         .bech32PrefixAccAddr
//                 //     ) === 0
//                 //       ? Bech32Address.shortenAddress(data.address, 34)
//                 //       : data.address
//                 //   }
//                 //   subParagraph={data.memo}
//                 //   styleParagraph={{
//                 //     maxWidth: 220,
//                 //     fontWeight: 500,
//                 //     fontSize: 14,
//                 //     color: "#777E90",
//                 //   }}
//                 //   styleTitle={{
//                 //     fontWeight: 600,
//                 //     fontSize: 14,
//                 //     color: "#353945",
//                 //   }}
//                 //   // icons={addressBookIcons(i, data.name)}
//                 //   data-index={i}
//                 //   icons={[
//                 //     <AddressBookTools
//                 //       setTypeAddress={setTypeAddress}
//                 //       setAddAddressModalIndex={setAddAddressModalIndex}
//                 //       index={i}
//                 //       setAddAddressModalOpen={setAddAddressModalOpen}
//                 //       handleDelete={async (e) => {
//                 //         e.preventDefault();
//                 //         e.stopPropagation();
//                 //         if (
//                 //           await confirm.confirm({
//                 //             styleYesBtn: {
//                 //               background: "#EF466F",
//                 //             },
//                 //             styleModalBody: {
//                 //               backgroundColor: "#353945",
//                 //             },
//                 //             styleNoBtn: {
//                 //               backgroundColor: "#F8F8F9",
//                 //               color: "#777E90",
//                 //             },
//                 //             yes: "Delete",
//                 //             no: "Cancel",
//                 //             // title: name,
//                 //             paragraph: intl.formatMessage({
//                 //               id: "setting.address-book.confirm.delete-address.paragraph",
//                 //             }),
//                 //           })
//                 //         ) {
//                 //           setAddAddressModalOpen(false);
//                 //           setAddAddressModalIndex(-1);
//                 //           await addressBookConfig.removeAddressBook(i);
//                 //         }
//                 //       }}
//                 //     />,
//                 //   ]}
//                 //   onClick={(e) => {
//                 //     e.preventDefault();
//                 //     e.stopPropagation();

//                 //     addressBookConfig.selectAddressAt(i);

//                 //     if (onBackButton) {
//                 //       onBackButton();
//                 //     }
//                 //   }}
//                 //   style={{ cursor: selectHandler ? undefined : "auto" }}
//                 // />
//                 <></>
//               );
//             })}
//           </div>
//         </div>
//         {addAddressModalOpen ? (
//           <>
//             <hr
//               className="my-3"
//               style={{
//                 height: 1,
//                 borderTop: "1px solid #E6E8EC",
//               }}
//             />
//             <AddAddressModal
//               closeModal={() => {
//                 setAddAddressModalOpen(false);
//                 setAddAddressModalIndex(-1);
//               }}
//               recipientConfig={recipientConfig}
//               memoConfig={memoConfig}
//               addressBookConfig={addressBookConfig}
//               index={addAddressModalIndex}
//               chainId={selectedChainId}
//               typeAddress={typeAddress}
//             />
//           </>
//         ) : null}
//       </>
//     );
//   }
// );

// const AddressBookTools: FunctionComponent<{
//   index?: number;
//   setAddAddressModalOpen?: any;
//   setAddAddressModalIndex?: any;
//   handleDelete?: (e) => void;
//   setTypeAddress?: any;
// }> = ({
//   setAddAddressModalOpen,
//   handleDelete,
//   index,
//   setAddAddressModalIndex,
//   setTypeAddress,
// }) => {
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

//   const [tooltipId] = useState(() => {
//     const bytes = new Uint8Array(4);
//     crypto.getRandomValues(bytes);
//     return `tools-${Buffer.from(bytes).toString("hex")}`;
//   });

//   return (
//     <React.Fragment>
//       <Popover
//         target={tooltipId}
//         isOpen={isOpen}
//         toggle={toggleOpen}
//         placement="auto-start"
//         className={styleAddressBook.popoverContainer}
//         hideArrow
//       >
//         <PopoverBody className={styleAddressBook.popoverContainer}>
//           <div
//             className={styleAddressBook.popoverItem}
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               setIsOpen(false);
//               setTypeAddress("Edit");
//               setAddAddressModalIndex(index);
//               setAddAddressModalOpen(true);
//             }}
//           >
//             <FormattedMessage id="setting.address-book.button.edit" />
//           </div>
//           <div
//             className={styleAddressBook.popoverItem}
//             onClick={(e) => {
//               setIsOpen(false);
//               handleDelete(e);
//             }}
//           >
//             <FormattedMessage id="setting.address-book.button.delete" />
//           </div>
//         </PopoverBody>
//       </Popover>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           height: "100%",
//           padding: "0 8px",
//           cursor: "pointer",
//           color: "#353945",
//         }}
//         onClick={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           setIsOpen(true);
//         }}
//       >
//         <i id={tooltipId} className="fas fa-ellipsis-h" />
//       </div>
//     </React.Fragment>
//   );
// };
