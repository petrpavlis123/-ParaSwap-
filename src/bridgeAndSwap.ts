import { BigNumber, PoolService, TradeRouter, Transaction } from "@galacticcouncil/sdk";
import { ApiPromise, WsProvider } from "@polkadot/api";

export interface SwapTx {
    fees: BigNumber,
    transactions: Transaction[],
}

export async function bridgeAndSwapAsync(): Promise<SwapTx> {
    let transactions: Transaction[] = []
    let fees: BigNumber = new BigNumber(0)

    /// Bridge USDT z AssetHub -> HydraDX

    /// Swap USDT -> DOT
    const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    const poolService = new PoolService(api);
    await poolService.syncRegistry(); // Wait until pools initialized (optional), fallback to lazy init

    const tradeRouter = new TradeRouter(poolService)

    //const result = await tradeRouter.getAllAssets();
    
    const swap = await tradeRouter.getBestBuy('10','5', 1)

    fees = fees.plus(swap.tradeFee)
    
    transactions.push(swap.toTx(new BigNumber(1000000000000000000)))

    /// Bridge DOT z HydraDX -> Polkadot

    /// Bridge DOT z Polkadot -> AssetHub

    return {
        fees,
        transactions,
    }
}
