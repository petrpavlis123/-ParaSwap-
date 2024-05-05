import { ApiPromise, WsProvider } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";

export async function submitSwapTx(transactions: SubmittableExtrinsic<"promise">[], account) {
    for(let i = 0; i < transactions.length; i++){
        await new Promise(async resolve => {
            console.log("trying: " + (i + 1))

            await transactions[i].signAndSend(account, async ({ status }) => {
                if (status.isFinalized) {
                    
                    console.log((i + 1) + " completed :)")

                    await new Promise(resolve => {
                        setTimeout(resolve, 30_000);
                    });

                    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    
                    const hydraUsdtBalance = await hydraApi.query.tokens.accounts(account.address, 10)

                    console.log("Hydra USDT Free: " + hydraUsdtBalance.free);

                    const hydraDOTBalance = await hydraApi.query.tokens.accounts(account.address, 5)

                    console.log("Hydra DOT Free: " + hydraDOTBalance.free);

                    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });
                    
                    const polkadotDotBalance = await polkadotApi.query.system.account(account.address)

                    console.log("Polkadot DOT Free: " + polkadotDotBalance.data.free);
    
                    resolve(true)
                }
            });
        })
    }
}