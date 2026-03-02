//api to get transaction history of users last 20 transactions

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    
    const {userId} = await auth();

    if(!userId) {
        return NextResponse.json({error:'Not signed in'},{status:401});
    }

    const transaction = await db.transaction.findMany({
        where:{
            userId
        },
        orderBy:{
            createdAt:'desc'
        },
        take:20
    });

    return NextResponse.json({transaction})
}