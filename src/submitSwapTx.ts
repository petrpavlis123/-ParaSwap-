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
    
                    resolve(true)
                }
            });
        })
    }
}
