import { resetPracticeAccount } from "@/lib/wallet";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST() {
    const {userId} = await auth()

    if(!userId) {
        return NextResponse.json({error:'Not signed In'},{status:401})
    }

    await resetPracticeAccount(userId)
    return NextResponse.json({success:true})
}