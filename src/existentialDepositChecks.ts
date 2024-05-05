import { ApiPromise } from "@polkadot/api";

export async function checkNative(api: ApiPromise, account): Promise<boolean> {
    const balance = await api.query.system.account(account.address)

    return balance.data.free.toString() !== "0"
}

export async function checkTokens(api: ApiPromise, account, tokenId: number): Promise<boolean> {
    const usdtBalance = await api.query.tokens.accounts(account.address, tokenId)

    return usdtBalance.free.toString() !== "0"
}
