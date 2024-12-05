// import React, {
//   FunctionComponent,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import style from "./style.module.scss";
// import { useStore } from "../../stores";
// import classnames from "classnames";
// import { FormattedMessage, useIntl } from "react-intl";
// import { useHistory } from "react-router";
// import { observer } from "mobx-react-lite";
// import { ChainIdHelper } from "@owallet/cosmos";
// import { DetailsTabEvm } from "./details-tab-evm";
// import { DataTabEvm } from "./data-tab-evm";
// import { Dec, Int } from "@owallet/unit";
// import { Text } from "../../components/common/text";
// import { Address } from "../../components/address";
// import colors from "../../theme/colors";
// import { FeeModal } from "./modals/fee-modal";
// import { WalletStatus } from "@owallet/stores";
// import { DataModal } from "./modals/data-modal";
// import useOnClickOutside from "../../hooks/use-click-outside";
// import cn from "classnames/bind";
// import { Button } from "../../components/common/button";
// import { ModalFee } from "pages/modals/modal-fee";
// import { DataTab } from "./data-tab";
// import { handleExternalInteractionWithNoProceedNext } from "helpers/side-panel";
// import { useUnmount } from "../../hooks/use-unmount";
// import { isRunningInSidePanel } from "src/utils/side-panel";

// enum Tab {
//   Details,
//   Data,
// }

// const cx = cn.bind(style);

// export const SignEvmPage: FunctionComponent = observer(() => {
//   const history = useHistory();

//   const [tab, setTab] = useState<Tab>(Tab.Details);
//   const [dataSign, setDataSign] = useState(null);
//   const [openSetting, setOpenSetting] = useState(false);
//   const [dataSetting, setDataSetting] = useState(false);

//   const settingRef = useRef();
//   const dataRef = useRef();

//   const intl = useIntl();

//   const {
//     chainStore,
//     keyRingStore,
//     signInteractionStore,
//     accountStore,
//     queriesStore,
//   } = useStore();

//   return (
//     <div
//       style={{
//         height: isRunningInSidePanel() ? "100vh" : 580,
//         overflowX: "auto",
//         paddingBottom: 160,
//       }}
//     >
//     </div>
//   );
// });
