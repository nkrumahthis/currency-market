import { Invoice, Order, OrderStatus, OrderSide } from "@prisma/client";
import OrderRepository from "@/repositories/order.repository";
import { IMatchingEngine } from "@/domain/MatchingEngine";

export default class OrderService {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly matchingEngine: IMatchingEngine
	) {}

	async initializeEngine(): Promise<void> {
		await this.matchingEngine.initialize(await this.orderRepository.findActive());
	}

	async createFromInvoice(invoice: Invoice): Promise<Order> {
		return this.create({
			userId: invoice.customerId,
			side: OrderSide.BUY,
			currencyPairId: invoice.currencyPairId,
			amount: invoice.amount,
			rate: invoice.exchangeRate,
			baseCurrency: invoice.baseCurrency,
			quoteCurrency: invoice.quoteCurrency,
		});
	}

	async create(data: {
		userId: string;
		side: OrderSide;
		currencyPairId: string;
		amount: number;
		rate: number;
		baseCurrency: string;
		quoteCurrency: string;
	}) {
		const order = await this.orderRepository.create(data);
		await this.matchingEngine.submitOrder(order);
		return order;
	}

	async getAll() {
		return this.orderRepository.getAll();
	}

	async getById(id: string) {
		return this.orderRepository.getById(id);
	}

	async updateStatus(id: string, status: OrderStatus) {
		return this.orderRepository.updateStatus(id, status);
	}

	async findActive(): Promise<Order[]> {
        return this.orderRepository.findActive();
    }

	private validateOrder(order: {
		amount: number;
		price: number;
		baseCurrency: string;
		quoteCurrency: string;
	}): void {
		if (order.amount <= 0 || order.price <= 0) {
			throw new Error(
				"Invalid order: Amount and price must be greater than zero."
			);
		}

		if (
			!order.baseCurrency?.match(/^[A-Z]{3}$/) ||
			!order.quoteCurrency?.match(/^[A-Z]{3}$/)
		) {
			throw new Error(
				"Invalid order: Base or quote currency is not properly formatted."
			);
		}
	}
}
