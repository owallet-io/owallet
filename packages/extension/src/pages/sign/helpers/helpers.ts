import { ethers } from "ethers";

export const tryAllABI = (
  signData,
  ABI: Array<any>
): {
  isRaw: boolean;
  data: any;
} => {
  if (ABI.length === 0) {
    return {
      isRaw: true,
      data: signData,
    };
  }

  const currentABI = ABI[0];
  try {
    const iface = new ethers.utils.Interface(currentABI);
    const decodedData = iface.parseTransaction({ data: signData });
    return {
      isRaw: false,
      data: decodedData,
    };
  } catch (error) {
    console.log(`Parse with ABI not success: ${error.message}`);
    return tryAllABI(signData, ABI.slice(1));
  }
};
