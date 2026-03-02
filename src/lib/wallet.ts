import { Wallet } from "@prisma/client";
import { db } from "./db";

export async function getOrCreateWallet(userId:string) {
    return db.wallet.upsert({
        where:{userId},
        update:{},
        create:{userId,cashbalanceCents:0,reservedCents:0}
    })
}

export function getAvailableBalance(wallet:Wallet) {
  return wallet.cashbalanceCents - wallet.reservedCents
}

export async function deposit(userId:string,amountCents:number) {
    if(amountCents<=0) throw new Error(`Deposit amount must be positive`)

    const [wallet] = await db.$transaction([
        db.wallet.upsert({
            where:{userId},
            update:{cashbalanceCents:{increment:amountCents}},
            create:{userId,cashbalanceCents:amountCents,reservedCents:0}
        }),
        db.transaction.create({
            data:{
                userId,
                amountCents,
                type:"DEPOSIT",
                description:`Deposited $${(amountCents/100).toFixed(2)}`,
            }
        })
    ])

    return wallet
}

export async function reserveBets(
    userId:string,
    amountCents:number,
    description:string
) {
    const wallet = await getOrCreateWallet(userId);
    const availableBalance = getAvailableBalance(wallet);

    if(availableBalance<amountCents) {
        throw new Error(`Insufficient funds! you need ${(amountCents/100).toFixed(2)}, but only have ${(availableBalance/100).toFixed(2)} left.`)
    }

    const [updatedWallet] = await db.$transaction([
        db.wallet.update({
            where:{userId},
            data:{reservedCents:{increment:amountCents}}
        }),
        db.transaction.create({
            data:{
                userId,
                amountCents,
                type:"BET_PLACED",
                description
            }
        })
    ])

    return updatedWallet
}

export async function releaseReserved(
    userId:string,
    amountCents:number,
    description:string,
    releaseOnly:boolean = true
) {
    return db.wallet.update({
        where:{userId},
        data:{
            reservedCents:{decrement:amountCents},
            cashbalanceCents: releaseOnly? undefined : {decrement:amountCents}
        },
    })
}

export async function creditPayout(
    userId:string,
    amountCents:number,
    description:string
) {
    const [wallet] = await db.$transaction([
        db.wallet.update({
            where:{userId},
            data:{cashbalanceCents:{increment:amountCents}}
        }),
        db.transaction.create({
            data:{
                userId,
                amountCents,
                description,
                type:"BET_SETLED"
            }
        })
    ])

    return wallet
}

export async function SettleWinner(
    userId:string,
    costCents:number,
    payoutCents:number,
    description:string
) {
    await db.$transaction([
        db.wallet.update({
            where:{userId:userId},
            data:{
                reservedCents:{decrement:costCents},
                cashbalanceCents:{decrement:costCents}
            }
        }),

        db.wallet.update({
            where:{userId:userId},
            data:{
                cashbalanceCents:{increment:payoutCents}
            }
        }),

        db.transaction.create({
            data:{
                userId,
                type:"BET_SETTLED",
                amountCents:payoutCents,
                description
            }
        })
    ])
}

export async function settleLoserOrRefund(
    userId:string,
    costCents:number,
    description:string,
    txType:'BET_SETTLED'|'BET_REFUNDED' = 'BET_SETTLED',
) {
    await db.$transaction([
        db.wallet.update({
            where:{userId:userId},
            data:{
                reservedCents:{
                    decrement:costCents
                }
            }
        }),

        db.transaction.create({
            data:{
                userId,
                amountCents:costCents,
                type:txType,
                description,
            }
        })
    ])
}