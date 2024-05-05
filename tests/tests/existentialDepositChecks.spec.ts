import { test, expect } from '@playwright/test';
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { bridgeUsdtFromAssetHubToHydraDX } from "../../src/bridge"
import { checkNative, checkTokens } from "../../src/existentialDepositChecks"
import '@polkadot/api-augment'

/// Helper method that returns the Other account
async function getOther() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const other = keyring.addFromUri('//Other')

    return other
}

/// Helper method that returns the Alice account
async function getAlice() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const alice = keyring.addFromUri('//Alice')

    return alice
}

test('check ED AssetHub', async () => {
    const other = await getOther()

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    const exists = await checkNative(assetHubApi, other);

    expect(exists).toBeFalsy()
})

test('check ED Polkadot', async () => {
    const other = await getOther()

    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });

    const exists = await checkNative(polkadotApi, other);

    expect(exists).toBeFalsy()
})

test('check ED HydraDX', async () => {
    const other = await getOther()

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });

    const existsUSDT = await checkTokens(hydraApi, other, 10);

    expect(existsUSDT).toBeFalsy()

    const existsDOT = await checkTokens(hydraApi, other, 5);

    expect(existsDOT).toBeFalsy()
})

test('check ED AssetHub Alice', async () => {
    const alice = await getAlice()

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    const exists = await checkNative(assetHubApi, alice);

    expect(exists).toBeTruthy()
})

test('check ED HydraDX Alice', async () => {
    const alice = await getAlice()

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });

    const existsUSDT = await checkTokens(hydraApi, alice, 10);

    expect(existsUSDT).toBeTruthy()

    const existsDOT = await checkTokens(hydraApi, alice, 5);

    expect(existsDOT).toBeTruthy()
})