import { test, expect } from '@playwright/test';
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { bridgeDotFromPolkadotToAssetHub } from "../../src/bridge"
import '@polkadot/api-augment'

/// Helper method that returns the Alice account
async function getOtherAccount() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const other = keyring.addFromUri('//Other')

    return other
}

test('bridge 2', async () => {
    const other = await getOtherAccount()

    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });

    const tx = await bridgeDotFromPolkadotToAssetHub(polkadotApi, other, 4_000_000_000)

    const paymentInfo = await tx.paymentInfo(other)
    console.log("reftime: " + paymentInfo.weight.refTime.toString());
    console.log("proofsize: " + paymentInfo.weight.proofSize.toString())

    await tx.signAndSend(other);

    await new Promise(resolve => {
        setTimeout(resolve, 5000);
    });

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });
    
    const balance1 = await assetHubApi.query.system.account(other.address)

    console.log("AssetHub new Free: " + balance1.data.free);
    
    const balance = await polkadotApi.query.system.account(other.address)

    console.log("Polkadot new Free: " + balance.data.free);
})

test('check dot balance on AssetHub', async () => {
    const other = await getOtherAccount()

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });
    
    const balance = await assetHubApi.query.system.account(other.address)

    console.log("AssetHub Free: " + balance.data.free);
})

test('check dot balance on Polkadot', async () => {
    const other = await getOtherAccount()

    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });
    
    const balance = await polkadotApi.query.system.account(other.address)

    console.log("Polkadot Free: " + balance.data.free);
})

// Orig: 20009299457
// Orig: 20009299457

