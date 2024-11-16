import { Order, Trade } from "@/types";
import PriorityQueue from "./PriorityQueue";
import OrderBook from "./OrderBook";

export default class MatchingEngine {
	private buyOrders: PriorityQueue<Order>;
	private sellOrders: PriorityQueue<Order>;
	private trades: Array<Trade>;
	private orderBook: OrderBook;

	constructor() {
		this.buyOrders = new PriorityQueue(
			(a: Order, b: Order) => b.price - a.price
		); // Higher price has priority

		this.sellOrders = new PriorityQueue(
			(a: Order, b: Order) => a.price - b.price
		); // Lower price has priority

		this.trades = [];
		this.orderBook = new OrderBook(this.sellOrders, this.buyOrders);
	}

	generateOrderId() {
		// Generate a unique order ID using a timestamp and random number
		return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
	}

	submitOrder(order: Order): Order {
		order.timestamp = Date.now();
		order.id = this.generateOrderId();

		if (order.side === "buy") {
			this.matchBuyOrder(order);
		} else if (order.side === "sell") {
			this.matchSellOrder(order);
		}
        this.orderBook.updateWithOrder(order)

		return order;
	}

	matchBuyOrder(buyOrder: Order) {
		while (!this.sellOrders.isEmpty() && buyOrder.amount > 0) {
			const bestSell = this.sellOrders.peek();

			// if the buy price is less than sell price, no match possible
			if (buyOrder.price < bestSell.price) {
				break;
			}

			const matchedSell = this.sellOrders.poll()!;
			const matchAmount = Math.min(buyOrder.amount, matchedSell.amount);

			// Create trade at sell order price (price/time priority)
			const trade: Trade = {
				buyOrderId: buyOrder.id,
				buyerId: buyOrder.userId,
				sellerId: matchedSell.userId,
				sellOrderId: matchedSell.id,
				price: matchedSell.price,
				amount: matchAmount,
				timestamp: Date.now(),
				sellCurrency: matchedSell.currency,
				buyCurrency: buyOrder.currency,
			};

			this.trades.push(trade);

			// Update order amounts
			buyOrder.amount -= matchAmount;
			matchedSell.amount -= matchAmount;

			// if sell order still has amount remaining, add it back to the queue
			if (matchedSell.amount > 0) {
				this.sellOrders.add(matchedSell);
			}
		}

		// if buy order still has amount remaining, add it back to the queue
		if (buyOrder.amount > 0) {
			this.buyOrders.add(buyOrder);
		}
	}

	matchSellOrder(sellOrder: Order) {
		while (!this.buyOrders.isEmpty() && sellOrder.amount > 0) {
			const bestBuy = this.buyOrders.peek();

			// if the sell price is higher than buy price, no match possible
			if (sellOrder.price > bestBuy.price) {
				break;
			}

			const matchedBuy = this.buyOrders.poll()!;
			const matchAmount = Math.min(sellOrder.amount, matchedBuy.amount);

			// Create trade at buy order price (price/time priority)
			const trade: Trade = {
				buyOrderId: matchedBuy.id,
				sellOrderId: sellOrder.id,
				price: matchedBuy.price,
				amount: matchAmount,
				timestamp: Date.now(),
				sellCurrency: sellOrder.currency,
				buyCurrency: matchedBuy.currency,
				buyerId: matchedBuy.userId,
				sellerId: sellOrder.userId,
			};

			this.trades.push(trade);

			//update order amounts
			sellOrder.amount -= matchAmount;
			matchedBuy.amount -= matchAmount;

			// if buy order still has amount remaining, add it back to queue
			if (matchedBuy.amount > 0) {
				this.buyOrders.add(matchedBuy);
			}
		}

		// if sell order still has amount remaining, add to queue
		if (sellOrder.amount > 0) {
			this.sellOrders.add(sellOrder);
		}
	}

	getMarketPrice() {
		if (this.buyOrders.isEmpty() || this.sellOrders.isEmpty()) {
			return null;
		}

		const bestBid = this.buyOrders.peek().price;
		const bestAsk = this.sellOrders.peek().price;

		return (bestBid + bestAsk) / 2;
	}

	getRecentTrades(limit = 50) {
		return this.trades.slice(-limit);
	}

    getOrderBook(depth=10) {
        return this.orderBook.getSummary(depth);
    }
}
