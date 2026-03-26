/**
 * Calculate unrealized P&L for an open position.
 *
 * "Unrealized" means the position is still open —
 * this is what you'd make/lose if you sold right now.
 *
 * @param quantity       - number of contracts held
 * @param entryPriceCents - what you paid per contract (in cents)
 * @param currentPriceCents - current market price for your side (in cents)
 */

export function unrealizedPnL(
    quantity:number,
    entryPriceCents:number,
    currentPriceCents:number
    ):{
        costCents:number,
        currentValueCents:number,
        pnlCents:number,
        pnlPercent:number
    } {
        const costCents = quantity*entryPriceCents
        const currentValueCents = quantity*currentPriceCents
        const pnlCents = currentValueCents - costCents

        const pnlPercent = costCents === 0 ? 0 : Math.round((pnlCents/costCents)*1000)/10

        return {costCents,currentValueCents,pnlCents,pnlPercent}
}

export function realizedPnL(
    quantity:number,
    entryPriceCents:number,
    won:boolean
):{
    costCents:number,
    payoutCents:number,
    pnlCents:number,
    pnlPercent:number
} {
    const costCents = quantity*entryPriceCents
    const payoutCents = won ? quantity*100 : costCents
    const pnlCents = payoutCents - costCents
    const pnlPercent = costCents === 0 ? 0 : Math.round((pnlCents/costCents)*1000)/10

    return { costCents,payoutCents,pnlCents,pnlPercent }
}

export function portfolioValue(
    cashBalanceCents:number,
    positions:Array<{
        quantity:number,
        entryPriceCents:number,
        currentPriceCents:number
    }>
):{
    cashCents:number,
    openPositionValueCents:number,
    totalValueCents:number,
    totalUnrealizedPnL:number
} {
    const openPositionValueCents = positions.reduce((sum,pos) => {
        return sum + (pos.quantity*pos.currentPriceCents)
    },0)

    const totalPositionCosts = positions.reduce((sum,pos) => {
        return sum + (pos.quantity*pos.entryPriceCents)
    },0)

    const totalUnrealizedPnL = openPositionValueCents - totalPositionCosts

    return {
        cashCents:cashBalanceCents,
        openPositionValueCents,
        totalValueCents: cashBalanceCents+openPositionValueCents,
        totalUnrealizedPnL
    }
}

// -----Formatting Helpers-----------

export const $ = (cents: number) =>
  `$${Math.abs(cents / 100).toFixed(2)}`

export function formatPnL(cents: number): string {
  const sign = cents >= 0 ? '+' : '−'
  return `${sign}${$(cents)}`
}

export function pnlColor(cents: number): string {
  if (cents > 0) return 'text-green-400'
  if (cents < 0) return 'text-red-400'
  return 'text-gray-400'
}

export function pnlBg(cents: number): string {
  if (cents > 0) return 'bg-green-900/20 border-green-800/40'
  if (cents < 0) return 'bg-red-900/20   border-red-800/40'
  return 'bg-gray-900 border-gray-800'
}