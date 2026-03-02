// src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send a settlement result email.
 * Called after every market settles for each affected user.
 */
export async function sendSettlementEmail({
  to,
  name,
  marketTitle,
  outcome,
  userSide,
  quantity,
  priceCents,
  payoutCents,
}: {
  to          : string
  name        : string
  marketTitle : string
  outcome     : string
  userSide    : string
  quantity    : number
  priceCents  : number
  payoutCents : number
}) {
  const won      = userSide === outcome
  const costCents = quantity * priceCents
  const profit   = payoutCents - costCents

  const subject = won
    ? `🎉 You won $${(payoutCents / 100).toFixed(2)} on "${marketTitle}"`
    : `Market resolved: "${marketTitle}"`

  const body = won
    ? `
        <h2>You won! 🎉</h2>
        <p>The market <strong>"${marketTitle}"</strong> resolved <strong>${outcome}</strong>.</p>
        <p>You bet <strong>${userSide}</strong> — that's a win!</p>
        <hr />
        <table>
          <tr><td>Contracts held</td><td>${quantity}</td></tr>
          <tr><td>Your entry price</td><td>$${(priceCents / 100).toFixed(2)}</td></tr>
          <tr><td>Cost basis</td><td>$${(costCents / 100).toFixed(2)}</td></tr>
          <tr><td>Payout received</td><td><strong>$${(payoutCents / 100).toFixed(2)}</strong></td></tr>
          <tr><td>Your profit</td><td><strong style="color:green">+$${(profit / 100).toFixed(2)}</strong></td></tr>
        </table>
        <p>Your wallet has been updated. Check your portfolio.</p>
      `
    : `
        <h2>Market resolved</h2>
        <p>The market <strong>"${marketTitle}"</strong> resolved <strong>${outcome}</strong>.</p>
        <p>You bet <strong>${userSide}</strong> — better luck next time.</p>
        <hr />
        <p>Your cost basis of <strong>$${(costCents / 100).toFixed(2)}</strong> 
           has been returned to your available balance.</p>
        <p>Check your portfolio to see your updated balance.</p>
      `

  try {
    await resend.emails.send({
      from   : 'Kalshi <notifications@yourdomain.com>',
      to     : [to],
      subject,
      html   : `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px">
          <h1 style="color:#6366f1">Kalshi</h1>
          ${body}
        </div>
      `,
    })
  } catch (err) {
    // Email failure should never block settlement
    // Just log it and move on
    console.error('Failed to send settlement email:', err)
  }
}