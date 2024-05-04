import { test, expect } from '@playwright/test';
import { bridgeAndSwapAsync } from "../../src/bridgeAndSwap"

test('', async ({ page }) => {

  const result = await bridgeAndSwapAsync()

  console.log(result.fees.valueOf())
  expect(result.fees.valueOf() === "0").toBeFalsy()
});
