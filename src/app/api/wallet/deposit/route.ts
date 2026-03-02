import { deposit } from "@/lib/wallet";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const DepositSchema = z.object({
    amountCents:z.coerce.number().int().positive()
})

export async function POST(req:NextRequest) {
    const {userId} = await auth();

    if(!userId) {
        return NextResponse.json({message:'User is not signed in'},{status:401})
    }

    const body = await req.json();
    const parsed = DepositSchema.safeParse({
        amountCents:body.amount
    });
    if(!parsed.success) {
        return NextResponse.json({message:"Invalid amount"},{status:400})
    } 

    const wallet = await deposit(userId,parsed.data.amountCents);
    return NextResponse.json({wallet},{status:201})
}