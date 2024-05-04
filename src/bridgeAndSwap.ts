import { BigNumber, PoolService, TradeRouter } from "@galacticcouncil/sdk";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { bridgeDotFromHydraDXToPolkadot, bridgeDotFromPolkadotToAssetHub } from "./bridge"
import { BN } from '@polkadot/util';

export interface SwapTx {
    fees: BN,
    transactions: TX[],
}

export enum Chains {
    AssetHub,
    Polkadot,
    HydraDX,
}

export interface TX {
    origin: Chains
    destination?: Chains
    hex: string
}

export async function bridgeAndSwapAsync(account, amountOut): Promise<SwapTx> {
    let transactions: TX[] = []
    let fees: BN = new BN(0);

    /// Bridge DOT z Polkadot -> AssetHub
    const POLKADOT_FEE = 10000000000
    const bridge3Tx = await bridgeDotFromPolkadotToAssetHub(account, amountOut + POLKADOT_FEE);

    transactions.push({
        origin: Chains.HydraDX,
        destination: Chains.Polkadot,
        hex: bridge3Tx.toHex(),
    })

    fees = fees.add(new BN(POLKADOT_FEE))

    /// Bridge DOT z HydraDX -> Polkadot
    const bridge2Tx = await bridgeDotFromHydraDXToPolkadot(account, 1000000000);

    transactions.push({
        origin: Chains.HydraDX,
        destination: Chains.Polkadot,
        hex: bridge2Tx.toHex(),
    })

    const paymentInfo2 = await bridge2Tx.paymentInfo(account)

    fees = fees.add(paymentInfo2.weight.refTime.toBn())

    /// Swap USDT -> DOT
    const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    const poolService = new PoolService(api);
    await poolService.syncRegistry(); // Wait until pools initialized (optional), fallback to lazy init

    const tradeRouter = new TradeRouter(poolService)

    const swap = await tradeRouter.getBestBuy('10', '5', 1)

    fees = fees.add(new BN(swap.tradeFee.toNumber()))

    transactions.push({
        origin: Chains.HydraDX,
        hex: swap.toTx(new BigNumber(1000000000000000000)).hex
    })

    /// Bridge USDT z AssetHub -> HydraDX
    const bridge1Tx = await bridgeDotFromPolkadotToAssetHub(account, 1000000000);

    transactions.push({
        origin: Chains.HydraDX,
        destination: Chains.Polkadot,
        hex: bridge1Tx.toHex(),
    })

    const paymentInfo1 = await bridge1Tx.paymentInfo(account)

    fees = fees.add(paymentInfo1.weight.refTime.toBn())

    return {
        fees,
        transactions,
    }
}
