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
var PriorityQueue_1 = __importDefault(require("./PriorityQueue"));
var MatchingEngine = /** @class */ (function () {
    function MatchingEngine() {
        this.buyOrders = new PriorityQueue_1.default(function (a, b) { return a.timestamp - b.timestamp; }); // Earlier order has priority
        this.sellOrders = new PriorityQueue_1.default(function (a, b) { return a.price - b.price; }); // Lower price has priority
        this.trades = [];
    }
    MatchingEngine.prototype.generateOrderId = function () {
        return "".concat(Date.now(), "-").concat(Math.floor(Math.random() * 1000000));
    };
    MatchingEngine.prototype.validateOrder = function (order) {
        var _a, _b;
        if (order.amount <= 0 || order.price <= 0) {
            throw new Error("Invalid order: Amount and price must be greater than zero.");
        }
        if (!((_a = order.baseCurrency) === null || _a === void 0 ? void 0 : _a.match(/^[A-Z]{3}$/)) || !((_b = order.quoteCurrency) === null || _b === void 0 ? void 0 : _b.match(/^[A-Z]{3}$/))) {
            throw new Error("Invalid order: Base or quote currency is not properly formatted.");
        }
    };
    MatchingEngine.prototype.createOrder = function (newOrderRequest) {
        var order = __assign(__assign({}, newOrderRequest), { timestamp: Date.now(), id: this.generateOrderId() });
        this.validateOrder(order);
        return order;
    };
    MatchingEngine.prototype.submitOrder = function (order) {
        this.validateOrder(order);
        if (order.side === "buy") {
            this.matchBuyOrder(order);
        }
        else if (order.side === "sell") {
            this.matchSellOrder(order);
        }
        return order;
    };
    MatchingEngine.prototype.matchBuyOrder = function (buyOrder) {
        while (!this.sellOrders.isEmpty() && buyOrder.amount > 0) {
            var bestSell = this.sellOrders.peek();
            if (!bestSell || buyOrder.price < bestSell.price) {
                break; // No match possible
            }
            var matchedSell = this.sellOrders.poll();
            this.executeTrade(buyOrder, matchedSell);
        }
        if (buyOrder.amount > 0) {
            this.buyOrders.add(buyOrder);
        }
    };
    MatchingEngine.prototype.matchSellOrder = function (sellOrder) {
        while (!this.buyOrders.isEmpty() && sellOrder.amount > 0) {
            var bestBuy = this.buyOrders.peek();
            if (!bestBuy || sellOrder.price > bestBuy.price) {
                break; // No match possible
            }
            var matchedBuy = this.buyOrders.poll();
            this.executeTrade(matchedBuy, sellOrder);
        }
        if (sellOrder.amount > 0) {
            this.sellOrders.add(sellOrder);
        }
    };
    MatchingEngine.prototype.executeTrade = function (buyOrder, sellOrder) {
        var matchAmount = Math.min(buyOrder.amount, sellOrder.amount);
        var trade = {
            buyOrderId: buyOrder.id,
            buyerId: buyOrder.userId,
            sellerId: sellOrder.userId,
            sellOrderId: sellOrder.id,
            price: sellOrder.price, // Trade price is determined by the sell order
            amount: matchAmount,
            timestamp: Date.now(),
            baseCurrency: buyOrder.baseCurrency,
            quoteCurrency: buyOrder.quoteCurrency,
        };
        this.trades.push(trade);
        buyOrder.amount -= matchAmount;
        sellOrder.amount -= matchAmount;
        if (sellOrder.amount > 0) {
            this.sellOrders.add(sellOrder);
        }
        if (buyOrder.amount > 0) {
            this.buyOrders.add(buyOrder);
        }
    };
    MatchingEngine.prototype.getMarketPrice = function () {
        var _a, _b;
        if (this.buyOrders.isEmpty() || this.sellOrders.isEmpty()) {
            return null;
        }
        var bestBid = ((_a = this.buyOrders.peek()) === null || _a === void 0 ? void 0 : _a.price) || 0;
        var bestAsk = ((_b = this.sellOrders.peek()) === null || _b === void 0 ? void 0 : _b.price) || 0;
        return (bestBid + bestAsk) / 2;
    };
    MatchingEngine.prototype.getRecentTrades = function (limit) {
        if (limit === void 0) { limit = 50; }
        return this.trades.slice(-limit);
    };
    MatchingEngine.prototype.getGroupedOrders = function (priorityQueue) {
        // Group orders by price
        var groupedOrders = {};
        priorityQueue.values().forEach(function (order) {
            if (!groupedOrders[order.price]) {
                groupedOrders[order.price] = {
                    amounts: [],
                    quoteCurrency: order.quoteCurrency,
                };
            }
            groupedOrders[order.price].amounts.push(order.amount);
        });
        // Convert to array format
        return Object.entries(groupedOrders).map(function (_a) {
            var price = _a[0], _b = _a[1], amounts = _b.amounts, quoteCurrency = _b.quoteCurrency;
            return ({
                price: parseFloat(price),
                amounts: amounts,
                quoteCurrency: quoteCurrency,
            });
        });
    };
    MatchingEngine.prototype.getOrderBook = function (depth, detailed) {
        var groupedAsks = this.getGroupedOrders(this.sellOrders).slice(0, depth);
        var groupedBids = this.getGroupedOrders(this.buyOrders).slice(0, depth);
        if (detailed) {
            return {
                asks: groupedAsks,
                bids: groupedBids,
            };
        }
        else {
            return {
                asks: groupedAsks.map(function (_a) {
                    var price = _a.price, amounts = _a.amounts, quoteCurrency = _a.quoteCurrency;
                    return ({
                        price: price,
                        amount: amounts.reduce(function (sum, amount) { return sum + amount; }, 0),
                        quoteCurrency: quoteCurrency
                    });
                }),
                bids: groupedBids.map(function (_a) {
                    var price = _a.price, amounts = _a.amounts, quoteCurrency = _a.quoteCurrency;
                    return ({
                        price: price,
                        amount: amounts.reduce(function (sum, amount) { return sum + amount; }, 0),
                        quoteCurrency: quoteCurrency
                    });
                }),
            };
        }
    };
    return MatchingEngine;
}());
exports.default = MatchingEngine;
