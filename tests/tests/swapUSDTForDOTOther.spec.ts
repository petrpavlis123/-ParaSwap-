import { test, expect } from '@playwright/test';
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { bridgeDotFromHydraDXToPolkadot } from "../../src/bridge"
import '@polkadot/api-augment'
import { swapUSDTForDot } from '../../src/swap';
import { BigNumber, Trade } from '@galacticcouncil/sdk';

/// Helper method that returns the Other account
async function getOtherAccount() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const other = keyring.addFromUri('//Other')

    return other
}

test('swap', async () => {
    const other = await getOtherAccount()

    const trade: Trade = await swapUSDTForDot(0.1) // 0.1 DOT

    console.log(trade);

    const tx = trade.toTx(new BigNumber(100_000_000_000)).get();

    const paymentInfo = await tx.paymentInfo(other)
    console.log(paymentInfo.weight.refTime.toString());
    console.log(paymentInfo.weight.proofSize.toString())

    await tx.signAndSend(other);

    await new Promise(resolve => {
        setTimeout(resolve, 5000);
    });

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });

    const dotBalance = await hydraApi.query.tokens.accounts(other.address, 5)

    console.log("DOT Free: " + dotBalance.free);
    
    const usdtBalance = await hydraApi.query.tokens.accounts(other.address, 10)

    console.log("USDT Free: " + usdtBalance.free);
})

test('check dot balance on Hydra', async () => {
    const other = await getOtherAccount()

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    
    const balance = await hydraApi.query.tokens.accounts(other.address, 5)

    console.log("DOT Free: " + balance.free);
})

test('check usdt balance on Hydra', async () => {
    const other = await getOtherAccount()

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    
    const usdtBalance = await hydraApi.query.tokens.accounts(other.address, 10)

    console.log("USDT Free: " + usdtBalance.free);
})

// 1003382

// 294281 (zbylo)

// 701964 + 2305 