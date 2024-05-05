import { test, expect } from '@playwright/test';
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { bridgeUsdtFromAssetHubToHydraDX } from "../../src/bridge"
import { ASSET_HUB_USDT_EXISTENTIAL_DEPOSIT, USDT_HYDRA_RECEIVE_FEE } from "../../src/constants"
import '@polkadot/api-augment'

/// Helper method that returns the Other account
async function getOtherAccount() {
    await cryptoWaitReady()

    // Create an instance of the Keyring
    const keyring = new Keyring({ type: 'sr25519' })

    // Create pair and add Alice to keyring pair dictionary (with account seed)
    const other = keyring.addFromUri('//Other')

    return other
}

test('bridge usdt from AssetHub to Hydra', async () => {
    const other = await getOtherAccount()

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    const tx = await bridgeUsdtFromAssetHubToHydraDX(assetHubApi, other, 1_000_000 + USDT_HYDRA_RECEIVE_FEE)

    const paymentInfo = await tx.paymentInfo(other)
    console.log(paymentInfo.weight.refTime.toString());
    console.log(paymentInfo.weight.proofSize.toString())

    await tx.signAndSend(other);

    await new Promise(resolve => {
        setTimeout(resolve, 10000);
    });

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });

    const dotBalance = await hydraApi.query.tokens.accounts(other.address, 5)

    console.log("DOT Free: " + dotBalance.free);
    
    const usdtBalance = await hydraApi.query.tokens.accounts(other.address, 10)

    console.log("USDT Free: " + usdtBalance.free);
})

test('check USDT balance on Hydra', async () => {
    const other = await getOtherAccount()

    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    
    const balance = await hydraApi.query.tokens.accounts(other.address, 10)

    console.log("USDT Hydra Free: " + balance.free);
})

test('check USDT balance on AssetHub', async () => {
    const other = await getOtherAccount()

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });
    
    const balance = await assetHubApi.query.assets.account(1984, other.address)

    console.log("USDT AssetHub Free: " + balance.value.balance);
})

test('check DOT balance', async() => {
    const other = await getOtherAccount()

    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    const newBalance = await assetHubApi.query.system.account(other.address)

    console.log("DOT AssetHub Free: " + newBalance.data.free);
})
