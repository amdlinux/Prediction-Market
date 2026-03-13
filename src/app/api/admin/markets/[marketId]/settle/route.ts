import { settleMarket } from "@/lib/settlement";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const settleSchema = z.object({
    outcome:z.enum(['YES','NO'])
})

export async function POST(
    req:NextRequest,
    context: { params: Promise<{ marketId: string }> }
) {
    const {userId} = await auth();

    if(!userId) {
        return NextResponse.json({error:'Not Signed In'},{status:401});
    }
    
    //a function to check the role of the user is admin or not - this is not implemented yet

    const adminSecret = req.headers.get('x-admin-secret');
    if(adminSecret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({error:'Forbidden'},{status:403})
    }

    const parsed = settleSchema.safeParse(await req.json());

    if(!parsed.success) {
        return NextResponse.json({error:"Outcome must be YES or No"},{status:400})
    }

    try {
        const { marketId } = await context.params;
        const results = await settleMarket(marketId,parsed.data.outcome);
        console.log(results);
        return NextResponse.json({success:true,results},{status:200});
    } catch (err:any) {
        return NextResponse.json({success:false},{status:422})
    }
}