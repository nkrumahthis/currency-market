import { NewOrderRequest, Order, Trade, OrderBook } from "@/types";
import PriorityQueue from "./PriorityQueue";

export default class MatchingEngine {
	private buyOrders: PriorityQueue<Order>;
	private sellOrders: PriorityQueue<Order>;
	private trades: Array<Trade>;

	constructor() {
		this.buyOrders = new PriorityQueue(
			(a: Order, b: Order) => a.timestamp - b.timestamp
		); // Earlier order has priority

		this.sellOrders = new PriorityQueue(
			(a: Order, b: Order) => a.price - b.price
		); // Lower price has priority

		this.trades = [];
	}

	private generateOrderId(): string {
		return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
	}

	private validateOrder(order: Order): void {
		if (order.amount <= 0 || order.price <= 0) {
			throw new Error("Invalid order: Amount and price must be greater than zero.");
		}

		if (!order.baseCurrency?.match(/^[A-Z]{3}$/) || !order.quoteCurrency?.match(/^[A-Z]{3}$/)) {
			throw new Error("Invalid order: Base or quote currency is not properly formatted.");
		}
	}

	createOrder(newOrderRequest: NewOrderRequest): Order {
		const order = {
			...newOrderRequest,
			timestamp: Date.now(),
			id: this.generateOrderId(),
		} as Order;

		this.validateOrder(order);

		return order;
	}

	submitOrder(order: Order): Order {
		this.validateOrder(order);

		if (order.side === "buy") {
			this.matchBuyOrder(order);
		} else if (order.side === "sell") {
			this.matchSellOrder(order);
		}

		return order;
	}

	private matchBuyOrder(buyOrder: Order): void {
		while (!this.sellOrders.isEmpty() && buyOrder.amount > 0) {
			const bestSell = this.sellOrders.peek();

			if (!bestSell || buyOrder.price < bestSell.price) {
				break; // No match possible
			}

			const matchedSell = this.sellOrders.poll()!;
			this.executeTrade(buyOrder, matchedSell);
		}

		if (buyOrder.amount > 0) {
			this.buyOrders.add(buyOrder);
		}
	}

	private matchSellOrder(sellOrder: Order): void {
		while (!this.buyOrders.isEmpty() && sellOrder.amount > 0) {
			const bestBuy = this.buyOrders.peek();

			if (!bestBuy || sellOrder.price > bestBuy.price) {
				break; // No match possible
			}

			const matchedBuy = this.buyOrders.poll()!;
			this.executeTrade(matchedBuy, sellOrder);
		}

		if (sellOrder.amount > 0) {
			this.sellOrders.add(sellOrder);
		}
	}

	private executeTrade(buyOrder: Order, sellOrder: Order): void {
		const matchAmount = Math.min(buyOrder.amount, sellOrder.amount);

		const trade: Trade = {
			buyOrderId: buyOrder.id,
			buyerId: buyOrder.userId,
			sellerId: sellOrder.userId,
			sellOrderId: sellOrder.id,
			price: sellOrder.price, // Trade price is determined by the sell order
			amount: matchAmount,
			timestamp: Date.now(),
			baseCurrency: buyOrder.baseCurrency,
			quoteCurrency: buyOrder.quoteCurrency,
		};

		this.trades.push(trade);

		buyOrder.amount -= matchAmount;
		sellOrder.amount -= matchAmount;

		if (sellOrder.amount > 0) {
			this.sellOrders.add(sellOrder);
		}

		if (buyOrder.amount > 0) {
			this.buyOrders.add(buyOrder);
		}
	}

	getMarketPrice(): number | null {
		if (this.buyOrders.isEmpty() || this.sellOrders.isEmpty()) {
			return null;
		}

		const bestBid = this.buyOrders.peek()?.price || 0;
		const bestAsk = this.sellOrders.peek()?.price || 0;

		return (bestBid + bestAsk) / 2;
	}

	getRecentTrades(limit = 50): Trade[] {
		return this.trades.slice(-limit);
	}

	private getGroupedOrders(
		priorityQueue: PriorityQueue<Order>
	): { price: number; amounts: number[]; quoteCurrency: string }[] {
		// Group orders by price
		const groupedOrders: Record<
			number,
			{ amounts: number[]; quoteCurrency: string }
		> = {};

		priorityQueue.values().forEach((order) => {
			if (!groupedOrders[order.price]) {
				groupedOrders[order.price] = {
					amounts: [],
					quoteCurrency: order.quoteCurrency,
				};
			}
			groupedOrders[order.price].amounts.push(order.amount);
		});

		// Convert to array format
		return Object.entries(groupedOrders).map(
			([price, { amounts, quoteCurrency }]) => ({
				price: parseFloat(price),
				amounts,
				quoteCurrency,
			})
		);
	}

	getOrderBook(
		depth: number,
		detailed: boolean
	): OrderBook {
		const groupedAsks = this.getGroupedOrders(this.sellOrders).slice(0, depth);
		const groupedBids = this.getGroupedOrders(this.buyOrders).slice(0, depth);

		if (detailed) {
			return {
				asks: groupedAsks,
				bids: groupedBids,
			};
		} else {
			return {
				asks: groupedAsks.map(({ price, amounts, quoteCurrency }) => ({
					price,
					amount: amounts.reduce((sum, amount) => sum + amount, 0),
					quoteCurrency
				})),
				bids: groupedBids.map(({ price, amounts, quoteCurrency }) => ({
					price,
					amount: amounts.reduce((sum, amount) => sum + amount, 0),
					quoteCurrency
				})),
			};
		}
	}

}
