import { createClerkClient } from "@clerk/nextjs/server";
import { db } from "./db";
import { settleLoserOrRefund, SettleWinner } from "./wallet";
import { sendSettlementEmail } from "./email";

export async function settleMarket(marketId:string,outcome:'YES'|'NO') {

    const market = await db.market.findUnique({
        where:{
            id:marketId
        }
    })

    console.log(market);

    if(!market) throw new Error(`Market with market Id:${marketId} doesn't exist`);
    if(market.status !== 'OPEN') throw new Error(`Cannot settle for market which is already closed`);

    await db.market.update({
        where:{
            id:marketId
        },
        data:{
            status:'RESOLVED',outcome
        }
    })

    const positions = await db.position.findMany({
        where:{
            marketId
        }
    })

    if(positions.length === 0) {
        throw new Error(`No positions in the market to settle`);
    }

    const results = {settled : 0, winner:0, looser:0, error:[] as string[]};

    const clerkClient = createClerkClient({secretKey:process.env.CLERK_SECRET_KEY});

    for (const position of positions) {
        const costCents = position.priceCents*position.quantity;
        
        let userEmail:string|null = null;
        let userName:string|null = null;

        try {
            const user = await clerkClient.users.getUser(position.userId);
            userEmail = user.emailAddresses[0]?.emailAddress ?? ''
            userName = user.firstName ?? 'Trader';
        } catch (error) {
            //do nothing
        }

        try {
            if (position.side === outcome) {
                const payoutCents = position.quantity*100;
                await SettleWinner(position.userId,costCents,payoutCents,`Won: ${position.quantity}x ${position.side} on "${market.title}" — payout $${(payoutCents / 100).toFixed(2)}`)

                if(userEmail) {
                    await sendSettlementEmail({
                to         : userEmail,
                name       : userName!,
                marketTitle: market.title,
                outcome,
                userSide   : position.side,
                quantity   : position.quantity,
                priceCents : position.priceCents,
                payoutCents,
          })
                }

                results.winner++;
            } else {
                await settleLoserOrRefund(position.userId,costCents,`Lost: ${position.quantity}x ${position.side} on "${market.title}" — refund $${(costCents / 100).toFixed(2)}`,'BET_SETTLED');
                 if (userEmail) {
                await sendSettlementEmail({
                    to         : userEmail,
                    name       : userName!,
                    marketTitle: market.title,
                    outcome,
                    userSide   : position.side,
                    quantity   : position.quantity,
                    priceCents : position.priceCents,
                    payoutCents: costCents, // they get their cost back
                })
        }
                results.looser++;
            }
            results.settled++;
        } catch (error:any) {
            console.log(`Failed to settle the payment for the position ${position}`,error.message)
            results.error.push(position.userId);
        }
    }

    await db.position.deleteMany({
        where:{
            marketId
        }
    })

    return results
}


export async function voidMarket(marketId:string,reason:string) {
    const market = await db.market.findUnique({
        where:{
            id:marketId
        }
    })

    if(!market) throw new Error(`Market with ${marketId} doesn't exist`);
    if(market.status !== 'OPEN') {
        throw new Error(`Market with ${marketId} is not open`)
    }

    await db.market.update({
        where:{
            id:marketId
        },
        data:{
            status:'VOIDED'
        }
    })

    const positions = await db.position.findMany({
        where:{
            marketId
        }
    })

    if(positions.length === 0) throw new Error(`No one holds any position in the market`);

    const result = {settled:0,error:[] as string[]};

    for(const position of positions) {
        const costCents = position.priceCents*position.quantity;

        try {
            await settleLoserOrRefund(
                position.userId,
                costCents,
                `Refund: "${market.title}" was voided. Reason: ${reason}`,
                'BET_REFUNDED'
            )
            result.settled++;
        } catch (error:any) {
            console.log(`failed to refund for ${position.userId}`);
            result.error.push(`${position.userId}:${error.message}`)
        }
    }

    await db.position.deleteMany({
        where:{
            marketId
        }
    })

    //can also return results
    return {refunded:positions.length}
}
