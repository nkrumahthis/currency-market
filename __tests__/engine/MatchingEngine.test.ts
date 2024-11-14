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
});
