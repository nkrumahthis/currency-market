import MatchingEngine from "@/backend/engine/MatchingEngine";
import { NewOrderRequest, Order } from "@/types";

describe("MatchingEngine", () => {
  let engine: MatchingEngine;

  beforeEach(() => {
    engine = new MatchingEngine();
  });

  test("should create and validate orders correctly", () => {
    const newOrderRequest: NewOrderRequest = {
      side: "buy",
      price: 100,
      amount: 1,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    };

    const order = engine.createOrder(newOrderRequest);

    expect(order).toMatchObject({
      ...newOrderRequest,
      timestamp: expect.any(Number),
      id: expect.any(String),
    });
  });

  test("should throw error for invalid order", () => {
    const invalidOrder: NewOrderRequest = {
      side: "sell",
      price: -1,
      amount: 0,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    };

    expect(() => engine.createOrder(invalidOrder)).toThrow(
      "Invalid order: Amount and price must be greater than zero."
    );
  });

  test("should match a buy order with a sell order", () => {
    const sellOrder: Order = engine.createOrder({
      side: "sell",
      price: 100,
      amount: 1,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    });

    const buyOrder: Order = engine.createOrder({
      side: "buy",
      price: 110,
      amount: 1,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    });

    engine.submitOrder(sellOrder);
    engine.submitOrder(buyOrder);

    const recentTrades = engine.getRecentTrades();
    expect(recentTrades).toHaveLength(1);

    const trade = recentTrades[0];
    expect(trade).toMatchObject({
      buyerId: buyOrder.userId,
      buyOrderId: buyOrder.id,
      sellerId: sellOrder.userId,
      sellOrderId: sellOrder.id,
      price: 100,
      amount: 1,
    });
  });

  test("should add unmatched buy order to buy queue", () => {
    const buyOrder: Order = engine.createOrder({
      side: "buy",
      price: 100,
      amount: 1,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    });

    engine.submitOrder(buyOrder);

    const orderBook = engine.getOrderBook(10, false);
    expect(orderBook.bids).toHaveLength(1);
    expect(orderBook.bids[0].price).toBe(100);
    expect(orderBook.bids[0].amount).toBe(1);
  });

  test("should add unmatched sell order to sell queue", () => {
    const sellOrder: Order = engine.createOrder({
      side: "sell",
      price: 100,
      amount: 1,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    });

    engine.submitOrder(sellOrder);

    const orderBook = engine.getOrderBook(10, false);
    expect(orderBook.asks).toHaveLength(1);
    expect(orderBook.asks[0].price).toBe(100);
    expect(orderBook.asks[0].amount).toBe(1);
  });

  test("should calculate market price correctly", () => {
    const buyOrder: Order = engine.createOrder({
      side: "buy",
      price: 100,
      amount: 1,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    });

    const sellOrder: Order = engine.createOrder({
      side: "sell",
      price: 105,
      amount: 1,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    });

    engine.submitOrder(buyOrder);
    engine.submitOrder(sellOrder);

    const marketPrice = engine.getMarketPrice();
    expect(marketPrice).toBe(102.5);
  });

  test("should return recent trades limited by the provided value", () => {
    for (let i = 0; i < 100; i++) {
      const buyOrder: Order = engine.createOrder({
        side: "buy",
        price: 105 + i,
        amount: 1,
        baseCurrency: "BTC",
        quoteCurrency: "USD",
      });

      const sellOrder: Order = engine.createOrder({
        side: "sell",
        price: 100 + i,
        amount: 1,
        baseCurrency: "BTC",
        quoteCurrency: "USD",
      });

      engine.submitOrder(buyOrder);
      engine.submitOrder(sellOrder);
    }

    const recentTrades = engine.getRecentTrades(10);
    expect(recentTrades).toHaveLength(10);
  });

  test("should group orders correctly in the order book", () => {
    const buyOrder1: Order = engine.createOrder({
      side: "buy",
      price: 100,
      amount: 1,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    });

    const buyOrder2: Order = engine.createOrder({
      side: "buy",
      price: 100,
      amount: 2,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
    });

    engine.submitOrder(buyOrder1);
    engine.submitOrder(buyOrder2);

    const orderBook = engine.getOrderBook(10, false);

    expect(orderBook.bids).toHaveLength(1);
    expect(orderBook.bids[0]).toMatchObject({
      price: 100,
      amount: 3,
      quoteCurrency: "USD",
    });
  });
});
