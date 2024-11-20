import { Order, OrderBookFull, OrderBookSummary } from "@/types";
import PriorityQueue from "./PriorityQueue";

export default class OrderBook {
	private sellOrders;
	private buyOrders;

	constructor(
		sellOrders: PriorityQueue<Order>,
		buyOrders: PriorityQueue<Order>
	) {
		this.sellOrders = sellOrders;
		this.buyOrders = buyOrders;
	}

	getSummary(depth = 10): OrderBookSummary {
		const asks = this.getTopOrders(this.sellOrders, depth);
		const bids = this.getTopOrders(this.buyOrders, depth);
		return { asks, bids };
	}

	getFullOrderBook(): OrderBookFull {
		const asks = this.getGroupedOrders(this.sellOrders);
		const bids = this.getGroupedOrders(this.buyOrders);
		return { asks, bids };
	}

	private getTopOrders(
		priorityQueue: PriorityQueue<Order>,
		depth: number | null,
		detailed: boolean = false
	): { price: number; amount: number; quoteCurrency: string }[] {
		console.log("priority queue values", priorityQueue.values());
		const orders = priorityQueue.values();
		const slicedOrders = !depth ? orders : orders.slice(0, depth);

		if (detailed) {
			return slicedOrders;
		} else {
			return slicedOrders.map(({ price, amount, quoteCurrency }) => ({
				price,
				amount,
				quoteCurrency,
			}));
		}
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
				groupedOrders[order.price] = { amounts: [], quoteCurrency: order.quoteCurrency };
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
}
