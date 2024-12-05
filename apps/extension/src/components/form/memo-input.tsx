// import React, { CSSProperties, FunctionComponent, useState } from "react";
// import { IMemoConfig } from "@owallet/hooks";
// import { observer } from "mobx-react-lite";
// import { Input } from "./input";

// export interface MemoInputProps {
//   memoConfig: IMemoConfig;
//   label?: string;
//   className?: string;
//   placeholder?: string;
//   rows?: number;
//   disabled?: boolean;
//   inputStyle?: CSSProperties;
// }

// // TODO: Handle the max memo bytes length for each chain.
// export const MemoInput: FunctionComponent<MemoInputProps> = observer(
//   ({
//     memoConfig,
//     label,
//     className,
//     disabled = false,
//     placeholder,
//     inputStyle,
//   }) => {
//     const [inputId] = useState(() => {
//       const bytes = new Uint8Array(4);
//       crypto.getRandomValues(bytes);
//       return `input-${Buffer.from(bytes).toString("hex")}`;
//     });

//     return (
//       <div className={className}>
//         <Input
//           styleInputGroup={inputStyle}
//           label={label ?? ""}
//           placeHolder={placeholder ?? label}
//           id={inputId}
//           value={memoConfig.memo}
//           onChange={(e) => {
//             memoConfig.setMemo(e.target.value);
//             e.preventDefault();
//           }}
//           autoComplete="off"
//           disabled={disabled}
//         />
//       </div>
//     );
//   }
// );
