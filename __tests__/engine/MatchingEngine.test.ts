import MatchingEngine from "@/engine/MatchingEngine";
import { Order } from "@/types";

describe("MatchingEngine", () => {
	let engine: MatchingEngine;

	beforeEach(() => {
		engine = new MatchingEngine();
	});

	test("should add buy order to the buy queue", () => {
		const order: Order = {
			id: "123",
			side: "buy",
			price: 100,
			amount: 10,
			timestamp: 1632000000000,
		};

		engine.submitOrder(order);

		expect(engine["buyOrders"].isEmpty()).toBe(false);
		expect(engine["buyOrders"].peek()).toEqual(order);
		expect(engine["sellOrders"].isEmpty()).toBe(true);
		expect(engine["sellOrders"].peek()).toEqual(undefined);
	});

	test("should add sell order to the sell queue", () => {
		const order: Order = {
			id: "456",
			side: "sell",
			price: 200,
			amount: 5,
			timestamp: 1632000000000,
		};

		engine.submitOrder(order);

		expect(engine["sellOrders"].isEmpty()).toBe(false);
		expect(engine["sellOrders"].peek()).toEqual(order);
		expect(engine["buyOrders"].isEmpty()).toBe(true);
		expect(engine["buyOrders"].peek()).toEqual(undefined);
	});

	test("should correctly match a buy order with an existing sell order if sell price is good", () => {
		// the buy order should be fulfilled because the selling price is less than the buying price,
		// so it is a good price for the buyer.

		const buyOrder: Order = {
			id: "789",
			side: "buy",
			price: 100,
			amount: 10,
			timestamp: 1632000000000,
		};

		const sellOrder: Order = {
			id: "101",
			side: "sell",
			price: 95,
			amount: 10,
			timestamp: 1632000000000,
		};

		// submit sell order first and then set a buy order to match
		engine.submitOrder(sellOrder);
		engine.submitOrder(buyOrder);

		expect(engine["trades"].length).toBe(1);
		const trade = engine["trades"][0];
		expect(trade).toMatchObject({
			buyOrderId: expect.any(String),
			sellOrderId: expect.any(String),
			price: 95, // sold at the price the seller asked for.
			amount: 10,
			timestamp: expect.any(Number),
		});

		expect(engine["buyOrders"].isEmpty()).toBe(true);
		expect(engine["sellOrders"].isEmpty()).toBe(true);
	});

	test("should not match a buy order with an existing sell order if sell price is bad", () => {
		const buyOrder: Order = {
			id: "789",
			side: "buy",
			price: 100,
			amount: 10,
			timestamp: 1632000000000,
		};

		const sellOrder: Order = {
			id: "101",
			side: "sell",
			price: 200,
			amount: 10,
			timestamp: 1632000000000,
		};

		// submit sell order first and then set a buy order to match
		engine.submitOrder(buyOrder);
		engine.submitOrder(sellOrder);

		expect(engine["trades"].length).toBe(0);
		expect(engine["buyOrders"].isEmpty()).toBe(false);
		expect(engine["buyOrders"].isEmpty()).toBe(false);
	});

	test("should partially fulfill a buy order if sell order amount is less", () => {
		const buyOrder: Order = {
			id: "789",
			side: "buy",
			price: 100,
			amount: 30,
			timestamp: 1632000000000,
		};

		const sellOrder: Order = {
			id: "101",
			side: "sell",
			price: 90,
			amount: 10,
			timestamp: 1632000000000,
		};

        engine.submitOrder(sellOrder);
		engine.submitOrder(buyOrder);

		expect(engine["trades"].length).toBe(1);
		const trade = engine["trades"][0];
		expect(trade).toMatchObject({
			buyOrderId: expect.any(String),
			sellOrderId: expect.any(String),
			price: 90, // sold at the price the seller asked for.
			amount: 10, // sold amount available
			timestamp: expect.any(Number),
		});

		expect(engine["buyOrders"].isEmpty()).toBe(false);
        expect(engine["buyOrders"].peek().amount).toBe(20); // still 20 left

		expect(engine["sellOrders"].isEmpty()).toBe(true);
	});

    test("should update the order book after submitting orders", () => {
        const buyOrder: Order = {
            id: "789",
            side: "buy",
            price: 100,
            amount: 50,
            timestamp: 1632000000000,
        };

        const sellOrder: Order = {
            id: "101",
            side: "sell",
            price: 105,
            amount: 30,
            timestamp: 1632000000000,
        };

        engine.submitOrder(sellOrder);
        engine.submitOrder(buyOrder);

        const orderBook = engine.getOrderBook();

        expect(orderBook.asks).toEqual([{ price: 105, amount: 30 }]);
        expect(orderBook.bids).toEqual([{ price: 100, amount: 50 }]);
    })

    test("should calculate the market price correctly", () => {
        const buyOrder: Order = {
            id: "789",
            side: "buy",
            price: 100,
            amount: 50,
            timestamp: 1632000000000,
        };

        const sellOrder: Order = {
            id: "102",
            side: "sell",
            price: 200,
            amount: 20,
            timestamp: 1632000000000,
        };

        engine.submitOrder(sellOrder);
        engine.submitOrder(buyOrder);

        expect(engine.getMarketPrice()).toBe(150) // average sell and order prices
    })

    test("should be null if no buy order or sell order exists", () => {
        expect(engine.getMarketPrice()).toBeNull() // no buy or sell orders
    })

    test("should be null if buy order exists, but not sell order", () => {
        const buyOrder: Order = {
            id: "789",
            side: "buy",
            price: 100,
            amount: 50,
            timestamp: 1632000000000,
        };

        engine.submitOrder(buyOrder);

        expect(engine.getMarketPrice()).toBeNull() // no sell order
    })

    test("should return the correct order book snapshot with specified depth", () => {
        const buyOrders: Order[] = [
			{ id: "", side: "buy", price: 102, amount: 1, timestamp: 0 },
			{ id: "", side: "buy", price: 100, amount: 5, timestamp: 0 },
			{ id: "", side: "buy", price: 99, amount: 2, timestamp: 0 },
		];
		const sellOrders: Order[] = [
			{ id: "", side: "sell", price: 103, amount: 4, timestamp: 0 },
			{ id: "", side: "sell", price: 104, amount: 3, timestamp: 0 },
			{ id: "", side: "sell", price: 105, amount: 1, timestamp: 0 },
		];

        buyOrders.forEach(order => engine.submitOrder(order));
        sellOrders.forEach(order => engine.submitOrder(order));

        const orderBook = engine.getOrderBook(2);

        expect(orderBook.bids).toEqual([
            { price: 102, amount: 1 },
            { price: 100, amount: 5 },
        ])
        expect(orderBook.asks).toEqual([
            { price: 103, amount: 4 },
            { price: 104, amount: 3 },
        ])
    })

    test("should return recent trades up to the specified limit", () => {
		const buyOrders: Order[] = [
            { id: "", side: "buy", price: 101, amount: 5, timestamp: 0 }
        ];
		const sellOrders: Order[] = [
			{ id: "", side: "sell", price: 100, amount: 2, timestamp: 0 },
			{ id: "", side: "sell", price: 100, amount: 3, timestamp: 0 },
		];

		buyOrders.forEach(order => engine.submitOrder(order));
		sellOrders.forEach(order => engine.submitOrder(order));

		const recentTrades = engine.getRecentTrades(2);

		expect(recentTrades.length).toBe(2);
		expect(recentTrades[0]).toMatchObject({
			buyOrderId: expect.any(String),
			sellOrderId: expect.any(String),
			price: 101,
			amount: 2,
			timestamp: expect.any(Number),
		});
		expect(recentTrades[1]).toMatchObject({
			buyOrderId: expect.any(String),
			sellOrderId: expect.any(String),
			price: 101,
			amount: 3,
			timestamp: expect.any(Number),
		});
	});

    test("should return an empty list if there are no recent trades", () => {
		const recentTrades = engine.getRecentTrades();
		expect(recentTrades).toEqual([]);
	});
});
