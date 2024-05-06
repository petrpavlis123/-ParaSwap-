import { test, expect } from '@playwright/test'
import { bridgeAndSwapAsync } from "../../src/bridgeAndSwap"
import { submitSwapTx } from "../../src/submitSwapTx"
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'

/// Helper method that returns the Other account
async function getOther() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const account = keyring.addFromUri('//Other')

    return account
}

test('Alice swaps', async ({ page }) => {
    const account = await getOther()

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    const balance = await assetHubApi.query.system.account(account.address)

    console.log("Old DOT AssetHub Free: " + balance.data.free);

    const oldUsdtBalance = await assetHubApi.query.assets.account(1984, account.address)

    console.log("OLD USDT AssetHub Free: " + oldUsdtBalance.value.balance);

    const result = await bridgeAndSwapAsync(account, 10_000_000_000, true) // Request to swap for 1 DOT

    console.log("Other pays: " + result.amountIn)

    await submitSwapTx(result.transactions, account);   // Run the transactions
                                                        // Takes ~ 2 mins to complete


    const newBalance = await assetHubApi.query.system.account(account.address)

    console.log("New DOT AssetHub Free: " + newBalance.data.free);

    const usdtBalance = await assetHubApi.query.assets.account(1984, account.address)

    console.log("New USDT AssetHub Free: " + usdtBalance.value.balance);

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    
    const hydraUsdtBalance = await hydraApi.query.tokens.accounts(account.address, 10)

    console.log("Hydra USDT Free: " + hydraUsdtBalance.free);

    const hydraDOTBalance = await hydraApi.query.tokens.accounts(account.address, 5)

    console.log("Hydra DOT Free: " + hydraDOTBalance.free);

    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });
    
    const polkadotDotBalance = await polkadotApi.query.system.account(account.address)

    console.log("Polkadot DOT Free: " + polkadotDotBalance.data.free);
});