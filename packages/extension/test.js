// // var cssCode = `
// // "neutral-surface-bg": ["#121511", "#F5F5F7"],
// // "neutral-surface-bg2": ["#323133", "#F5F5F7"],
// // "neutral-surface-card": ["#242325", "#FFFFFF"],
// // "neutral-surface-action": ["#323133", "#EBEDF2"],
// // "neutral-surface-action2": ["#323133", "#EBEDF2"],
// // "neutral-surface-action3": ["#323133", "#F5F5F7"],
// // "neutral-surface-toggle-active": ["#494949", "#fff"],
// // "neutral-surface-pressed": ["#6A6B71", "#D4D7E1"],
// // "neutral-surface-disable": ["#323133", "#EBEDF2"],
// // "neutral-border-default": ["#323133", "#EBEDF2"],
// // "neutral-border-strong": ["#6A6B71", "#242325"],
// // "neutral-border-bold": ["#909298", "#242325"],
// // "neutral-border-disable": ["#242325", "#F5F5F7"],
// // "neutral-text-heading": ["#EBEDF2", "#242325"],
// // "neutral-text-title": ["#F5F5F7", "#242325"],
// // "neutral-text-body": ["#909298", "#6A6B71"],
// // "neutral-text-body2": ["#909298", "#494949"],
// // "neutral-text-action-on-dark-bg": ["#242325", "#FBFBFB"],
// // "neutral-text-action-on-light-bg": ["#FBFBFB", "#242325"],
// // "neutral-text-disable": ["#494949", "#C6C8CE"],
// // "neutral-icon-on-dark": ["#FBFBFB", "#FBFBFB"],
// // "neutral-icon-on-light": ["#FBFBFB", "#242325"],
// // "neutral-icon-disable": ["#494949", "#C6C8CE"],
// // // II.Primary
// // "primary-surface-disable": ["#5C00A3", "#EBD1FF"],
// // "primary-surface-subtle": ["#3D006B", "#F4E5FF"],
// // "primary-surface-active": ["#5C00A3", "#C170FF"],
// // "primary-surface-default": ["#9D81EB", "#5C00A3"],
// // "primary-surface-pressed": ["#A22DFF", "#7C00DB"],
// // "primary-text-action": ["#C170FF", "#7C00DB"],
// // "primary-text-pressed": ["#AD42FF", "#A22DFF"],
// // // III.Highlight
// // "highlight-surface-subtle": ["#46580B", "#E4F5B0"],
// // "highlight-surface-active": ["#A3CE1A", "#90B51B"],
// // "highlight-text-title": ["#CAEB60", "#46580B"],
// // // IV.Error
// // "error-surface-subtle": ["#700B00", "#FFEDEB"],
// // "error-surface-active": ["#A81100", "#FFACA3"],
// // "error-surface-default": ["#E01600", "#A81100"],
// // "error-surface-pressed": ["#FF5947", "#E01600"],
// // "error-border-disable": ["#700B00", "#FFD6D1"],
// // "error-border-default": ["#E01600", "#A81100"],
// // "error-border-pressed": ["#FF5947", "#E01600"],
// // "error-text-action": ["#FF5947", "#E01600"],
// // "error-text-body": ["#FF5947", "#E01600"],
// // // V.Warning
// // "warning-surface-subtle": ["#7A4D00", "#FFF8EB"],
// // "warning-surface-active": ["#B87500", "#FFE1AD"],
// // "warning-surface-default": ["#F29900", "#B87500"],
// // "warning-surface-pressed": ["#FFC35C", "#F29900"],
// // "warning-border-disable": ["#7A4D00", "#FFF0D6"],
// // "warning-border-default": ["#F29900", "#B87500"],
// // "warning-border-pressed": ["#FFC35C", "#F29900"],
// // "warning-text-action": ["#F29900", "#F29900"],
// // "warning-text-body": ["#F29900", "#F29900"],
// // // VI.Success
// // "success-surface-subtle": ["#007018", "#ECFEEE"],
// // "success-surface-active": ["#007018", "#D3FDD7"],
// // "success-surface-default": ["#00AD26", "#007018"],
// // "success-surface-pressed": ["#39DD47", "#00AD26"],
// // "success-border-disable": ["#007018", "#D3FDD7"],
// // "success-border-default": ["#00AD26", "#007018"],
// // "success-border-pressed": ["#39DD47", "#00AD26"],
// // "success-text-action": ["#00AD26", "#00AD26"],
// // "success-text-body": ["#00AD26", "#00AD26"],
// // `;

// // const output = cssCode.replace(/\["(.*?)", "(.*?)"\]/g, "$2");
// // let modifiedOutput = output.replace(/^/gm, "$");
// // modifiedOutput = modifiedOutput.replace(/"/g, "");

// // console.log(modifiedOutput);

