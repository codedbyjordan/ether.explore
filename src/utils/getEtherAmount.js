import { utils, BigNumber } from "ethers";

export const getEtherAmount = (hex) => {
  return utils.formatEther(BigNumber.from(String(hex)));
};
