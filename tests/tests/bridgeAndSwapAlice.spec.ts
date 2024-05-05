import { test, expect } from '@playwright/test'
import { bridgeAndSwapAsync } from "../../src/bridgeAndSwap"
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { submitSwapTx } from "../../src/submitSwapTx"

/// Helper method that returns the Alice account
async function getAlice() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const alice = keyring.addFromUri('//Alice')

    return alice
}

test('Alice swaps', async ({ page }) => {

    const alice = await getAlice()

    const result = await bridgeAndSwapAsync(alice, 10_000_000_000)

    console.log("Alice pays: " + result.amountIn)

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    const balance = await assetHubApi.query.system.account(alice.address)

    console.log("Old DOT AssetHub Free: " + balance.data.free);

    const oldUsdtBalance = await assetHubApi.query.assets.account(1984, alice.address)

    console.log("OLD USDT AssetHub Free: " + oldUsdtBalance.value.balance);

    await submitSwapTx(result.transactions, alice);

    const newBalance = await assetHubApi.query.system.account(alice.address)

    console.log("New DOT AssetHub Free: " + newBalance.data.free);

    const usdtBalance = await assetHubApi.query.assets.account(1984, alice.address)

    console.log("New USDT AssetHub Free: " + usdtBalance.value.balance);
    
    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    
    const hydraUsdtBalance = await hydraApi.query.tokens.accounts(alice.address, 10)

    console.log("Hydra USDT Free: " + hydraUsdtBalance.free);

    const hydraDOTBalance = await hydraApi.query.tokens.accounts(alice.address, 5)

    console.log("Hydra DOT Free: " + hydraDOTBalance.free);

    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });
    
    const polkadotDotBalance = await polkadotApi.query.system.account(alice.address)

    console.log("Polkadot DOT Free: " + polkadotDotBalance.data.free);
});