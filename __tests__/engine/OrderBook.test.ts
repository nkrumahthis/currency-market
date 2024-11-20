import { Order } from "@/types";
import OrderBook from "@/backend/engine/OrderBook";
import PriorityQueue from "@/backend/engine/PriorityQueue";

describe("OrderBook", () => {
	let orderBook: OrderBook;
	let mockSellOrders: jest.Mocked<PriorityQueue<Order>>;
	let mockBuyOrders: jest.Mocked<PriorityQueue<Order>>;

	// Sample orders
	const sampleOrders: Order[] = [
		{
			id: "1",
			price: 100,
			amount: 10,
			side: "buy",
			timestamp: Date.now(),
			userId: "u1",
			currency: "USD",
		},
		{
			id: "2",
			price: 101,
			amount: 15,
			side: "buy",
			timestamp: Date.now(),
			userId: "u2",
			currency: "USD",
		},
		{
			id: "3",
			price: 102,
			amount: 5,
			side: "sell",
			timestamp: Date.now(),
			userId: "u3",
			currency: "XOF",
		},
		{
			id: "4",
			price: 102,
			amount: 8,
			side: "sell",
			timestamp: Date.now(),
			userId: "u4",
			currency: "XOF",
		},
		{
			id: "5",
			price: 103,
			amount: 12,
			side: "sell",
			timestamp: Date.now(),
			userId: "u5",
			currency: "XOF",
		},
	];

	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks();

		// Create mock implementations
		mockSellOrders = {
			values: jest
				.fn()
				.mockReturnValue(sampleOrders.filter((order) => order.side === "sell")),
		} as unknown as jest.Mocked<PriorityQueue<Order>>;

		mockBuyOrders = {
			values: jest
				.fn()
				.mockReturnValue(sampleOrders.filter((order) => order.side === "buy")),
		} as unknown as jest.Mocked<PriorityQueue<Order>>;

		// Initialize OrderBook with mock queues
		orderBook = new OrderBook(mockSellOrders, mockBuyOrders);
	});

	describe("updateAll", () => {
		it("should update both asks and bids correctly", () => {
			orderBook.updateAll();

			const summary = orderBook.getSummary();

			// Check bids (buy orders)
			expect(summary.bids).toHaveLength(2);
			expect(summary.bids).toContainEqual({ price: 100, amount: 10 });
			expect(summary.bids).toContainEqual({ price: 101, amount: 15 });

			// Check asks (sell orders)
			expect(summary.asks).toHaveLength(2);
			expect(summary.asks).toContainEqual({ price: 102, amount: 13 }); // Combined amount
			expect(summary.asks).toContainEqual({ price: 103, amount: 12 });
		});

		it("should update order book full view correctly", () => {
			orderBook.updateAll();

			const full = orderBook.getFull();

			// Check bids structure
			expect(full.bids).toHaveLength(2);
			expect(full.bids[0]).toHaveProperty("amount");
			expect(Array.isArray(full.bids[0].amount)).toBe(true);

			// Check asks structure
			expect(full.asks).toHaveLength(2);
			expect(full.asks[0]).toHaveProperty("amount");
			expect(Array.isArray(full.asks[0].amount)).toBe(true);
		});
	});

	describe("updateWithOrder", () => {
		it("should correctly update bids when adding a buy order", () => {
			const buyOrder: Order = {
				id: "6",
				price: 100,
				amount: 5,
				side: "buy",
				timestamp: Date.now(),
				userId: "u1",
				currency: "XOF",
			};

			orderBook.updateWithOrder(buyOrder);
			const summary = orderBook.getSummary();

			expect(summary.bids.find((bid) => bid.price === 100)).toEqual({
				price: 100,
				amount: 5,
			});
		});

		it("should correctly update asks when adding a sell order", () => {
			const sellOrder: Order = {
				id: "7",
				price: 104,
				amount: 7,
				side: "sell",
				timestamp: Date.now(),
				userId: "u1",
				currency: "XOF",
			};

			orderBook.updateWithOrder(sellOrder);
			const summary = orderBook.getSummary();

			expect(summary.asks.find((ask) => ask.price === 104)).toEqual({
				price: 104,
				amount: 7,
			});
		});

		it("should aggregate amounts for same price levels", () => {
			// Add multiple orders at the same price
			const orders: Order[] = [
				{
					id: "8",
					price: 105,
					amount: 5,
					side: "sell",
					timestamp: Date.now(),
					userId: "a1",
					currency: "XOF",
				},
				{
					id: "9",
					price: 105,
					amount: 3,
					side: "sell",
					timestamp: Date.now(),
					userId: "b2",
					currency: "XOF",
				},
				{
					id: "10",
					price: 105,
					amount: 2,
					side: "sell",
					timestamp: Date.now(),
					userId: "c3",
					currency: "XOF",
				},
			];

			orders.forEach((order) => orderBook.updateWithOrder(order));
			const summary = orderBook.getSummary();

			expect(summary.asks.find((ask) => ask.price === 105)).toEqual({
				price: 105,
				amount: 10,
			});
		});
	});

	describe("getFull", () => {
		beforeEach(() => {
			orderBook.updateAll();
		});

		it("should return correct number of levels based on depth parameter", () => {
			const depth = 1;
			const full = orderBook.getFull(depth);

			expect(full.bids).toHaveLength(1);
			expect(full.asks).toHaveLength(1);
		});

		it("should sort bids in descending order", () => {
			const full = orderBook.getFull();

			expect(full.bids[0].price).toBeGreaterThan(full.bids[1].price);
		});

		it("should sort asks in ascending order", () => {
			const full = orderBook.getFull();

			expect(full.asks[0].price).toBeLessThan(full.asks[1].price);
		});

		it("should maintain individual order amounts", () => {
			const full = orderBook.getFull();
			const priceLevel102 = full.asks.find((ask) => ask.price === 102);

			expect(priceLevel102?.amount).toEqual([5, 8]);
		});
	});

	describe("getSummary", () => {
		beforeEach(() => {
			orderBook.updateAll();
		});

		it("should return aggregated amounts for each price level", () => {
			const summary = orderBook.getSummary();

			expect(summary.asks.find((ask) => ask.price === 102)).toEqual({
				price: 102,
				amount: 13,
			});
		});

		it("should respect the depth parameter", () => {
			const depth = 1;
			const summary = orderBook.getSummary(depth);

			expect(summary.bids).toHaveLength(1);
			expect(summary.asks).toHaveLength(1);
		});

		it("should handle empty order book", () => {
			// Create new OrderBook with empty queues
			const emptyBuyOrders = {
				values: jest.fn().mockReturnValue([]),
			} as unknown as jest.Mocked<PriorityQueue<Order>>;

			const emptySellOrders = {
				values: jest.fn().mockReturnValue([]),
			} as unknown as jest.Mocked<PriorityQueue<Order>>;

			const emptyOrderBook = new OrderBook(emptySellOrders, emptyBuyOrders);
			emptyOrderBook.updateAll();

			const summary = emptyOrderBook.getSummary();

			expect(summary.bids).toHaveLength(0);
			expect(summary.asks).toHaveLength(0);
		});
	});

	describe("edge cases", () => {
		it("should handle large numbers of orders at same price level", () => {
			const largeNumberOfOrders = Array.from(
				{ length: 1000 },
				(_, i) =>
					({
						id: `large-${i}`,
						price: 100,
						amount: 1,
						side: "buy",
						timestamp: Date.now(),
						userId: `user-${i}`,
						currency: "USD",
					} as Order)
			);

			largeNumberOfOrders.forEach((order) => orderBook.updateWithOrder(order));
			const summary = orderBook.getSummary();

			expect(summary.bids.find((bid) => bid.price === 100)?.amount).toBe(1000);
		});

		it("should handle orders with zero amount", () => {
			const zeroAmountOrder: Order = {
				id: "zero",
				price: 100,
				amount: 0,
				side: "buy",
				timestamp: Date.now(),
				currency: "USD",
				userId: "user",
			};

			orderBook.updateWithOrder(zeroAmountOrder);
			const summary = orderBook.getSummary();

			expect(summary.bids.find((bid) => bid.price === 100)?.amount).toBe(0);
		});

		it("should handle floating point prices and amounts", () => {
			const floatingPointOrder: Order = {
				id: "float",
				price: 100.123,
				amount: 10.456,
				side: "buy",
				timestamp: Date.now(),
				currency: "USD",
				userId: "user",
			};

			orderBook.updateWithOrder(floatingPointOrder);
			const summary = orderBook.getSummary();

			expect(summary.bids.find((bid) => bid.price === 100.123)?.amount).toBe(
				10.456
			);
		});
	});
});
