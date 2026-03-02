import { db } from "@/lib/db";
import { reserveBets } from "@/lib/wallet";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const PositionSchema = z.object({
    marketId:z.string(),
    side:z.enum(['YES','NO']),
    quantity:z.number().int().positive(),
    priceCents:z.number().int().min(1).max(99).default(50)
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

    const {marketId,side,quantity,priceCents} = parsed.data;
    const totalCostCents = quantity*priceCents;

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
            userId_marketId:{userId,marketId}
        }
    })
    if(existing && existing.side !== side) {
        return NextResponse.json(
            {error:`You already bet ${existing.side} on this market`},
            {status:409}
        )
    }

    try {
        await reserveBets(
            userId,
            totalCostCents,
            `taking a position of ${quantity} on ${side} on ${market.title} `
        )
    } catch (error:any) {
        return NextResponse.json({message:'No enough balance'},{status:401})
    }
    
    //create or update the position

    const position = await db.position.upsert({
        where: {userId_marketId:{userId,marketId}},
        update:{quantity:{increment:quantity}},
        create:{userId,marketId,side,quantity}
    })

    return NextResponse.json({position},{status:201})
}   