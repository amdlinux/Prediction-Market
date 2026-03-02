"use client"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"


type Wallet = {
    CashbalanceCents: number
    ReservedCents: number
    AvailableCents: number
}

export default function WalletBar() {
    const [wallet,setwallet] = useState<Wallet|null>(null);
    const [loading,setLoading] = useState<boolean>(false);
    const [error,setError] = useState('')

    useEffect(() => {
            // setLoading(true);
            fetch('/api/wallet')
                .then(r=>r.json())
                .then(data => setwallet(data))
    },[])

    if(loading) return <div>Loading...</div>

    const handleDeposit = async(amount:number) => {
        setLoading(true);
        setError('')
        try {
            const res = await fetch('/api/wallet/deposit', {
                method:'POST',
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify({ amount }),
            })
            console.log(res.status);
            const data = await res.json();
            if(!res.ok){
                throw new Error(data.error);
            }
            const updated = await fetch('/api/wallet').then(r=>r.json());
            setwallet(updated);
            console.log('getting credited')
        } catch (error:any) {
            setError(error.message);
            console.log('hitting error ')
        }finally {
            setLoading(false);
        }
    }

    if(!wallet) return null;

    return (
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-between">

                {/* Balance display */}
                <div className="flex items-center gap-6 text-sm">
                <div>
                    <span className="text-gray-500">Total  </span>
                    <span className="text-white font-medium">
                    {`$${wallet.CashbalanceCents}`}
                    </span>
                </div>
                <div>
                    <span className="text-gray-500">In bets  </span>
                    <span className="text-yellow-400 font-medium">
                    {`$${wallet.ReservedCents}`}
                    </span>
                </div>
                <div>
                    <span className="text-gray-500">Available  </span>
                    <span className="text-green-400 font-medium">
                    {`$${wallet.AvailableCents}`}
                    </span>
                </div>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-red-400 text-xs mr-2">{error}</span>
          )}
          {[10_00, 50_00, 100_00].map(amount => (
            <button
              key={amount}
              onClick={() => handleDeposit(amount)}
              disabled={loading}
              className="flex items-center gap-1 bg-indigo-700 hover:bg-indigo-600
                         disabled:opacity-50 text-white text-xs px-3 py-1.5
                         rounded-lg transition hover:cursor-pointer"
            >
              <PlusCircle size={12} />
              +{`$${amount}`}
            </button>
          ))}
        </div>

      </div>
    </div>
    )
}