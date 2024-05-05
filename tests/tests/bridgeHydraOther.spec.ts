import { test, expect } from '@playwright/test';
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { bridgeDotFromHydraDXToPolkadot } from "../../src/bridge"
import '@polkadot/api-augment'
import { DOT_POLKADOT_RECEIVE_FEE } from '../../src/constants';

/// Helper method that returns the Alice account
async function getOtherAccount() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const other = keyring.addFromUri('//Other')

    return other
}


test('bridge 1', async () => {
    const other = await getOtherAccount()

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });

    const tx = await bridgeDotFromHydraDXToPolkadot(hydraApi, other, 20_000_000_000 + DOT_POLKADOT_RECEIVE_FEE)

    const paymentInfo = await tx.paymentInfo(other)
    console.log(paymentInfo.weight.refTime.toString());
    console.log(paymentInfo.weight.proofSize.toString())

    await tx.signAndSend(other);

    await new Promise(resolve => {
        setTimeout(resolve, 10000);
    });

    const hydraBalance = await hydraApi.query.tokens.accounts(other.address, 5)

    console.log("Hydra DOT Free: " + hydraBalance.free);

    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });

    const polkadotBalance = await polkadotApi.query.system.account(other.address)

    console.log("Polkadot DOT Free: " + polkadotBalance.data.free);
})

test('check dot balance on Hydra', async () => {
    const other = await getOtherAccount()

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    
    const balance = await hydraApi.query.tokens.accounts(other.address, 5)

    console.log("DOT Free: " + balance.free);
})

test('check dot balance on Polkadot', async () => {
    const other = await getOtherAccount()

    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });
    
    const balance = await polkadotApi.query.system.account(other.address)

    console.log("Free: " + balance.data.free);
})

