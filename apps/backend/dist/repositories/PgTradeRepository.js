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
var pg_1 = require("pg");
var PgTradeRepository = /** @class */ (function () {
    function PgTradeRepository() {
        this.QUERIES = {
            GET_BALANCE: "\n            SELECT amount \n            FROM account_balances \n            WHERE user_id = $1 AND currency = $2\n        ",
            UPDATE_BALANCE: "\n            UPDATE account_balances \n            SET amount = amount + $1 \n            WHERE user_id = $2 AND currency = $3\n        ",
            RESERVE_AMOUNT: "\n            UPDATE account_balances \n            SET reserved = reserved + $1 \n            WHERE user_id = $2 AND currency = $3\n        ",
            RECORD_TRADE: "\n            INSERT INTO trades (\n                id, buy_order_id, sell_order_id, buyer_id, seller_id, \n                base_currency, quote_currency, amount, price, fee, \n                status, settlement_status, created_at\n            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)\n        "
        };
        this.client = null;
        this.db = new pg_1.Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
    }
    PgTradeRepository.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.client) {
                            throw new Error("Connection already exists");
                        }
                        _a = this;
                        return [4 /*yield*/, this.db.connect()];
                    case 1:
                        _a.client = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PgTradeRepository.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.client) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.release()];
                    case 1:
                        _a.sent();
                        this.client = null;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    PgTradeRepository.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.disconnect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.end()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PgTradeRepository.prototype.ensureConnection = function () {
        if (!this.client) {
            throw new Error("No database connection");
        }
    };
    PgTradeRepository.prototype.validateAmount = function (amount) {
        if (amount <= 0 || !Number.isFinite(amount)) {
            throw new Error("Invalid amount");
        }
    };
    PgTradeRepository.prototype.validateCurrency = function (currency) {
        if (!(currency === null || currency === void 0 ? void 0 : currency.match(/^[A-Z]{3}$/))) {
            throw new Error("Invalid currency code");
        }
    };
    PgTradeRepository.prototype.sanitizeInput = function (input) {
        return input.replace(/[^\w\s-]/g, "");
    };
    PgTradeRepository.prototype.getAccountBalance = function (userId, currency) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.ensureConnection();
                        this.validateCurrency(currency);
                        return [4 /*yield*/, this.client.query(this.QUERIES.GET_BALANCE, [
                                this.sanitizeInput(userId),
                                currency,
                            ])];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, ((_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.amount) || 0];
                }
            });
        });
    };
    PgTradeRepository.prototype.updateBalance = function (userId, currency, amount, operation) {
        return __awaiter(this, void 0, void 0, function () {
            var finalAmount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnection();
                        this.validateAmount(amount);
                        this.validateCurrency(currency);
                        finalAmount = operation === "increase" ? amount : -amount;
                        return [4 /*yield*/, this.client.query(this.QUERIES.UPDATE_BALANCE, [
                                finalAmount,
                                this.sanitizeInput(userId),
                                currency,
                            ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PgTradeRepository.prototype.reserveAmount = function (userId, currency, amount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnection();
                        this.validateAmount(amount);
                        this.validateCurrency(currency);
                        return [4 /*yield*/, this.client.query(this.QUERIES.RESERVE_AMOUNT, [
                                amount,
                                this.sanitizeInput(userId),
                                currency,
                            ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PgTradeRepository.prototype.recordTrade = function (trade, tradeId) {
        return __awaiter(this, void 0, void 0, function () {
            var fee, status, settlementStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnection();
                        this.validateAmount(trade.amount);
                        this.validateCurrency(trade.baseCurrency);
                        this.validateCurrency(trade.quoteCurrency);
                        fee = trade.amount * 0.001;
                        status = "EXECUTED";
                        settlementStatus = "PENDING";
                        return [4 /*yield*/, this.client.query(this.QUERIES.RECORD_TRADE, [
                                tradeId,
                                this.sanitizeInput(trade.buyOrderId),
                                this.sanitizeInput(trade.sellOrderId),
                                this.sanitizeInput(trade.buyerId),
                                this.sanitizeInput(trade.sellerId),
                                trade.baseCurrency,
                                trade.quoteCurrency,
                                trade.amount,
                                trade.price,
                                fee,
                                status,
                                settlementStatus,
                                new Date(),
                            ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PgTradeRepository.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnection();
                        return [4 /*yield*/, this.client.query("BEGIN")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PgTradeRepository.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnection();
                        return [4 /*yield*/, this.client.query("COMMIT")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PgTradeRepository.prototype.rollbackTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnection();
                        return [4 /*yield*/, this.client.query("ROLLBACK")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return PgTradeRepository;
}());
exports.default = PgTradeRepository;
