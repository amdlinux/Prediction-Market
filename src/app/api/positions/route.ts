import { db } from "@/lib/db";
import { costToBuy, getNewShares, getPriceSummary } from "@/lib/lmsr";
import { practiceReserveForBet, reserveBets, resetPracticeAccount } from "@/lib/wallet";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { success, z } from "zod";


const PositionSchema = z.object({
    marketId:z.string(),
    side:z.enum(['YES','NO']),
    quantity:z.number().int().min(1).max(1000),
    isPractice:z.boolean().default(false)
})


export async function POST(req:NextRequest) {
    
    const {userId} = await auth();

    if(!userId) {
        return NextResponse.json({error:'Not signed In'},{status:401})
    }

    const body = await req.json();
    const parsed = PositionSchema.safeParse(body);
    if(!parsed.success) {
        return NextResponse.json({error:parsed.error.flatten()},{status:400})
    }

    const {marketId,side,quantity,isPractice} = parsed.data;

    const market = await db.market.findUnique({
        where:{
            id:marketId
        }
    })

    if(!market) {
        return NextResponse.json({error:"Market not found"},{status:404})
    }
    if(market.status!=='OPEN') {
        return NextResponse.json({error:"Market not OPEN"},{status:409})
    }

    //does the user user already is holding position in the market.

    const existing = await db.position.findUnique({
        where:{
            userId_marketId_isPractice:{userId,marketId,isPractice}
        }
    })
    if(existing && existing.side !== side) {
        return NextResponse.json(
            {error:`You already bet ${existing.side} on this market`},
            {status:409}
        )
    }



    const totalCosts = costToBuy(side,quantity,market.yesShares,market.noShares,market.liquidityB);

    const pricePerContract = Math.round(totalCosts/quantity);

    try {

        if(isPractice) {
            await practiceReserveForBet(userId,totalCosts,`[Practice] Bet ${quantity}x ${side} on "${market.title}"`)
        } else {
            await reserveBets(
                userId,
                totalCosts,
                `taking a position of ${quantity} on ${side} in ${market.title} at ${pricePerContract} pe contract`
            )
        }
    } catch (error:any) {
        return NextResponse.json({message:'No enough balance'},{status:401})
    }
    
    //create or update the position

    const {newYesShares,newNoShares} = getNewShares(side,quantity,market.yesShares,market.noShares);

    const newPriceSummary = getPriceSummary(newYesShares,newNoShares,market.liquidityB);

    await db.$transaction([
        //update the market's share counts

        db.market.update({
            where:{
                id:market.id
            },
            data:{
                yesShares:newYesShares,
                noShares:newNoShares
            }
        }),

        ...(existing ? [
            db.position.update({
                where:{
                    id:existing.id
                },
                data:{
                    quantity:{increment:quantity},
                    priceCents:pricePerContract
                }
            })
        ] : [
            db.position.create({
                data:{
                    userId,
                    marketId,
                    side,
                    quantity,
                    priceCents:pricePerContract,
                    isPractice
                }
            })
        ]),

        db.priceHistory.create({
            data:{
                marketId,
                yesPricePct:newPriceSummary.yesCents
            }
        })
    ])

    return NextResponse.json({
        success:true,
        costCents:totalCosts,
        pricePerContract,
        newPrice:newPriceSummary
    },{status:201})
}   