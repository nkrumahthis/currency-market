import MatchingEngine from "./MatchingEngine";
import {
	Order,
	OrderSide,
	OrderStatus,
	Trade,
	TradeStatus,
} from "@prisma/client";

describe("MatchingEngine", () => {
	let matchingEngine: MatchingEngine;

	beforeEach(() => {
		matchingEngine = MatchingEngine.getInstance() as MatchingEngine;
	});

	const createOrder = (
		side: OrderSide,
		rate: number,
		amount: number,
		createdAt: Date = new Date()
	): Order => ({
		id: Math.random().toString(),
		userId: "test-user",
		side,
		currencyPairId: "EUR-XOF",
		baseCurrency: "EUR",
		quoteCurrency: "XOF",
		rate,
		amount,
		status: OrderStatus.NEW,
		createdAt,
		updatedAt: new Date(),
	});

	describe("Basic Order Matching", () => {
		it("should match buy and sell orders with exact amounts", async () => {
			const tradeMatches: any[] = [];
			await matchingEngine.onTradeMatch(async (match) => {
				tradeMatches.push(match);
			});

			const sellOrder = createOrder(OrderSide.SELL, 100, 1.0);
			const buyOrder = createOrder(OrderSide.BUY, 100, 1.0);

			await matchingEngine.submitOrder(sellOrder);
			await matchingEngine.submitOrder(buyOrder);

			expect(tradeMatches).toHaveLength(1);
			expect(tradeMatches[0]).toEqual({
				buyOrder,
				sellOrder,
				matchAmount: 1.0,
				rate: 100,
			});
		});

		it("should not match orders when buy rate is less than sell rate", async () => {
			const sellOrder = createOrder(OrderSide.SELL, 100, 1.0);
			const buyOrder = createOrder(OrderSide.BUY, 99, 1.0);

			await matchingEngine.submitOrder(sellOrder);
			await matchingEngine.submitOrder(buyOrder);

			// Orders should remain in their respective queues
			expect(matchingEngine["buyOrders"].isEmpty()).toBeFalsy();
			expect(matchingEngine["sellOrders"].isEmpty()).toBeFalsy();
		});
	});

	describe("Partial Fills", () => {
    beforeEach(() => {
			// Reset the singleton instance before each test
			(MatchingEngine as any).instance = null;
			matchingEngine = MatchingEngine.getInstance() as MatchingEngine;
		});
		it("should handle partial fills correctly", async () => {
			const tradeMatches: any[] = [];
			await matchingEngine.onTradeMatch(async (match) => {
				tradeMatches.push(match);
			});

			const sellOrder = createOrder(OrderSide.SELL, 100, 2.0);
			const buyOrder = createOrder(OrderSide.BUY, 100, 1.0);

			await matchingEngine.submitOrder(sellOrder);
			await matchingEngine.submitOrder(buyOrder);

			expect(tradeMatches).toHaveLength(1);
			expect(tradeMatches[0].matchAmount).toBe(1.0);
			expect(matchingEngine["sellOrders"].peek()?.amount).toBe(1.0);
		});

		it("should handle multiple partial fills", async () => {
			const tradeMatches: any[] = [];
			await matchingEngine.onTradeMatch(async (match) => {
				tradeMatches.push(match);
			});

			const sellOrder = createOrder(OrderSide.SELL, 100, 3.0); // selling 300
			const buyOrder1 = createOrder(OrderSide.BUY, 100, 1.0); // buying 100 - should trigger a trade
			const buyOrder2 = createOrder(OrderSide.BUY, 100, 1.0); // buying 100 - should trigger a trade

			await matchingEngine.submitOrder(sellOrder);
			await matchingEngine.submitOrder(buyOrder1);
			await matchingEngine.submitOrder(buyOrder2);

			expect(tradeMatches).toHaveLength(2);
			expect(matchingEngine["sellOrders"].peek()?.amount).toBe(1.0);
		});
	});

	describe("Order Priority", () => {
		it("should match orders based on price-time priority", async () => {
			const tradeMatches: any[] = [];
			await matchingEngine.onTradeMatch(async (match) => {
				tradeMatches.push(match);
			});

			const now = new Date();
			const sellOrder1 = createOrder(
				OrderSide.SELL,
				100,
				1.0,
				new Date(now.getTime() - 1000)
			);
			const sellOrder2 = createOrder(
				OrderSide.SELL,
				100,
				1.0,
				new Date(now.getTime() - 2000)
			);
			const buyOrder = createOrder(OrderSide.BUY, 100, 1.0, now);

			await matchingEngine.submitOrder(sellOrder1);
			await matchingEngine.submitOrder(sellOrder2);
			await matchingEngine.submitOrder(buyOrder);

			expect(tradeMatches).toHaveLength(1);
			expect(tradeMatches[0].sellOrder.id).toBe(sellOrder2.id);
		});
	});

	describe("Order Management", () => {
		beforeEach(() => {
			// Reset the singleton instance before each test
			(MatchingEngine as any).instance = null;
			matchingEngine = MatchingEngine.getInstance() as MatchingEngine;
		});

		it("should remove orders correctly", async () => {
			const sellOrder = createOrder(OrderSide.SELL, 100, 1.0);
			await matchingEngine.submitOrder(sellOrder);
			matchingEngine.removeOrder(sellOrder);

			expect(matchingEngine["sellOrders"].isEmpty()).toBeTruthy();
		});

	});

	describe("Initialization", () => {
		beforeEach(() => {
			// Reset the singleton instance before each test
			(MatchingEngine as any).instance = null;
			matchingEngine = MatchingEngine.getInstance() as MatchingEngine;
		});
		it("should initialize with existing orders", async () => {
			const existingOrders = [
				createOrder(OrderSide.SELL, 100, 1.0),
				createOrder(OrderSide.BUY, 99, 1.0),
			];

			await matchingEngine.initialize(existingOrders);

			expect(matchingEngine["buyOrders"].isEmpty()).toBeFalsy();
			expect(matchingEngine["sellOrders"].isEmpty()).toBeFalsy();
		});

		it("should not initialize twice", async () => {
			const existingOrders = [createOrder(OrderSide.SELL, 100, 1.0)];
			await matchingEngine.initialize(existingOrders);
			await matchingEngine.initialize(existingOrders);

			// Should only have one order
			expect(matchingEngine["sellOrders"].values()).toHaveLength(1);
		});
	});
});
