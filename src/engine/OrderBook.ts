import { Order, OrderBookFull, OrderBookSummary } from "@/types";
import PriorityQueue from "./PriorityQueue";

export default class OrderBook {
	private sellOrders;
	private buyOrders;
	private orderBookSummary: OrderBookSummary;
	private orderBookFull: OrderBookFull;

	constructor(
		sellOrders: PriorityQueue<Order>,
		buyOrders: PriorityQueue<Order>
	) {
		this.sellOrders = sellOrders;
		this.buyOrders = buyOrders;

		this.orderBookSummary = {
			asks: new Map(),
			bids: new Map(),
		};
		this.orderBookFull = {
			asks: new Map(),
			bids: new Map(),
		};
	}

	updateAll() {
		for (const order of this.buyOrders.values()) {
			this.updateBidsWithOrder(order);
		}

		for (const order of this.sellOrders.values()) {
			this.updateAsksWithOrder(order);
		}
	}

	updateAsksWithOrder(order: Order) {
		const existingAmount = this.orderBookSummary.asks.get(order.price) || 0;
		this.orderBookSummary.asks.set(order.price, existingAmount + order.amount);

		const existingAmounts: number[] =
			this.orderBookFull.asks.get(order.price) || [];
		existingAmounts.push(order.amount);
		this.orderBookFull.asks.set(order.price, existingAmounts);
	}

	//
	updateBidsWithOrder(order: Order) {
		const existingAmount = this.orderBookSummary.bids.get(order.price) || 0;
		this.orderBookSummary.bids.set(order.price, existingAmount + order.amount);

		const existingAmounts: number[] =
			this.orderBookFull.bids.get(order.price) || [];
		existingAmounts.push(order.amount);
		this.orderBookFull.bids.set(order.price, existingAmounts);
	}

	updateWithOrder(order: Order) {
		if (order.side === "buy") {
			this.updateBidsWithOrder(order);
		} else if (order.side === "sell") {
			this.updateAsksWithOrder(order);
		}
	}

	getFull(depth = 10): {
		bids: { price: number; amount: number[] }[];
		asks: { price: number; amount: number[] }[];
	} {
		return {
			bids: Array.from(this.orderBookFull.bids.entries())
				.sort((a, b) => b[0] - a[0])
				.slice(0, depth)
				.map(([price, amount]) => ({ price, amount })),
			asks: Array.from(this.orderBookFull.asks.entries())
				.sort((a, b) => a[0] - b[0])
				.slice(0, depth)
				.map(([price, amount]) => ({ price, amount })),
		};
	}

	getSummary(depth = 10): {
		bids: { price: number; amount: number }[];
		asks: { price: number; amount: number }[];
	} {
		const { asks, bids } = this.getFull(depth);
		return {
			asks: asks.map(({ price, amount }) => ({
				price,
				amount: amount.reduce((prev, curr) => prev + curr, 0),
			})),
			bids: bids.map(({ price, amount }) => ({
				price,
				amount: amount.reduce((prev, curr) => prev + curr, 0),
			})),
		};
	}
}