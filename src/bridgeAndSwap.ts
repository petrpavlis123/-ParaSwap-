import { BigNumber } from "@galacticcouncil/sdk";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { bridgeDotFromHydraDXToPolkadot, bridgeDotFromPolkadotToAssetHub, bridgeUsdtFromAssetHubToHydraDX } from "./bridge"
import { swapUSDTForDot } from "./swap";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ASSET_HUB_DOT_EXISTENTIAL_DEPOSIT, DOT_ASSET_HUB_RECEIVE_FEE, DOT_HYDRA_SEND_FEE, DOT_POLKADOT_RECEIVE_FEE, DOT_POLKADOT_SEND_FEE, HYDRA_DOT_EXISTENTIAL_DEPOSIT, HYDRA_SWAP_TX_FEE, HYDRA_USDT_EXISTENTIAL_DEPOSIT, POLKADOT_DOT_EXISTENTIAL_DEPOSIT, USDT_HYDRA_RECEIVE_FEE } from "./constants";
import { checkNative, checkTokens } from "./existentialDepositChecks";

export interface SwapTx {
    amountIn: number,
    transactions: SubmittableExtrinsic<"promise">[],
}

export async function bridgeAndSwapAsync(account, amountOut): Promise<SwapTx> {
    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });
    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });
    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    /// Bridge DOT z Polkadot -> AssetHub
    const polkadotAmountOut = await checkNative(assetHubApi, account) ?
        amountOut + DOT_ASSET_HUB_RECEIVE_FEE :
        amountOut + DOT_ASSET_HUB_RECEIVE_FEE + ASSET_HUB_DOT_EXISTENTIAL_DEPOSIT;

    const bridge3Tx = await bridgeDotFromPolkadotToAssetHub(polkadotApi, account, polkadotAmountOut);

    /// Bridge DOT z HydraDX -> Polkadot
    const hydraAmountOut = await checkNative(polkadotApi, account) ?
        polkadotAmountOut + DOT_POLKADOT_SEND_FEE + DOT_POLKADOT_RECEIVE_FEE :
        polkadotAmountOut + DOT_POLKADOT_SEND_FEE + DOT_POLKADOT_RECEIVE_FEE + POLKADOT_DOT_EXISTENTIAL_DEPOSIT

    const bridge2Tx = await bridgeDotFromHydraDXToPolkadot(hydraApi, account, hydraAmountOut);

    /// Swap USDT -> DOT
    const swapAmountOut = await checkTokens(hydraApi, account, 5) ?
        hydraAmountOut + DOT_HYDRA_SEND_FEE :
        hydraAmountOut + DOT_HYDRA_SEND_FEE + HYDRA_DOT_EXISTENTIAL_DEPOSIT

    const swap = await swapUSDTForDot(swapAmountOut / 10_000_000_000)

    //const swapFee = swap.tradeFee.toNumber()

    const swapAmountIn = swap.amountIn.toNumber()

    const swapTx = swap.toTx(new BigNumber(1000000000000000000)).get<typeof bridge2Tx>()

    /// Bridge USDT z AssetHub -> HydraDX
    const assetHubAmountOut = await checkTokens(hydraApi, account, 10) ?
        swapAmountIn + USDT_HYDRA_RECEIVE_FEE + HYDRA_SWAP_TX_FEE :
        swapAmountIn + USDT_HYDRA_RECEIVE_FEE + HYDRA_SWAP_TX_FEE + HYDRA_USDT_EXISTENTIAL_DEPOSIT

    const bridge1Tx = await bridgeUsdtFromAssetHubToHydraDX(assetHubApi, account, assetHubAmountOut);

    // Return SwapTx
    return {
        amountIn: assetHubAmountOut,
        transactions: [
            bridge1Tx,
            swapTx,
            bridge2Tx,
            bridge3Tx,
        ]
    }
}
