import { test, expect } from '@playwright/test';
import { bridgeAndSwapAsync } from "../../src/bridgeAndSwap"
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { Keyring } from '@polkadot/api';

/// Helper method that returns the Alice account
async function getAlice() {
  await cryptoWaitReady()

  // Create an instance of the Keyring
  const keyring = new Keyring({ type: 'sr25519' })

  // Create pair and add Alice to keyring pair dictionary (with account seed)
  const alice = keyring.addFromUri('//Alice')

  return alice
}

test('', async ({ page }) => {

  const alice = await getAlice()

  const result = await bridgeAndSwapAsync(alice)

  console.log(result.fees.valueOf())
  expect(result.fees.valueOf() === "0").toBeFalsy()
});


