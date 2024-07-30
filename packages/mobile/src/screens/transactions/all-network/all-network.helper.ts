export const convertObjChainAddressToString = (txsAllNetwork) => {
  const data = Object.entries(txsAllNetwork)
    .map(([key, value]) => `${key}%2B${value}`)
    .join(",");
  return data;
};

export const convertParamSearch = (qs: string) => {
  return new URLSearchParams(qs).toString();
};
