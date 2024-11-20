"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var MatchingEngine_1 = __importDefault(require("@/engine/MatchingEngine"));
describe("MatchingEngine", function () {
    var engine;
    beforeEach(function () {
        engine = new MatchingEngine_1.default();
    });
    test("should create and validate orders correctly", function () {
        var newOrderRequest = {
            side: "buy",
            price: 100,
            amount: 1,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        };
        var order = engine.createOrder(newOrderRequest);
        expect(order).toMatchObject(__assign(__assign({}, newOrderRequest), { timestamp: expect.any(Number), id: expect.any(String) }));
    });
    test("should throw error for invalid order", function () {
        var invalidOrder = {
            side: "sell",
            price: -1,
            amount: 0,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        };
        expect(function () { return engine.createOrder(invalidOrder); }).toThrow("Invalid order: Amount and price must be greater than zero.");
    });
    test("should match a buy order with a sell order", function () {
        var sellOrder = engine.createOrder({
            side: "sell",
            price: 100,
            amount: 1,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        });
        var buyOrder = engine.createOrder({
            side: "buy",
            price: 110,
            amount: 1,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        });
        engine.submitOrder(sellOrder);
        engine.submitOrder(buyOrder);
        var recentTrades = engine.getRecentTrades();
        expect(recentTrades).toHaveLength(1);
        var trade = recentTrades[0];
        expect(trade).toMatchObject({
            buyerId: buyOrder.userId,
            buyOrderId: buyOrder.id,
            sellerId: sellOrder.userId,
            sellOrderId: sellOrder.id,
            price: 100,
            amount: 1,
        });
    });
    test("should add unmatched buy order to buy queue", function () {
        var buyOrder = engine.createOrder({
            side: "buy",
            price: 100,
            amount: 1,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        });
        engine.submitOrder(buyOrder);
        var orderBook = engine.getOrderBook(10, false);
        expect(orderBook.bids).toHaveLength(1);
        expect(orderBook.bids[0].price).toBe(100);
        expect(orderBook.bids[0].amount).toBe(1);
    });
    test("should add unmatched sell order to sell queue", function () {
        var sellOrder = engine.createOrder({
            side: "sell",
            price: 100,
            amount: 1,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        });
        engine.submitOrder(sellOrder);
        var orderBook = engine.getOrderBook(10, false);
        expect(orderBook.asks).toHaveLength(1);
        expect(orderBook.asks[0].price).toBe(100);
        expect(orderBook.asks[0].amount).toBe(1);
    });
    test("should calculate market price correctly", function () {
        var buyOrder = engine.createOrder({
            side: "buy",
            price: 100,
            amount: 1,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        });
        var sellOrder = engine.createOrder({
            side: "sell",
            price: 105,
            amount: 1,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        });
        engine.submitOrder(buyOrder);
        engine.submitOrder(sellOrder);
        var marketPrice = engine.getMarketPrice();
        expect(marketPrice).toBe(102.5);
    });
    test("should return recent trades limited by the provided value", function () {
        for (var i = 0; i < 100; i++) {
            var buyOrder = engine.createOrder({
                side: "buy",
                price: 105 + i,
                amount: 1,
                baseCurrency: "BTC",
                quoteCurrency: "USD",
            });
            var sellOrder = engine.createOrder({
                side: "sell",
                price: 100 + i,
                amount: 1,
                baseCurrency: "BTC",
                quoteCurrency: "USD",
            });
            engine.submitOrder(buyOrder);
            engine.submitOrder(sellOrder);
        }
        var recentTrades = engine.getRecentTrades(10);
        expect(recentTrades).toHaveLength(10);
    });
    test("should group orders correctly in the order book", function () {
        var buyOrder1 = engine.createOrder({
            side: "buy",
            price: 100,
            amount: 1,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        });
        var buyOrder2 = engine.createOrder({
            side: "buy",
            price: 100,
            amount: 2,
            baseCurrency: "BTC",
            quoteCurrency: "USD",
        });
        engine.submitOrder(buyOrder1);
        engine.submitOrder(buyOrder2);
        var orderBook = engine.getOrderBook(10, false);
        expect(orderBook.bids).toHaveLength(1);
        expect(orderBook.bids[0]).toMatchObject({
            price: 100,
            amount: 3,
            quoteCurrency: "USD",
        });
    });
});
