"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var TradeExecutionService = /** @class */ (function () {
    function TradeExecutionService(repository, messageProducer, messageConsumer) {
        this.repository = repository;
        this.messageProducer = messageProducer;
        this.messageConsumer = messageConsumer;
    }
    TradeExecutionService.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.messageProducer.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.messageConsumer.connect()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.messageConsumer.onMessage(function (messageCommand) { return __awaiter(_this, void 0, void 0, function () {
                                var topic, partition, message, prefix, command, error_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            topic = messageCommand.topic, partition = messageCommand.partition, message = messageCommand.message;
                                            prefix = "".concat(topic, "[").concat(partition, " | ").concat(message.offset, "] / ").concat(message.timestamp);
                                            console.log("- ".concat(prefix, " ").concat(message.key, "#").concat(message.value));
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            command = JSON.parse(message.value.toString());
                                            return [4 /*yield*/, this.handleTradeCommand(command)];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_1 = _a.sent();
                                            console.error("Error processing trade command:", error_1);
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TradeExecutionService.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.messageProducer.disconnect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.messageConsumer.disconnect()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TradeExecutionService.prototype.executeTrade = function (trade) {
        return __awaiter(this, void 0, void 0, function () {
            var tradeId, err_1, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generateTradeId()];
                    case 1:
                        tradeId = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 17, , 19]);
                        return [4 /*yield*/, this.repository.connect()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.repository.startTransaction()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 12, 14, 16]);
                        return [4 /*yield*/, this.checkAndReserveBalances(trade)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.repository.recordTrade(trade, tradeId)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.updateBalances(trade)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.repository.commitTransaction()];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.publishTradeEvent(trade, tradeId, "EXECUTED")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.initiateSettlement(trade, tradeId)];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 16];
                    case 12:
                        err_1 = _a.sent();
                        return [4 /*yield*/, this.repository.rollbackTransaction()];
                    case 13:
                        _a.sent();
                        throw err_1;
                    case 14: return [4 /*yield*/, this.repository.disconnect()];
                    case 15:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 16: return [3 /*break*/, 19];
                    case 17:
                        err_2 = _a.sent();
                        return [4 /*yield*/, this.publishTradeEvent(trade, tradeId, "FAILED")];
                    case 18:
                        _a.sent();
                        throw new Error("Trade execution failed: ".concat(err_2.message));
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    TradeExecutionService.prototype.cancelTrade = function (trade) {
        return __awaiter(this, void 0, void 0, function () {
            var err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.repository.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.repository.startTransaction()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, 7, 9]);
                        return [4 /*yield*/, this.publishTradeEvent(trade, trade.buyOrderId, "CANCELLED")];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 5:
                        err_3 = _a.sent();
                        return [4 /*yield*/, this.repository.rollbackTransaction()];
                    case 6:
                        _a.sent();
                        throw err_3;
                    case 7: return [4 /*yield*/, this.repository.disconnect()];
                    case 8:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    TradeExecutionService.prototype.checkAndReserveBalances = function (trade) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sellerBalance, buyerBalance;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.repository.getAccountBalance(trade.sellOrderId, trade.quoteCurrency),
                            this.repository.getAccountBalance(trade.buyOrderId, trade.baseCurrency),
                        ])];
                    case 1:
                        _a = _b.sent(), sellerBalance = _a[0], buyerBalance = _a[1];
                        if (sellerBalance < trade.amount) {
                            throw new Error("Insufficient seller balance");
                        }
                        if (buyerBalance < trade.amount) {
                            throw new Error("Insufficient buyer balance");
                        }
                        return [4 /*yield*/, Promise.all([
                                this.repository.reserveAmount(trade.sellerId, trade.quoteCurrency, trade.amount),
                                this.repository.reserveAmount(trade.buyerId, trade.baseCurrency, trade.amount),
                            ])];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TradeExecutionService.prototype.updateBalances = function (trade) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.repository.updateBalance(trade.sellerId, trade.quoteCurrency, trade.amount, "decrease"),
                            this.repository.updateBalance(trade.buyerId, trade.baseCurrency, trade.amount, "decrease"),
                            this.repository.updateBalance(trade.sellerId, trade.quoteCurrency, trade.amount, "increase"),
                            this.repository.updateBalance(trade.buyerId, trade.baseCurrency, trade.amount, "increase"),
                        ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TradeExecutionService.prototype.generateTradeId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, random;
            return __generator(this, function (_a) {
                timestamp = Date.now().toString(36);
                random = Math.random().toString(36).substring(2, 5);
                return [2 /*return*/, "T-".concat(timestamp, "-").concat(random)];
            });
        });
    };
    TradeExecutionService.prototype.publishTradeEvent = function (trade_1, tradeId_1, status_1) {
        return __awaiter(this, arguments, void 0, function (trade, tradeId, status, errorMessage) {
            var tradeMessage;
            if (errorMessage === void 0) { errorMessage = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tradeMessage = {
                            tradeId: tradeId,
                            status: status,
                            errorMessage: errorMessage,
                            trade: trade,
                            timestamp: Date.now(),
                        };
                        return [4 /*yield*/, this.messageProducer.send("trades", tradeId, JSON.stringify(tradeMessage))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TradeExecutionService.prototype.initiateSettlement = function (trade, tradeId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Initiating settlement:", { trade: trade, tradeId: tradeId });
                return [2 /*return*/];
            });
        });
    };
    TradeExecutionService.prototype.handleTradeCommand = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = command.type;
                        switch (_a) {
                            case "EXECUTE_TRADE": return [3 /*break*/, 1];
                            case "CANCEL_TRADE": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.executeTrade(command.trade)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, this.cancelTrade(command.trade)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        console.warn("Unknown command type: ".concat(command.type));
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return TradeExecutionService;
}());
exports.default = TradeExecutionService;
