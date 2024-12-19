import prisma from "@/lib/prisma";
import { Order, OrderStatus, OrderSide } from "@prisma/client";

export default class OrderRepository {
	constructor() {}

	async create(data: {
		userId: string;
		side: OrderSide;
		currencyPairId: string;
		amount: number;
		rate: number;
		baseCurrency: string;
		quoteCurrency: string;
	}): Promise<Order> {
		return await prisma.order.create({ data: {...data, id: this.generateOrderId(), status: OrderStatus.PENDING } });
	}
    private generateOrderId(): string {
        return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }

	async getAll() {
		return await prisma.order.findMany();
	}

	async getById(id: string) {
		return await prisma.order.findUnique({ where: { id } });
	}

	async findActive(): Promise<Order[]> {
		return await prisma.order.findMany({
			where: {
				status: {
					in: ['PENDING', 'NEW', 'PARTIALLY_FILLED']
				}
			}, orderBy: {
				createdAt: 'asc'
			}
		})
	}

	async updateStatus(id: string, status: OrderStatus): Promise<Order> {
		return await prisma.order.update({
			where: { id },
			data: { status },
		});
	}
}
