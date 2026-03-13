import { haltExpiredMarkets } from "@/lib/marketLifecycle";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {

    const authHeader = req.headers.get('authorization');

    if(authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({error:'Unauthorised'},{status:404})
    }

    const halted = await haltExpiredMarkets();
    return NextResponse.json({halted});
}