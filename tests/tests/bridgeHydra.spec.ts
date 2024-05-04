import { test, expect } from '@playwright/test';
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { bridgeDotFromHydraDXToPolkadot } from "../../src/bridge"
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


test('bridge 1', async () => {
    const alice = await getAlice()

    const tx = await bridgeDotFromHydraDXToPolkadot(alice, 1000000)

    const paymentInfo = await tx.paymentInfo(alice)
    console.log(paymentInfo.weight.refTime.toString());
    console.log(paymentInfo.weight.proofSize.toString())

    await tx.signAndSend(alice);
})

test('check dot balance on Hydra', async () => {
    const alice = await getAlice()

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    
    const balance = await hydraApi.query.tokens.accounts(alice.address, 5)

    console.log("Free: " + balance.free);
})

test('check dot balance on Polkadot', async () => {
    const alice = await getAlice()

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });
    
    const balance = await hydraApi.query.system.account(alice.address)

    console.log("Free: " + balance.data.free);
})