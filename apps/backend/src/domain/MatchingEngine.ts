import PriorityQueue from "./PriorityQueue";
import { Order, OrderSide, Trade } from "@prisma/client";

export interface TradeMatch {
    buyOrder: Order;
    sellOrder: Order;
    matchAmount: number;
    rate: number;
}

export interface IMatchingEngine {
    onTradeMatch(handler: TradeMatchHandler): Promise<void>;
    submitOrder(order: Order): Promise<void>;
	removeOrder(order: Order): void;
	getRecentTrades(limit: number): Trade[];
	initialize(orders: Order[]): Promise<void>;
}

export type TradeMatchHandler = (match: TradeMatch) => Promise<void>;

export default class MatchingEngine implements IMatchingEngine {
    private static instance: IMatchingEngine;
    
    // Buy orders sorted by highest rate first, then oldest first
    private buyOrders: PriorityQueue<Order>;
    
    // Sell orders sorted by lowest rate first, then oldest first
    private sellOrders: PriorityQueue<Order>;
    
    private trades: Array<Trade>;
    private tradeMatchHandlers: TradeMatchHandler[] = [];

	private initialized: boolean = false;

    private constructor() {
        // For buy orders: higher rate gets priority, then earlier time
        this.buyOrders = new PriorityQueue<Order>(
            (a, b) => b.rate - a.rate || a.createdAt.getTime() - b.createdAt.getTime()
        );

        // For sell orders: lower rate gets priority, then earlier time
        this.sellOrders = new PriorityQueue<Order>(
            (a, b) => a.rate - b.rate || a.createdAt.getTime() - b.createdAt.getTime()
        );

        this.trades = [];
    }
	getInstance(): IMatchingEngine {
		throw new Error("Method not implemented.");
	}

    public static getInstance(): IMatchingEngine {
        if (!MatchingEngine.instance) {
            MatchingEngine.instance = new MatchingEngine();
        }
        return MatchingEngine.instance;
    }

    async onTradeMatch(handler: TradeMatchHandler): Promise<void> {
        this.tradeMatchHandlers.push(handler);
    }

    private async notifyTradeMatch(match: TradeMatch): Promise<void> {
        await Promise.all(
            this.tradeMatchHandlers.map(handler => handler(match))
        );
    }

    removeOrder(order: Order): void {
        const queue = order.side === OrderSide.BUY ? this.buyOrders : this.sellOrders;
        queue.remove(order.id);
    }

    // The core matching algorithm
    private async matchOrder(incomingOrder: Order): Promise<void> {
        // Determine which queue to match against
        const matchingQueue = incomingOrder.side === OrderSide.BUY 
            ? this.sellOrders 
            : this.buyOrders;

        // Where to store the order if it's not fully matched
        const targetQueue = incomingOrder.side === OrderSide.BUY 
            ? this.buyOrders 
            : this.sellOrders;

        // Create a new order object to track remaining amount
        let remainingOrder = { ...incomingOrder };

        while (!matchingQueue.isEmpty() && remainingOrder.amount > 0) {
            const bestMatch = matchingQueue.peek();
            
            if (!bestMatch) break;

            // Check if rates are compatible
            const isMatchPossible = incomingOrder.side === OrderSide.BUY
                ? remainingOrder.rate >= bestMatch.rate  // Buy rate must be >= sell rate
                : remainingOrder.rate <= bestMatch.rate; // Sell rate must be <= buy rate

            if (!isMatchPossible) break;

            // Remove the matching order from queue
            const matchedOrder = matchingQueue.poll()!;

            // Calculate match amount
            const matchAmount = Math.min(remainingOrder.amount, matchedOrder.amount);

            // Create trade match
            const tradeMatch: TradeMatch = {
                buyOrder: incomingOrder.side === OrderSide.BUY ? remainingOrder : matchedOrder,
                sellOrder: incomingOrder.side === OrderSide.BUY ? matchedOrder : remainingOrder,
                matchAmount,
                rate: matchedOrder.rate // Always use the sell order's rate
            };

            // Notify handlers of the match
            await this.notifyTradeMatch(tradeMatch);

            // Update remaining amounts
            remainingOrder = {
                ...remainingOrder,
                amount: remainingOrder.amount - matchAmount
            };

            // If matched order wasn't fully filled, put remainder back in queue
            const remainingMatchedAmount = matchedOrder.amount - matchAmount;
            if (remainingMatchedAmount > 0) {
                matchingQueue.add({
                    ...matchedOrder,
                    amount: remainingMatchedAmount
                });
            }
        }

        // If there's any amount left, add to appropriate queue
        if (remainingOrder.amount > 0) {
            targetQueue.add(remainingOrder);
        }
    }

    async submitOrder(order: Order): Promise<void> {
        await this.matchOrder(order);
    }

    // Initialize with existing orders
    async initialize(orders: Order[]): Promise<void> {
		if(this.initialized) return;

        orders.forEach(order => {
            const queue = order.side === OrderSide.BUY ? this.buyOrders : this.sellOrders;
            queue.add({ ...order });
        });

		this.initialized = true;
    }

    getRecentTrades(limit = 50): Trade[] {
        return this.trades.slice(-limit);
    }
}