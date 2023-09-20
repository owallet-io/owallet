export type SupplyTotal = {
  height: string;
  // Int
  result: string;
};

export type SupplyTotalStargate = {
  height: string;
  result: {
    denom: string;
    // Int
    amount: string;
  };
};

export type MintingInflation = {
  inflation: string;
};
