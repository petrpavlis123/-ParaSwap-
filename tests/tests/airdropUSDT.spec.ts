import { test, expect } from '@playwright/test';
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { bridgeUsdtFromAssetHubToHydraDX } from "../../src/bridge"
import { ASSET_HUB_USDT_EXISTENTIAL_DEPOSIT, USDT_HYDRA_RECEIVE_FEE } from "../../src/constants"
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
    const other = keyring.addFromUri('//Other')

    return other
}

test('airdrop USDT', async () => {
    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    const other = await getOtherAccount()

    const alice = await getAlice()

    await assetHubApi.tx.assets.transferKeepAlive(1984, other.address, 200_000_000).signAndSend(alice);

    await new Promise(resolve => {
        setTimeout(resolve, 5000);
    });

    const balance = await assetHubApi.query.system.account(other.address)

    console.log("DOT AssetHub Free: " + balance.data.free);
    
    const usdtBalance = await assetHubApi.query.assets.account(1984, other.address)

    console.log("USDT AssetHub Free: " + usdtBalance.value.balance);
})
