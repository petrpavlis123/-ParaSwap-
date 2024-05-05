import { BigNumber, PoolService, PoolType, Trade, TradeRouter } from "@galacticcouncil/sdk";
import { ApiPromise, WsProvider } from "@polkadot/api";

export async function swapUSDTForDot(amountOut: string | number | BigNumber): Promise<Trade> {
    const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    const poolService = new PoolService(api);
    await poolService.syncRegistry(); // Wait until pools initialized (optional), fallback to lazy init

    const tradeRouter = new TradeRouter(poolService)

    const swap = await tradeRouter.getBuy('10', '5', amountOut, [
        {
            pool: PoolType.Stable,
            poolAddress: "7LVGEVLFXpsCCtnsvhzkSMQARU7gRVCtwMckG7u7d3V6FVvG",
            poolId: "102",
            assetIn: "10",
            assetOut: "102",
        },
        {
            pool: PoolType.Omni,
            poolAddress: "7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1",
            assetIn: "102",
            assetOut: "5",
        }
    ])

    return swap
}
