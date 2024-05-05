import { test, expect } from '@playwright/test';
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { bridgeUsdtFromAssetHubToHydraDX } from "../../src/bridge"
import '@polkadot/api-augment'

/// Helper method that returns the Alice account
async function getAlice() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const alice = keyring.addFromUri('//Alice')

    return alice
}

/// Helper method that returns the Other account
async function getOtherAccount() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const alice = keyring.addFromUri('//Other')

    return alice
}

test('remove', async () => {
    const alice = await getAlice()

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    const balance = await assetHubApi.query.system.account(alice.address)

    console.log("old DOT AssetHub Free: " + balance.data.free);

    await assetHubApi.tx.balances.transferAll("13QPPJVtxCyJzBdXdqbyYaL3kFxjwVi7FPCxSHNzbmhLS6TR", true).signAndSend(alice);

    const newBalance = await assetHubApi.query.system.account(alice.address)

    console.log("DOT AssetHub Free: " + newBalance.data.free);
    
    const usdtBalance = await assetHubApi.query.assets.account(1984, alice.address)

    console.log("USDT AssetHub Free: " + usdtBalance.value.balance);
})
