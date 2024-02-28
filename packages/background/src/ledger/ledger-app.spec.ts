import {
  openTransportReplayer,
  RecordStore,
} from "@ledgerhq/hw-transport-mocker";
import CosmosApp from "@ledgerhq/hw-app-cosmos";
import EthApp from "@ledgerhq/hw-app-eth";
import TrxApp from "@ledgerhq/hw-app-trx";

describe("Test ledger app", () => {
  it("test ledger app cosmos type", async () => {
    // const cosmosApp = new CosmosApp(
    //   await openTransportReplayer(
    //     // second is public key return
    //     RecordStore.fromString(`
    //       => 5504000019046f7261692c00008076000080000000800000000000000000
    //       <= 4104df00ad3869baad7ce54f4d560ba7f268d542df8f2679a5898d78a690c3db8f9833d2973671cb14b088e91bdf7c0ab00029a576473c0e12f84d252e630bb3809b28436241393833363265313939633431453138363444303932334146393634366433413634383435319000
    //   `)
    //   )
    // );
    // const cosmosRet = await cosmosApp.getAddress("44'/118'/0'/0/0", 'orai');
    // expect(cosmosRet.address).toBe(
    //   'orai18cgmaec32hgmd8ls8w44hjn25qzjwhannd9kpj'
    // );
  });
});
