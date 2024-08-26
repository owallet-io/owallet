import { TxsHelper } from "../txs-helper";

describe("txsHelper", () => {
  const data = [
    {
      block_hash:
        "000000000000118ee89757d1fc3a611e2432f212e12f97f7b39f1485db24ef73",
      block_height: 2476461,
      block_index: 60,
      hash: "2d68ee1ec24c262d687c91d5f34353a11c693faf3726e10b3f199f0851a89439",
      addresses: [
        "mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw",
        "mx9aANfZysLa8W1un99axpxuekuT8otWSg",
      ],
      total: 4247825,
      fees: 750,
      size: 372,
      vsize: 372,
      preference: "low",
      confirmed: "2023-09-05T09:42:38Z",
      received: "2023-09-05T09:42:38Z",
      ver: 2,
      double_spend: false,
      vin_sz: 2,
      vout_sz: 2,
      confirmations: 0,
      confidence: 1,
      inputs: [
        {
          prev_hash:
            "95274c375bd10cfd49b382a745eb03cb2c3ed2ed053c11b9df956b7d48da9d0b",
          output_index: 0,
          script:
            "47304402207b088b12ed19a6d558784bb0e8ae087e07f6806d96ba7ec573e13aea4de6417502206fd48258bc593e18ba79e8d95ba94efa1a647e4ad3d341a531361faff4fce5f8012103d4c71a9e95dfa3154d5ffe77517a7746aa6eb4f499ba1bb69570de7dc6293e07",
          output_value: 12562,
          sequence: 4294967295,
          addresses: ["mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw"],
          script_type: "pay-to-pubkey-hash",
          age: 2476461,
        },
        {
          prev_hash:
            "bd7a7cb5ae344798b6bf8917120394fea6fc218ad3e1852e054b613c9f00066c",
          output_index: 1,
          script:
            "47304402206efd36573aba920381c25df0d970f494d53678351c270910c0217e04678058c2022076994a2ac3bbf5e40ad6e344f517a4ea304a9186ccc951205aebaeba4a818069012103d4c71a9e95dfa3154d5ffe77517a7746aa6eb4f499ba1bb69570de7dc6293e07",
          output_value: 4236013,
          sequence: 4294967295,
          addresses: ["mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw"],
          script_type: "pay-to-pubkey-hash",
          age: 2476461,
        },
      ],
      outputs: [
        {
          value: 4237825,
          script: "76a91400f8b4f057880e934323a3eb95d710b88840195288ac",
          addresses: ["mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw"],
          script_type: "pay-to-pubkey-hash",
        },
        {
          value: 10000,
          script: "76a914b66eed8c589619966a9acf11c105f4a312cbc99b88ac",
          addresses: ["mx9aANfZysLa8W1un99axpxuekuT8otWSg"],
          script_type: "pay-to-pubkey-hash",
        },
      ],
    },
    {
      block_hash:
        "000000000000118ee89757d1fc3a611e2432f212e12f97f7b39f1485db24ef73",
      block_height: 2476461,
      block_index: 59,
      hash: "bd7a7cb5ae344798b6bf8917120394fea6fc218ad3e1852e054b613c9f00066c",
      addresses: [
        "mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw",
        "tb1q55ddlnqp7spzeskdd82p5sseyqexy67s7esc3g",
      ],
      total: 4635786,
      fees: 227,
      size: 225,
      vsize: 144,
      preference: "low",
      relayed_by: "203.132.94.196:18333",
      confirmed: "2023-09-05T09:42:38Z",
      received: "2023-09-05T09:35:53.91Z",
      ver: 2,
      double_spend: false,
      vin_sz: 1,
      vout_sz: 2,
      confirmations: 3,
      confidence: 1,
      inputs: [
        {
          prev_hash:
            "60005af6ca64bf09b754092da1c49a6caeeb73f42b419690a40cf6899eea6630",
          output_index: 0,
          output_value: 4636013,
          sequence: 4294967295,
          addresses: ["tb1q55ddlnqp7spzeskdd82p5sseyqexy67s7esc3g"],
          script_type: "pay-to-witness-pubkey-hash",
          age: 2475260,
          witness: [
            "3044022035681b6ab71acaebccc9b905a140318b14f52229f48eb630e2f7489319c517c102205099cbc6a3f4861df06e39a603bdad6e7ec6d2079241b9a3ef603fc666324b1b01",
            "03221e8361f1bd972e1d17ade2dd7935831c8c9c130ee381868959f9c941b3ebee",
          ],
        },
      ],
      outputs: [
        {
          value: 399773,
          script: "0014a51adfcc01f4022cc2cd69d41a42192032626bd0",
          addresses: ["tb1q55ddlnqp7spzeskdd82p5sseyqexy67s7esc3g"],
          script_type: "pay-to-witness-pubkey-hash",
        },
        {
          value: 4236013,
          script: "76a91400f8b4f057880e934323a3eb95d710b88840195288ac",
          addresses: ["mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw"],
          script_type: "pay-to-pubkey-hash",
        },
      ],
    },
    {
      block_hash:
        "000000000000118ee89757d1fc3a611e2432f212e12f97f7b39f1485db24ef73",
      block_height: 2476461,
      block_index: 58,
      hash: "95274c375bd10cfd49b382a745eb03cb2c3ed2ed053c11b9df956b7d48da9d0b",
      addresses: [
        "mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw",
        "mugBvi1L6hSV7iv6Rim6kV2bXQ6aQTNNAq",
        "n3yWdMaWxoe3EctXF7uZ9ENqYS5hp7GEaV",
      ],
      total: 998738478,
      fees: 225,
      size: 225,
      vsize: 225,
      preference: "low",
      relayed_by: "85.208.69.12:18333",
      confirmed: "2023-09-05T09:42:38Z",
      received: "2023-09-05T09:26:08.711Z",
      ver: 2,
      lock_time: 2476460,
      double_spend: false,
      vin_sz: 1,
      vout_sz: 2,
      opt_in_rbf: true,
      confirmations: 3,
      confidence: 1,
      inputs: [
        {
          prev_hash:
            "6de9bc732efe98b4738bd869a2457e6241348fadeda92a31eb48bdee9cdf8417",
          output_index: 1,
          script:
            "47304402200dae5017fbf69ed01374d775c21e38566ae44ac482d645f0dc3e75af7633467702207cf0a616acfc8c0431c3ead82145126d113f911eb0427f4d085c4617a68620c4012103c3efaae3ce81a9ddfbe4e4db2c4ef791630dbb1e88770e19341eacb333d0129e",
          output_value: 998738703,
          sequence: 4294967293,
          addresses: ["mugBvi1L6hSV7iv6Rim6kV2bXQ6aQTNNAq"],
          script_type: "pay-to-pubkey-hash",
          age: 2476460,
        },
      ],
      outputs: [
        {
          value: 12562,
          script: "76a91400f8b4f057880e934323a3eb95d710b88840195288ac",
          addresses: ["mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw"],
          script_type: "pay-to-pubkey-hash",
        },
        {
          value: 998725916,
          script: "76a914f6589282433f81a7e82f9882cd3172c953569f5f88ac",
          addresses: ["n3yWdMaWxoe3EctXF7uZ9ENqYS5hp7GEaV"],
          script_type: "pay-to-pubkey-hash",
        },
      ],
    },
  ] as any;
  const currentChain = {
    chainId: "bitcoinTestnet",
    chainName: "Bitcoin Testnet",
    coinType: 1,
    feeCurrencies: [
      {
        coinDecimals: 8,
        coinDenom: "BTC",
        coinGeckoId: "bitcoin",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
        coinMinimalDenom: "btc",
      },
    ],
    stakeCurrency: [
      {
        coinDecimals: 8,
        coinDenom: "BTC",
        coinGeckoId: "bitcoin",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
        coinMinimalDenom: "btc",
      },
    ],
    networkType: "bitcoin",
  } as any;
  const helper = new TxsHelper();
  it("cleanDataBtcResToStandFormat", () => {
    const expectRs = [
      {
        confirmations: 0,
        countTypeEvent: 0,
        denomFee: "",
        fee: "0 BTC",
        gasUsed: null,
        gasWanted: null,
        height: "--",
        isRefreshData: false,
        memo: null,
        status: "pending",
        time: {
          timeLong: "31 minutes ago (2023-09-05 16:42:38)",
          timeShort: "31 minutes ago",
        },
        transfers: [
          {
            transferInfo: [],
            typeEvent: "Transaction",
          },
        ],
        txHash: undefined,
      },
      {
        confirmations: 0,
        countTypeEvent: 0,
        denomFee: "",
        fee: "0 BTC",
        gasUsed: null,
        gasWanted: null,
        height: "--",
        isRefreshData: false,
        memo: null,
        status: "pending",
        time: {
          timeLong: "38 minutes ago (2023-09-05 16:35:53)",
          timeShort: "38 minutes ago",
        },
        transfers: [
          {
            transferInfo: [],
            typeEvent: "Transaction",
          },
        ],
        txHash: undefined,
      },
      {
        confirmations: 0,
        countTypeEvent: 0,
        denomFee: "",
        fee: "0 BTC",
        gasUsed: null,
        gasWanted: null,
        height: "--",
        isRefreshData: false,
        memo: null,
        status: "pending",
        time: {
          timeLong: "An hour ago (2023-09-05 16:26:08)",
          timeShort: "An hour ago",
        },
        transfers: [
          {
            transferInfo: [],
            typeEvent: "Transaction",
          },
        ],
        txHash: undefined,
      },
    ];

    const rs = helper.cleanDataBtcResToStandFormat(
      data,
      currentChain,
      "mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw"
    );
    expect([
      {
        ...rs[0],
        time: {
          ...rs[0].time,
          timeLong: "31 minutes ago (2023-09-05 16:42:38)",
          timeShort: "31 minutes ago",
        },
      },
      {
        ...rs[1],
        time: {
          ...rs[1].time,
          timeLong: "38 minutes ago (2023-09-05 16:35:53)",
          timeShort: "38 minutes ago",
        },
      },
      {
        ...rs[2],
        time: {
          ...rs[2].time,
          timeLong: "An hour ago (2023-09-05 16:26:08)",
          timeShort: "An hour ago",
        },
      },
    ]).toEqual(expectRs);
  });

  it("formatNumberSeparateThousand", () => {
    const expectRs = "2,476,461";
    const rs = helper.formatNumberSeparateThousand(2476461);
    expect(rs).toBe(expectRs);
  });
  it("handleTransferDetailBtc", () => {
    const expectRs = [
      {
        transferInfo: [],
        typeEvent: "Transaction",
      },
    ];
    const rs = helper.handleTransferDetailBtc(
      data[0],
      currentChain,
      "mfc6EWEjRZkD9KJKcAXEeH4zgbHFxg6aGw"
    );
    expect(rs).toEqual(expectRs);
  });
});
