import { OraiswapTokenClient } from "@oraichain/oraidex-contracts-sdk";
import { CwIcs20LatestClient } from "@oraichain/common-contracts-sdk";
import * as oraidexArtifacts from "@oraichain/oraidex-contracts-build";
import * as commonArtifacts from "@oraichain/common-contracts-build";
import { Cw20Coin } from "@oraichain/common-contracts-sdk";

export const testSenderAddress = "orai1g4h64yjt0fvzv5v2j8tyfnpe5kmnetejvfgs7g";

export const deployToken = async (
  client: any,
  {
    symbol,
    name,
    decimals = 6,
    initial_balances = [{ address: testSenderAddress, amount: "1000000000" }],
  }: {
    symbol: string;
    name: string;
    decimals?: number;
    initial_balances?: Cw20Coin[];
  }
): Promise<OraiswapTokenClient> => {
  return new OraiswapTokenClient(
    client,
    testSenderAddress,
    (
      await oraidexArtifacts.deployContract(
        client,
        testSenderAddress,

        {
          decimals,
          symbol,
          name,
          mint: { minter: testSenderAddress },
          initial_balances,
        },
        "token",
        "oraiswap_token"
      )
    ).contractAddress
  );
};

export const deployIcs20Token = async (
  client: any,
  {
    swap_router_contract,
    gov_contract = testSenderAddress,
  }: { gov_contract?: string; swap_router_contract: string }
): Promise<CwIcs20LatestClient> => {
  const { contractAddress } = await commonArtifacts.deployContract(
    client,
    testSenderAddress,
    {
      allowlist: [],
      default_timeout: 3600,
      gov_contract,
      swap_router_contract,
    },
    "cw-ics20-latest",
    "cw-ics20-latest"
  );
  return new CwIcs20LatestClient(client, testSenderAddress, contractAddress);
};
