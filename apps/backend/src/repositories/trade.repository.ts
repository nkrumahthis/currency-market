import { Order, OrderStatus, Trade, TradeStatus } from "@prisma/client";
import prisma from "../lib/prisma";

export default class TradeRepository {
	async getAll(): Promise<Trade[]> {
		return await prisma.trade.findMany({
			include: {
				buyOrder: true,
				sellOrder: true,
				buyer: true,
				seller: true,
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async getById(id: string): Promise<Trade | null> {
		return await prisma.trade.findUnique({ where: { id } });
	}

	async create(trade: Trade): Promise<Trade> {
		return await prisma.trade.create({ data: trade });
	}

	async getByCustomerId(customerId: string): Promise<Trade[]> {
		return await prisma.trade.findMany({ where: { buyerId: customerId } });
	}

	async getByPartnerId(partnerId: string): Promise<Trade[]> {
		return await prisma.trade.findMany({ where: { sellerId: partnerId } });
	}

	async getByCurrencyPair(currencyPairId: string): Promise<Trade[]> {
		return await prisma.trade.findMany({ where: { currencyPairId } });
	}

	async createTradeWithOrderUpdates(
		buyOrder: Order,
		sellOrder: Order,
		matchAmount: number,
		rate: number
	): Promise<Trade> {
		return await prisma.$transaction(async (tx) => {
			// 1. Create the trade record
			const newTrade = await tx.trade.create({
				data: {
					buyerId: buyOrder.userId,
					sellerId: sellOrder.userId,
					buyOrderId: buyOrder.id,
					sellOrderId: sellOrder.id,
					currencyPairId: buyOrder.currencyPairId,
					amount: matchAmount,
					rate,
					baseCurrency: buyOrder.baseCurrency,
					quoteCurrency: buyOrder.quoteCurrency,
					status: TradeStatus.PENDING,
				},
			});

			// 2. Update both orders' remaining amounts

			await tx.order.update({
				where: { id: buyOrder.id },
				data: {
					amount: buyOrder.amount,
					status:
						buyOrder.amount === 0 ? OrderStatus.FILLED : OrderStatus.FILLED,
				},
			});
			await tx.order.update({
				where: { id: sellOrder.id },
				data: {
					amount: sellOrder.amount,
					status:
						sellOrder.amount === 0
							? OrderStatus.FILLED
							: OrderStatus.PARTIALLY_FILLED,
				},
			});

			await tx.trade.update({
				where: { id: newTrade.id },
				data: { status: TradeStatus.SETTLED },
			})

			return newTrade;
		});
	}
}
