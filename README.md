# ParaSwap

Bridge and Swap currencies across multiple parachains in just 1 function call.
Easily integrate this package into your project in just 2 lines of code.

# Inicialize

```
npm i

npm run build
```

Each npm update is handled automatically when a new commit is pushed to the main branch.

# Tests

Please, start the chopsticks before running automated tests.

```
npx playwright test
```

You can also specify the exact test you want to run, just like this:

```
npx playwright test airdropDOT.spec.ts
```

# Chopsticks

```
npx @acala-network/chopsticks@latest xcm -r polkadot -p hydradx -p statemint
```

# How to use in the existing dApp

The package is published on NPM: https://www.npmjs.com/package/parachainswap
```
npm i parachainswap
```

```
import { bridgeAndSwapAsync } from "../../src/bridgeAndSwap"
import { submitSwapTx } from "../../src/submitSwapTx"

const result = await bridgeAndSwapAsync(account, 10_000_000_000, true) // Request to swap for 1 DOT

// Show the amount of USDT to pay (fees and Existential Deposits are included, if needed)
console.log("Other pays: " + result.amountIn)

await submitSwapTx(result.transactions, account);   // Run the transactions
                                                    // Takes ~ 2 mins to complete
```