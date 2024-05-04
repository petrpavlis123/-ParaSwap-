import { test, expect } from '@playwright/test';
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { bridgeDotFromPolkadotToAssetHub } from "../../src/bridge"
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


test('bridge 2', async () => {
    const alice = await getAlice()

    const tx = await bridgeDotFromPolkadotToAssetHub(alice, 1000000000000)

    const paymentInfo = await tx.paymentInfo(alice)
    console.log("reftime: " + paymentInfo.weight.refTime.toString());
    console.log("proofsize: " + paymentInfo.weight.proofSize.toString())

    await tx.signAndSend(alice);

    await new Promise(resolve => {
        setTimeout(resolve, 5000);
    });

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });
    
    const balance1 = await assetHubApi.query.system.account(alice.address)

    console.log("AssetHub new Free: " + balance1.data.free);

    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });
    
    const balance = await polkadotApi.query.system.account(alice.address)

    console.log("Polkadot new Free: " + balance.data.free);
})

test('check dot balance on AssetHub', async () => {
    const alice = await getAlice()

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });
    
    const balance = await assetHubApi.query.system.account(alice.address)

    console.log("AssetHub Free: " + balance.data.free);
})

test('check dot balance on Polkadot', async () => {
    const alice = await getAlice()

    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });
    
    const balance = await polkadotApi.query.system.account(alice.address)

    console.log("Polkadot Free: " + balance.data.free);
})