import {
  generateMsgAllNft,
  generateMsgInfoNft,
  generateMsgNft,
} from "../pages/helpers";
import { StartAfter, Limit } from "../pages/nft/types";

// let client;
describe("nft", () => {
  const owner = "orai12zyu8w93h0q2lcnt50g3fn0w3yqnhy4fvawaqz";
  const nftId = 1;
  beforeEach(async () => {
    // client = await getClientQuery();
  });
  it("generateMsgNft", async () => {
    const msg = generateMsgNft(Limit, owner, StartAfter);
    expect(msg).toHaveProperty("tokens");
    expect(msg.tokens.limit).toEqual(Limit);
    expect(msg.tokens.owner).toEqual(owner);
    expect(msg.tokens.start_after).toEqual(StartAfter);
  });

  it("generateMsgInfoNft", async () => {
    const msg = generateMsgInfoNft(nftId);
    expect(msg).toHaveProperty("nft_info");
    expect(msg.nft_info.token_id).toEqual(nftId);
  });

  it("generateMsgAllNft", async () => {
    const msg = generateMsgAllNft(nftId);
    expect(msg).toHaveProperty("all_nft_info");
    expect(msg.all_nft_info.token_id).toEqual(nftId);
  });
});