// const scssVariables = `
// $neutral-surface-bg: #f5f5f7;
// $neutral-surface-bg2: #f5f5f7;
// $neutral-surface-card: #ffffff;
// $neutral-surface-action: #ebedf2;
// $neutral-surface-action2: #ebedf2;
// $neutral-surface-action3: #f5f5f7;
// $neutral-surface-toggle-active: #fff;
// $neutral-surface-pressed: #d4d7e1;
// $neutral-surface-disable: #ebedf2;
// $neutral-border-default: #ebedf2;
// $neutral-border-strong: #242325;
// $neutral-border-bold: #242325;
// $neutral-border-disable: #f5f5f7;
// $neutral-text-heading: #242325;
// $neutral-text-title: #242325;
// $neutral-text-body: #6a6b71;
// $neutral-text-body2: #494949;
// $neutral-text-action-on-dark-bg: #fbfbfb;
// $neutral-text-action-on-light-bg: #242325;
// $neutral-text-disable: #c6c8ce;
// $neutral-icon-on-dark: #fbfbfb;
// $neutral-icon-on-light: #242325;
// $neutral-icon-disable: #c6c8ce;
// // II.Primary
// $primary-surface-disable: #ebd1ff;
// $primary-surface-subtle: #f4e5ff;
// $primary-surface-active: #c170ff;
// $primary-surface-default: #5c00a3;
// $primary-surface-pressed: #7c00db;
// $primary-text-action: #7c00db;
// $primary-text-pressed: #a22dff;
// // III.Highlight
// $highlight-surface-subtle: #e4f5b0;
// $highlight-surface-active: #90b51b;
// $highlight-text-title: #46580b;
// // IV.Error
// $error-surface-subtle: #ffedeb;
// $error-surface-active: #ffaca3;
// $error-surface-default: #a81100;
// $error-surface-pressed: #e01600;
// $error-border-disable: #ffd6d1;
// $error-border-default: #a81100;
// $error-border-pressed: #e01600;
// $error-text-action: #e01600;
// $error-text-body: #e01600;
// // V.Warning
// $warning-surface-subtle: #fff8eb;
// $warning-surface-active: #ffe1ad;
// $warning-surface-default: #b87500;
// $warning-surface-pressed: #f29900;
// $warning-border-disable: #fff0d6;
// $warning-border-default: #b87500;
// $warning-border-pressed: #f29900;
// $warning-text-action: #f29900;
// $warning-text-body: #f29900;
// // VI.Success
// $success-surface-subtle: #ecfeee;
// $success-surface-active: #d3fdd7;
// $success-surface-default: #007018;
// $success-surface-pressed: #00ad26;
// $success-border-disable: #d3fdd7;
// $success-border-default: #007018;
// $success-border-pressed: #00ad26;
// $success-text-action: #00ad26;
// $success-text-body: #00ad26;
// `;

// // Define the regex pattern to match SCSS variable declarations
// const regex = /\$(.*?):\s(.*?);/g;

// // Create an object to store the converted variables
// const convertedVariables = {};

// // Iterate over each match and extract the variable name and value
// let match;
// while ((match = regex.exec(scssVariables)) !== null) {
//   const variableName = match[1].trim();
//   const variableValue = match[2].trim();
//   convertedVariables[variableName] = variableValue;
// }

// // Convert the object to a JSON-like string
// const jsonLikeString = JSON.stringify(convertedVariables, null, 2);

// console.log(jsonLikeString);

