import { db } from "@/lib/db";
import { costToBuy } from "@/lib/lmsr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req:NextRequest,
    { params }:{ params: {marketId:string} }
) {

    const quantity = parseInt(
        req.nextUrl.searchParams.get('quantity') ?? '1'
    )

    if(isNaN(quantity) || quantity < 1 || quantity>1000) {
        return NextResponse.json({error:'Invalid Quantity'},{status:400})
    }

    //the below is different from what claude is using
    const { marketId } = await params;

    const market = await db.market.findUnique({
        where:{
            id:marketId
        },
        select:{
            yesShares:true,
            noShares:true,
            liquidityB:true
        }
    })

    if(!market) {
        return NextResponse.json({error:'Market not exist'},{status:401})
    }

    const yesCost = costToBuy("YES",quantity,market.yesShares,market.noShares,market.liquidityB);
    const noCost = costToBuy("NO",quantity,market.yesShares,market.noShares,market.liquidityB);

    return NextResponse.json({yesCost,noCost,quantity})
}