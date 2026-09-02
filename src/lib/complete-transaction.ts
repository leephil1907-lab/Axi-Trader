import { prisma } from "@/lib/prisma";
import { calculateBonus } from "@/lib/promotions";

export async function completeTransaction(id: string, reviewer = "payment_provider") {
  return prisma.$transaction(async tx => {
    const transaction = await tx.transaction.findUnique({ where: { id }, include: { promotionEnrollment: { include: { promotion: true } }, bonusLedger: true } });
    if (!transaction) throw new Error("TRANSACTION_NOT_FOUND");
    if (transaction.status !== "pending") return transaction;
    const user = await tx.user.findUnique({ where: { id: transaction.userId } });
    if (!user) throw new Error("USER_NOT_FOUND");
    const amount = Number(transaction.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("INVALID_AMOUNT");
    if (transaction.type === "withdrawal" && user.balance < amount) throw new Error("INSUFFICIENT_BALANCE");
    let nextBalance = transaction.type === "deposit" ? user.balance + amount : user.balance - amount;
    const enrollment = transaction.promotionEnrollment;
    if (transaction.type === "deposit" && enrollment && enrollment.status === "active" && !enrollment.qualifyingDepositId) {
      const promotion = enrollment.promotion;
      const now = new Date();
      const countries = (promotion.eligibleCountries || "").split(",").map(v=>v.trim().toLowerCase()).filter(Boolean);
      const accounts = (promotion.eligibleAccountTypes || "").split(",").map(v=>v.trim().toLowerCase()).filter(Boolean);
      const eligible = promotion.active && promotion.startsAt <= now && (!promotion.endsAt || promotion.endsAt >= now) && transaction.currency.toUpperCase() === promotion.currency.toUpperCase() && amount >= promotion.minDeposit && (!countries.length || countries.includes((user.country||"").toLowerCase())) && (!accounts.length || accounts.includes(user.accountType.toLowerCase()));
      const alreadyDeposited = promotion.firstDepositOnly ? Boolean(await tx.transaction.findFirst({ where:{userId:user.id,type:"deposit",status:"completed",id:{not:id}},select:{id:true} })) : false;
      if (eligible && !alreadyDeposited) {
        const bonus = calculateBonus(amount,promotion.bonusPercent,promotion.maxBonus);
        if (bonus > 0) {
          await tx.bonusLedger.create({ data:{userId:user.id,promotionId:promotion.id,enrollmentId:enrollment.id,transactionId:id,type:"credit",status:"credited",amount:bonus,currency:transaction.currency,description:`${promotion.name} — ${promotion.bonusPercent}% deposit bonus`} });
          nextBalance += bonus;
          await tx.promotionEnrollment.update({where:{id:enrollment.id},data:{status:"completed",qualifyingDepositId:id,completedAt:now}});
        }
      }
    }
    await tx.user.update({ where:{id:user.id}, data:{balance:nextBalance,equity:nextBalance,freeMargin:nextBalance} });
    return tx.transaction.update({where:{id},data:{status:"completed",reviewedAt:new Date(),reviewedBy:reviewer}});
  });
}