// const LIST_ORAICAHIN_CONTRACT = {
//   ATOM_ORAICHAIN_DENOM: "ibc/A2E2EEC9057A4A1C2C0A6A4C78B0239118DF5F278830F50B4A6BDD7A66506B78",
//   NEUTARO_ORAICHAIN_DENOM: "ibc/576B1D63E401B6A9A071C78A1D1316D016EC9333D2FEB14AD503FAC4B8731CD1",
//   OSMOSIS_ORAICHAIN_DENOM: "ibc/9C4DCD21B48231D0BC2AC3D1B74A864746B37E4292694C93C617324250D002FC",
//   AIRIBSC_ORAICHAIN_DENOM: "ibc/C458B4CC4F5581388B9ACB40774FDFBCEDC77A7F7CDFB112B469794AF86C4A69",
//   USDTBSC_ORAICHAIN_DENOM: "ibc/E8B5509BE79025DD7A572430204271D3061A535CC66A3A28FDEC4573E473F32F",
//   KWTBSC_ORAICHAIN_DENOM: "ibc/4F7464EEE736CCFB6B444EB72DE60B3B43C0DD509FFA2B87E05D584467AAE8C8",
//   MILKYBSC_ORAICHAIN_DENOM: "ibc/E12A2298AC40011C79F02F26C324BD54DF20F4B2904CB9028BFDEDCFAA89B906",
//   KWT_SUB_NETWORK_DENOM: "ibc/E8734BEF4ECF225B71825BC74DE30DCFF3644EAC9778FFD4EF9F94369B6C8377",
//   MILKY_SUB_NETWORK_DENOM: "ibc/81ACD1F7F5380CAA3F590C58C699FBD408B8792F694888D7256EEAF564488FAB",
//   INJECTIVE_ORAICHAIN_DENOM: "ibc/49D820DFDE9F885D7081725A58202ABA2F465CAEE4AFBC683DFB79A8E013E83E",
//   ORAIIBC_INJECTIVE_DENOM: "ibc/C20C0A822BD22B2CEF0D067400FCCFB6FAEEE9E91D360B4E0725BD522302D565",
//   AIRI_CONTRACT: "orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg",
//   ORAIX_CONTRACT: "orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge",
//   USDT_CONTRACT: "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
//   USDC_CONTRACT: "orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd",
//   KWT_CONTRACT: "orai1nd4r053e3kgedgld2ymen8l9yrw8xpjyaal7j5",
//   MILKY_CONTRACT: "orai1gzvndtzceqwfymu2kqhta2jn6gmzxvzqwdgvjw",
//   SCORAI_CONTRACT: "orai1065qe48g7aemju045aeyprflytemx7kecxkf5m7u5h5mphd0qlcs47pclp",
//   TRX_CONTRACT: "orai1c7tpjenafvgjtgm9aqwm7afnke6c56hpdms8jc6md40xs3ugd0es5encn0",
//   SCATOM_CONTRACT: "orai19q4qak2g3cj2xc2y3060t0quzn3gfhzx08rjlrdd3vqxhjtat0cq668phq",
//   XOCH_CONTRACT: "orai1lplapmgqnelqn253stz6kmvm3ulgdaytn89a8mz9y85xq8wd684s6xl3lt",
//   INJECTIVE_CONTRACT: "orai19rtmkk6sn4tppvjmp5d5zj6gfsdykrl5rw2euu5gwur3luheuuusesqn49",
//   WETH_CONTRACT: "orai1dqa52a7hxxuv8ghe7q5v0s36ra0cthea960q2cukznleqhk0wpnshfegez",
//   BTC_CONTRACT: "orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd",
//   OCH_CONTRACT: "orai1hn8w33cqvysun2aujk5sv33tku4pgcxhhnsxmvnkfvdxagcx0p8qa4l98q",
//   FACTORY_CONTRACT: "orai1hemdkz4xx9kukgrunxu3yw0nvpyxf34v82d2c8",
//   FACTORY_V2_CONTRACT: "orai167r4ut7avvgpp3rlzksz6vw5spmykluzagvmj3ht845fjschwugqjsqhst",
//   ROUTER_V2_CONTRACT: "orai1j0r67r9k8t34pnhy00x3ftuxuwg0r6r4p8p6rrc8az0ednzr8y9s3sj2sf",
//   ORACLE_CONTRACT: "orai18rgtdvlrev60plvucw2rz8nmj8pau9gst4q07m",
//   STAKING_CONTRACT: "orai19p43y0tqnr5qlhfwnxft2u5unph5yn60y7tuvu",
//   REWARDER_CONTRACT: "orai15hua2q83fp666nwhnyrn9g8gt9ueenl32qnugh",
//   CONVERTER_CONTRACT: "orai14wy8xndhnvjmx6zl2866xqvs7fqwv2arhhrqq9",
//   ORAIDEX_LISTING_CONTRACT: "orai1mkr02jzz0jfh34ps6z966uyueu4tlmnyg57nn72pxfq9t9a706tsha5znh",
//   IBC_WASM_HOOKS_CONTRACT: "orai1w0h4ua3k8w2udju97nlws6dfh2ppwkhcewg09zp8gera4mf8lxxs6q086g",
//   ORAIDEX_BID_POOL_CONTRACT: "orai1r4v3f8p2xethczvw5l5ed8cr05a9dqp6auy2zmz5dyvcq5h5g5kqg6m7vu",
//   GRAVITY_EVM_CONTRACT: "0x9a0A02B296240D2620E339cCDE386Ff612f07Be5",
//   GRAVITY_TRON_CONTRACT: "0x73Ddc880916021EFC4754Cb42B53db6EAB1f9D64",
//   IBC_WASM_CONTRACT: "orai195269awwnt5m6c843q6w7hp8rt0k7syfu9de4h0wz384slshuzps8y7ccm",
//   IBC_WASM_CONTRACT_TEST: "orai1jtt8c2lz8emh8s708y0aeduh32xef2rxyg8y78lyvxn806cu7q0sjtxsnv",
//   MULTICALL_CONTRACT: "orai1q7x644gmf7h8u8y6y8t9z9nnwl8djkmspypr6mxavsk9ual7dj0sxpmgwd"
// };

// console.log(Object.keys(LIST_ORAICAHIN_CONTRACT));
