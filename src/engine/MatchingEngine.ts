import PriorityQueue from "./PriorityQueue";

type Order = {
	id: string;
	side: "buy" | "sell";
	price: number;
	amount: number;
	timestamp: number;
};

type Trade = {
	buyOrderId: string;
	sellOrderId: string;
	price: number;
	amount: number;
	timestamp: number;
};

export default class MatchingEngine {
	private buyOrders: PriorityQueue<Order>;
	private sellOrders: PriorityQueue<Order>;
	private trades: Array<Trade>;

	constructor() {
		this.buyOrders = new PriorityQueue(
			(a: Order, b: Order) => b.price - a.price
		); // Higher price has priority
		this.sellOrders = new PriorityQueue(
			(a: Order, b: Order) => a.price - b.price
		); // Lower price has priority
		this.trades = [];
	}

	generateOrderId() {
		// Generate a unique order ID using a timestamp and random number
		return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
	}

	submitOrder(order: Order) {
		order.timestamp = Date.now();
		order.id = this.generateOrderId();

		if (order.side === "buy") {
			this.matchBuyOrder(order);
		}
	}

	matchBuyOrder(buyOrder: Order) {
		while (!this.sellOrders.isEmpty() && buyOrder.amount > 0) {
			const bestSell = this.sellOrders.peek();

			// if the buy price is less than sell price, no match possible
			if (buyOrder.price < bestSell.price) {
				break;
			}

			const matchedSell = this.sellOrders.poll();

			// if there are no sell orders, no match possible
			if (!matchedSell) {
				break;
			}
			const matchAmount = Math.min(buyOrder.amount, matchedSell.amount);

			// Create trade at sell order price (price/time priority)
			const trade = {
				buyOrderId: buyOrder.id,
				sellOrderId: matchedSell.id,
				price: matchedSell.price,
				amount: matchAmount,
				timestamp: Date.now(),
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

}
