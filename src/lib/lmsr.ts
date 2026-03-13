// src/lib/lmsr.ts

/**
 * LMSR Pricing Engine
 *
 * All functions are pure — they take numbers and return numbers.
 * No database calls here. This makes it easy to test.
 *
 * Terminology:
 *   qYes       — total YES shares in the market (starts at 0)
 *   qNo        — total NO shares in the market (starts at 0)
 *   b          — liquidity parameter (we use 100 as default)
 *   quantity   — number of contracts being bought
 */

// ── Core formula helpers ──────────────────────────────────────

/**
 * The LMSR cost function value at a given state.
 * This is the "market's book value" — the total it would pay out
 * in the worst case.
 *
 * C(qYes, qNo) = b × ln(e^(qYes/b) + e^(qNo/b))
 */
function costFunction(qYes: number, qNo: number, b: number): number {
  // Use log-sum-exp trick to avoid overflow with large numbers
  const maxQ = Math.max(qYes, qNo)
  return b * (Math.log(
    Math.exp((qYes - maxQ) / b) +
    Math.exp((qNo  - maxQ) / b)
  ) + maxQ / b)
}

// ── Public API ────────────────────────────────────────────────

/**
 * Get the current YES price as a number between 0 and 1.
 * Multiply by 100 to get cents.
 *
 * Example: getYesPrice(60, 40, 100) → 0.55 (55¢)
 */
export function getYesPrice(qYes: number, qNo: number, b: number): number {
  const eYes = Math.exp((qYes - Math.max(qYes, qNo)) / b)
  const eNo  = Math.exp((qNo  - Math.max(qYes, qNo)) / b)
  return eYes / (eYes + eNo)
}

/**
 * Get the current NO price. Always = 1 - yesPrice.
 * YES + NO always = 100¢ exactly.
 */
export function getNoPrice(qYes: number, qNo: number, b: number): number {
  return 1 - getYesPrice(qYes, qNo, b)
}

/**
 * Calculate the cost in CENTS to buy `quantity` contracts of `side`.
 *
 * This is what the user will actually pay.
 * The cost goes up slightly with each contract bought
 * because it moves the price.
 *
 * Example:
 *   Market at 50/50. Buy 10 YES.
 *   costToBuy('YES', 10, 0, 0, 100) → ~500 cents ($5.00)
 *   After the buy: YES ≈ 55¢, NO ≈ 45¢
 */
export function costToBuy(
  side    : 'YES' | 'NO',
  quantity: number,
  qYes    : number,
  qNo     : number,
  b       : number,
): number {
  // Cost = difference in market value before and after the trade
  const before = costFunction(qYes, qNo, b)

  const after = side === 'YES'
    ? costFunction(qYes + quantity, qNo, b)
    : costFunction(qYes, qNo + quantity, b)

  // Convert to cents and round to nearest cent
  return Math.round((after - before) * 100)
}

/**
 * Get the new qYes and qNo after a buy.
 * Used to update the market in the database after a trade.
 */
export function getNewShares(
  side    : 'YES' | 'NO',
  quantity: number,
  qYes    : number,
  qNo     : number,
): { newYesShares: number; newNoShares: number } {
  return {
    newYesShares: side === 'YES' ? qYes + quantity : qYes,
    newNoShares : side === 'NO'  ? qNo  + quantity : qNo,
  }
}

/**
 * Get a human-readable price summary for a market.
 * Returns prices as cents (0-100), rounded to nearest cent.
 *
 * Example:
 *   getPriceSummary(60, 40, 100)
 *   → { yesCents: 55, noCents: 45, yesDisplay: '55¢', noDisplay: '45¢' }
 */
export function getPriceSummary(qYes: number, qNo: number, b: number) {
  const yesRaw  = getYesPrice(qYes, qNo, b)
  const yesCents = Math.round(yesRaw * 100)
  const noCents  = 100 - yesCents   // always sums to 100¢

  return {
    yesCents,
    noCents,
    yesDisplay: `${yesCents}¢`,
    noDisplay : `${noCents}¢`,
  }
}

/**
 * Calculate the payout a user will receive at settlement.
 * Winners always receive exactly $1.00 (100¢) per contract.
 * This doesn't change with LMSR — only the entry price changes.
 */
export function settlementPayout(quantity: number): number {
  return quantity * 100   // cents
}