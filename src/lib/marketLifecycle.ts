import { db } from "./db";


export async function haltExpiredMarkets ():Promise<number> {

    const now = new Date();

    const result = await db.market.updateMany({
        where:{
            status:'OPEN',
            closingDate:{ lt:now }
        },
        data:{
            status:'HALTED'
        }
    })

    if(result.count > 0) {
        console.log(`[Lifecycle] hlated ${result.count} expired market(s)`)
    }

    return result.count
}