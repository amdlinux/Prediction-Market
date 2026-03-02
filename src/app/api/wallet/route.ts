import { getAvailableBalance, getOrCreateWallet } from "@/lib/wallet";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const {userId} = await auth()

    if(!userId) {
        return NextResponse.json({error:'User not signed in'},{status:401})
    }

    const wallet = await getOrCreateWallet(userId);

    return NextResponse.json({
        CashbalanceCents:wallet.cashbalanceCents,
        ReservedCents:wallet.reservedCents,
        AvailableCents:getAvailableBalance(wallet)
    })
}