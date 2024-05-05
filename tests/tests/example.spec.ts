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

/// Helper method that returns the Alice account
async function getOtherAccount() {
  await cryptoWaitReady()

  // Create an instance of the Keyring
  const keyring = new Keyring({ type: 'sr25519' })

  // Create pair and add Alice to keyring pair dictionary (with account seed)
  const other = keyring.addFromUri('//Other')

  return other
}

test('Alice pays', async ({ page }) => {

  const alice = await getAlice()

  const result = await bridgeAndSwapAsync(alice, 10_000_000_000)

  console.log("Alice pays: " + result.amountIn)
});

test('Other pays', async ({ page }) => {

  const other = await getOtherAccount()

  const result = await bridgeAndSwapAsync(other, 10_000_000_000)

  console.log("Other accounts pay: " + result.amountIn)
});


