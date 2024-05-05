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
    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });

    const other = await getOtherAccount()

    const alice = await getAlice()

    await hydraApi.tx.tokens.transferKeepAlive(other.address, 5, 25_000_000_000).signAndSend(alice);

    await new Promise(resolve => {
        setTimeout(resolve, 5000);
    });

    const dotBalance = await hydraApi.query.tokens.accounts(other.address, 5)

    console.log("DOT Free: " + dotBalance.free);
    
    const usdtBalance = await hydraApi.query.tokens.accounts(other.address, 10)

    console.log("USDT Free: " + usdtBalance.free);
})
