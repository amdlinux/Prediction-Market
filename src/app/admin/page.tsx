import AdminMarketList from "@/components/AdminMarketList";
import { db } from "@/lib/db";

export default async function AdminPage() {
    const markets = await db.market.findMany({
        orderBy:{
            createdAt:'desc'
        }
    })

    return (
        <div>
            <AdminMarketList markets={markets}/>
        </div>
    )
}