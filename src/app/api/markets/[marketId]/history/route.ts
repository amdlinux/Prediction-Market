import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
    _req:NextRequest,
    { params }:{ params:{marketId:string} }
) {

    const history = await db.priceHistory.findMany({
        where:{id:params.marketId},
        orderBy:{createdAt:'asc'},
        take:100
    })

    const chartData = history.map((h,i) => ({
        trade:i+1,
        Yes:h.yesPricePct,
        No:1-h.yesPricePct 
    }))

    chartData.unshift({trade:0,Yes:50,No:50})

    return NextResponse.json({chartData})
}