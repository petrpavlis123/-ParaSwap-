import { ApiPromise, WsProvider } from "@polkadot/api";
import { decodeAddress } from '@polkadot/util-crypto'

export async function bridgeDotFromHydraDXToPolkadot(account, amount) {
    const hydraApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8000') });

    const dest = {
        V3: {
            parents: 1,
            interior: {
                X1: {
                    AccountId32: {
                        network: null,
                        id: decodeAddress(account.address)
                    }
                }
            }
        }
    }

    const tx = hydraApi.tx.xTokens.transfer(
        5,
        amount,
        dest,
        { Unlimited: {} }
    );

    console.log(tx.toHex())

    return tx
}

export async function bridgeDotFromPolkadotToAssetHub(account, amount) {
    const polkadotApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8002') });

    const dest = {
        V3: {
            parents: 0,
            interior: {
                X1: {
                    Parachain: 1000
                }
            }
        }
    }

    const beneficiary = {
        V3: {
            parents: 0,
            interior: {
                X1: {
                    AccountId32: {
                        network: null,
                        id: decodeAddress(account.address)
                    }
                }
            }
        }
    }

    const assets = {
        V3: [
            {
                id: {
                    Concrete: {
                        parents: 0,
                        interior: "Here",
                    }
                },
                fun: {
                    Fungible: amount
                }
            }
        ]
    }

    const tx = polkadotApi.tx.xcmPallet.limitedTeleportAssets(
        dest,
        beneficiary,
        assets,
        0,
        { Unlimited: {} }
    );

    console.log(tx.toHex())

    return tx
}

export async function bridgeUsdtFromAssetHubToHydraDX(account, amount) {
    const assetHubApi = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:8001') });

    const dest = {
        V3: {
            interior: {
                X1: {
                    Parachain: 2034
                }
            },
            parents: 1
        }
    }

    const beneficiary = {
        V3: {
            interior: {
                X1: {
                    AccountId32: {
                        network: null,
                        id: decodeAddress(account.address)
                    }
                }
            },
            parents: 0
        }
    }

    const assets = {
        V3: [
            {
                fun: { Fungible: amount },
                id: {
                    Concrete: {
                        interior: {
                            X2: [
                                { PalletInstance: 50 },
                                { GeneralIndex: 1984 }
                            ]
                        },
                        parents: 0
                    }
                }
            }
        ]
    }

    const tx = assetHubApi.tx.polkadotXcm.limitedReserveTransferAssets(
        dest,
        beneficiary,
        assets,
        0,
        { Unlimited: {} }
    );

    console.log(tx.toHex())

    return tx
}
