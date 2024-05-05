import { ApiPromise } from "@polkadot/api";
import '@polkadot/api-augment'

export async function checkNative(api: ApiPromise, account): Promise<boolean> {
    const balance: any = await api.query.system.account(account.address)

    return balance.data.free.toString() !== "0"
}

export async function checkTokens(api: ApiPromise, account, tokenId: number): Promise<boolean> {
    const usdtBalance: any = await api.query.tokens.accounts(account.address, tokenId)

    return usdtBalance.free.toString() !== "0"
}
