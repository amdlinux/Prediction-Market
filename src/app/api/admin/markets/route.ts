import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const createMarketSchema = z.object({
    title: z.string().min(10).max(100),
    description: z.string().max(500).default(''),
    category:z.string().min(1),
    closingDate:z.string().refine(d => !isNaN(Date.parse(d)),{
        message:'Invalid Date'
    }),
    liquidityB:z.number().min(10).max(1000).default(100)
})

export async function POST(req:NextRequest) {

    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({error:'Not signed In'},{status:401})
    }

    const adminSecret = req.headers.get(`x-admin-secret`);
    console.log(adminSecret);
    if(adminSecret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({error:'Forbidden'},{status:403})
    }

    const parsed = createMarketSchema.safeParse(await req.json());

    if(!parsed.success) {
        return NextResponse.json({error:parsed.error.flatten()},{status:400})
    }

    const { title,description,category,closingDate,liquidityB } = parsed.data

    if(new Date(closingDate) <= new Date()) {
        return NextResponse.json({error:'Closing date cannot be in past'},{status:400})
    }

    const market = await db.market.create({
        data:{
            title,
            description,
            category,
            closingDate: new Date(closingDate),
            liquidityB
        }
    })

    return NextResponse.json({market},{status:201})
}