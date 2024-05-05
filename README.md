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
