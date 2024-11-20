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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var TradeExecutionService_1 = __importDefault(require("@/services/TradeExecutionService"));
var mockTrade = {
    sellerId: "seller123",
    buyerId: "buyer456",
    sellOrderId: "order789",
    buyOrderId: "order101",
    baseCurrency: "USD",
    quoteCurrency: "EUR",
    amount: 1000,
    timestamp: 0,
    price: 1
};
describe('TradeExecutionService', function () {
    var service;
    var mockRepository;
    var mockMessageProducer;
    var mockMessageConsumer;
    beforeEach(function () {
        mockRepository = {
            connect: jest.fn(),
            disconnect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            getAccountBalance: jest.fn(),
            updateBalance: jest.fn(),
            reserveAmount: jest.fn(),
            recordTrade: jest.fn(),
            close: jest.fn(),
        };
        mockMessageProducer = {
            connect: jest.fn(),
            disconnect: jest.fn(),
            send: jest.fn(),
        };
        mockMessageConsumer = {
            connect: jest.fn(),
            disconnect: jest.fn(),
            onMessage: jest.fn(),
            subscribe: jest.fn(),
        };
        service = new TradeExecutionService_1.default(mockRepository, mockMessageProducer, mockMessageConsumer);
    });
    describe('Service Lifecycle', function () {
        it('should start messaging connections', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.start()];
                    case 1:
                        _a.sent();
                        expect(mockMessageProducer.connect).toHaveBeenCalled();
                        expect(mockMessageConsumer.connect).toHaveBeenCalled();
                        expect(mockMessageConsumer.onMessage).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should stop messaging connections', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.stop()];
                    case 1:
                        _a.sent();
                        expect(mockMessageProducer.disconnect).toHaveBeenCalled();
                        expect(mockMessageConsumer.disconnect).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle message processing errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var consoleSpy, messageHandler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                        return [4 /*yield*/, service.start()];
                    case 1:
                        _a.sent();
                        messageHandler = mockMessageConsumer.onMessage.mock.calls[0][0];
                        return [4 /*yield*/, messageHandler({
                                topic: 'trades',
                                partition: '0',
                                message: {
                                    value: 'invalid json',
                                    offset: '0',
                                    timestamp: Date.now()
                                }
                            })];
                    case 2:
                        _a.sent();
                        expect(consoleSpy).toHaveBeenCalledWith('Error processing trade command:', expect.any(Error));
                        consoleSpy.mockRestore();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('executeTrade', function () {
        it('should successfully execute a trade', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRepository.getAccountBalance
                            .mockResolvedValueOnce(2000)
                            .mockResolvedValueOnce(2000);
                        return [4 /*yield*/, service.executeTrade(mockTrade)];
                    case 1:
                        _a.sent();
                        expect(mockRepository.connect).toHaveBeenCalled();
                        expect(mockRepository.startTransaction).toHaveBeenCalled();
                        expect(mockRepository.recordTrade).toHaveBeenCalled();
                        expect(mockRepository.commitTransaction).toHaveBeenCalled();
                        expect(mockRepository.disconnect).toHaveBeenCalled();
                        // Verify trade event was published
                        expect(mockMessageProducer.send).toHaveBeenCalledWith('trades', expect.any(String), expect.stringContaining('"status":"EXECUTED"'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should rollback transaction and publish failure event on error', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRepository.getAccountBalance
                            .mockResolvedValueOnce(2000)
                            .mockResolvedValueOnce(2000);
                        mockRepository.updateBalance
                            .mockRejectedValueOnce(new Error('Database error'));
                        return [4 /*yield*/, expect(service.executeTrade(mockTrade))
                                .rejects.toThrow('Trade execution failed')];
                    case 1:
                        _a.sent();
                        expect(mockRepository.rollbackTransaction).toHaveBeenCalled();
                        expect(mockRepository.disconnect).toHaveBeenCalled();
                        expect(mockMessageProducer.send).toHaveBeenCalledWith('trades', expect.any(String), expect.stringContaining('"status":"FAILED"'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should check and reserve balances in parallel', function () { return __awaiter(void 0, void 0, void 0, function () {
            var getBalanceSpy, reserveAmountSpy, getBalanceCalls, reserveAmountCalls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        getBalanceSpy = jest.spyOn(mockRepository, 'getAccountBalance');
                        reserveAmountSpy = jest.spyOn(mockRepository, 'reserveAmount');
                        mockRepository.getAccountBalance
                            .mockResolvedValueOnce(2000)
                            .mockResolvedValueOnce(2000);
                        return [4 /*yield*/, service.executeTrade(mockTrade)];
                    case 1:
                        _a.sent();
                        expect(getBalanceSpy).toHaveBeenCalledTimes(2);
                        expect(reserveAmountSpy).toHaveBeenCalledTimes(2);
                        getBalanceCalls = getBalanceSpy.mock.invocationCallOrder;
                        reserveAmountCalls = reserveAmountSpy.mock.invocationCallOrder;
                        expect(Math.abs(getBalanceCalls[0] - getBalanceCalls[1])).toBe(1);
                        expect(Math.abs(reserveAmountCalls[0] - reserveAmountCalls[1])).toBe(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should update all balances in parallel', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateBalanceSpy, calls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRepository.getAccountBalance
                            .mockResolvedValueOnce(2000)
                            .mockResolvedValueOnce(2000);
                        updateBalanceSpy = jest.spyOn(mockRepository, 'updateBalance');
                        return [4 /*yield*/, service.executeTrade(mockTrade)];
                    case 1:
                        _a.sent();
                        expect(updateBalanceSpy).toHaveBeenCalledTimes(4);
                        calls = updateBalanceSpy.mock.invocationCallOrder;
                        expect(Math.abs(calls[0] - calls[1])).toBe(1);
                        expect(Math.abs(calls[2] - calls[3])).toBe(1);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Message Handling', function () {
        it('should handle EXECUTE_TRADE command', function () { return __awaiter(void 0, void 0, void 0, function () {
            var messageHandler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.start()];
                    case 1:
                        _a.sent();
                        messageHandler = mockMessageConsumer.onMessage.mock.calls[0][0];
                        mockRepository.getAccountBalance
                            .mockResolvedValueOnce(2000)
                            .mockResolvedValueOnce(2000);
                        return [4 /*yield*/, messageHandler({
                                topic: 'trades',
                                partition: '0',
                                message: {
                                    value: Buffer.from(JSON.stringify({
                                        type: 'EXECUTE_TRADE',
                                        trade: mockTrade
                                    })),
                                    offset: '0',
                                    timestamp: Date.now()
                                }
                            })];
                    case 2:
                        _a.sent();
                        expect(mockRepository.recordTrade).toHaveBeenCalled();
                        expect(mockMessageProducer.send).toHaveBeenCalledWith('trades', expect.any(String), expect.stringContaining('"status":"EXECUTED"'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle CANCEL_TRADE command', function () { return __awaiter(void 0, void 0, void 0, function () {
            var messageHandler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.start()];
                    case 1:
                        _a.sent();
                        messageHandler = mockMessageConsumer.onMessage.mock.calls[0][0];
                        return [4 /*yield*/, messageHandler({
                                topic: 'trades',
                                partition: '0',
                                message: {
                                    value: Buffer.from(JSON.stringify({
                                        type: 'CANCEL_TRADE',
                                        trade: mockTrade
                                    })),
                                    offset: '0',
                                    timestamp: Date.now()
                                }
                            })];
                    case 2:
                        _a.sent();
                        expect(mockMessageProducer.send).toHaveBeenCalledWith('trades', mockTrade.buyOrderId, expect.stringContaining('"status":"CANCELLED"'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should log warning for unknown command types', function () { return __awaiter(void 0, void 0, void 0, function () {
            var consoleSpy, messageHandler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
                        return [4 /*yield*/, service.start()];
                    case 1:
                        _a.sent();
                        messageHandler = mockMessageConsumer.onMessage.mock.calls[0][0];
                        return [4 /*yield*/, messageHandler({
                                topic: 'trades',
                                partition: '0',
                                message: {
                                    value: Buffer.from(JSON.stringify({
                                        type: 'UNKNOWN_COMMAND',
                                        trade: mockTrade
                                    })),
                                    offset: '0',
                                    timestamp: Date.now()
                                }
                            })];
                    case 2:
                        _a.sent();
                        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command type:'));
                        consoleSpy.mockRestore();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Error Handling', function () {
        it('should handle message producer errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRepository.getAccountBalance
                            .mockResolvedValueOnce(2000)
                            .mockResolvedValueOnce(2000);
                        mockMessageProducer.send
                            .mockRejectedValueOnce(new Error('Failed to publish'));
                        return [4 /*yield*/, expect(service.executeTrade(mockTrade))
                                .rejects.toThrow('Trade execution failed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle repository disconnect errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRepository.disconnect
                            .mockRejectedValueOnce(new Error('Disconnect failed'));
                        mockRepository.getAccountBalance
                            .mockResolvedValueOnce(2000)
                            .mockResolvedValueOnce(2000);
                        return [4 /*yield*/, expect(service.executeTrade(mockTrade))
                                .rejects.toThrow('Trade execution failed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
