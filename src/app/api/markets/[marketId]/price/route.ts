import { db } from "@/lib/db";
import { getPriceSummary } from "@/lib/lmsr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _req:NextRequest,
    { params }: { params: {marketId:string} }
) {
   
    const market = await db.market.findUnique({
        where:{
            id:params.marketId
        },
        select:{
            yesShares:true,
            noShares:true,
            liquidityB:true,
            status:true
        }
    })

    if(!market) {
        return NextResponse.json({error:'Market not found'},{status:404})
    }

    const price = getPriceSummary(market.yesShares,market.noShares,market.liquidityB);

    return NextResponse.json({price,status:market.status})
}   