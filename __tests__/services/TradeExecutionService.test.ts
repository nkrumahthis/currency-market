import { ITradeRepository } from "@/backend/repositories/ITradeRepository";
import { IMessageConsumer, IMessageProducer } from "@/types";
import TradeExecutionService from "@/backend/services/TradeExecutionService";
import { Trade } from "@/types";

const mockTrade: Trade = {
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

describe('TradeExecutionService', () => {
    let service: TradeExecutionService;
    let mockRepository: jest.Mocked<ITradeRepository>;
    let mockMessageProducer: jest.Mocked<IMessageProducer>;
    let mockMessageConsumer: jest.Mocked<IMessageConsumer>;

    beforeEach(() => {
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

        service = new TradeExecutionService(
            mockRepository,
            mockMessageProducer,
            mockMessageConsumer
        );
    });

    describe('Service Lifecycle', () => {
        it('should start messaging connections', async () => {
            await service.start();

            expect(mockMessageProducer.connect).toHaveBeenCalled();
            expect(mockMessageConsumer.connect).toHaveBeenCalled();
            expect(mockMessageConsumer.onMessage).toHaveBeenCalled();
        });

        it('should stop messaging connections', async () => {
            await service.stop();

            expect(mockMessageProducer.disconnect).toHaveBeenCalled();
            expect(mockMessageConsumer.disconnect).toHaveBeenCalled();
        });

        it('should handle message processing errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            await service.start();

            const messageHandler = mockMessageConsumer.onMessage.mock.calls[0][0];
            await messageHandler({
                topic: 'trades',
                partition: '0',
                message: { 
                    value: 'invalid json',
                    offset: '0',
                    timestamp: Date.now()
                }
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error processing trade command:',
                expect.any(Error)
            );
            consoleSpy.mockRestore();
        });
    });

    describe('executeTrade', () => {
        it('should successfully execute a trade', async () => {
            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000)
                .mockResolvedValueOnce(2000);

            await service.executeTrade(mockTrade);

            expect(mockRepository.connect).toHaveBeenCalled();
            expect(mockRepository.startTransaction).toHaveBeenCalled();
            expect(mockRepository.recordTrade).toHaveBeenCalled();
            expect(mockRepository.commitTransaction).toHaveBeenCalled();
            expect(mockRepository.disconnect).toHaveBeenCalled();

            // Verify trade event was published
            expect(mockMessageProducer.send).toHaveBeenCalledWith(
                'trades',
                expect.any(String),
                expect.stringContaining('"status":"EXECUTED"')
            );
        });

        it('should rollback transaction and publish failure event on error', async () => {
            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000)
                .mockResolvedValueOnce(2000);

            mockRepository.updateBalance
                .mockRejectedValueOnce(new Error('Database error'));

            await expect(service.executeTrade(mockTrade))
                .rejects.toThrow('Trade execution failed');

            expect(mockRepository.rollbackTransaction).toHaveBeenCalled();
            expect(mockRepository.disconnect).toHaveBeenCalled();
            expect(mockMessageProducer.send).toHaveBeenCalledWith(
                'trades',
                expect.any(String),
                expect.stringContaining('"status":"FAILED"')
            );
        });

        it('should check and reserve balances in parallel', async () => {
            const getBalanceSpy = jest.spyOn(mockRepository, 'getAccountBalance');
            const reserveAmountSpy = jest.spyOn(mockRepository, 'reserveAmount');

            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000)
                .mockResolvedValueOnce(2000);

            await service.executeTrade(mockTrade);

            expect(getBalanceSpy).toHaveBeenCalledTimes(2);
            expect(reserveAmountSpy).toHaveBeenCalledTimes(2);
            
            const getBalanceCalls = getBalanceSpy.mock.invocationCallOrder;
            const reserveAmountCalls = reserveAmountSpy.mock.invocationCallOrder;
            
            expect(Math.abs(getBalanceCalls[0] - getBalanceCalls[1])).toBe(1);
            expect(Math.abs(reserveAmountCalls[0] - reserveAmountCalls[1])).toBe(1);
        });

        it('should update all balances in parallel', async () => {
            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000)
                .mockResolvedValueOnce(2000);

            const updateBalanceSpy = jest.spyOn(mockRepository, 'updateBalance');

            await service.executeTrade(mockTrade);

            expect(updateBalanceSpy).toHaveBeenCalledTimes(4);
            
            const calls = updateBalanceSpy.mock.invocationCallOrder;
            expect(Math.abs(calls[0] - calls[1])).toBe(1);
            expect(Math.abs(calls[2] - calls[3])).toBe(1);
        });
    });

    describe('Message Handling', () => {
        it('should handle EXECUTE_TRADE command', async () => {
            await service.start();
            const messageHandler = mockMessageConsumer.onMessage.mock.calls[0][0];

            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000)
                .mockResolvedValueOnce(2000);

            await messageHandler({
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
            });

            expect(mockRepository.recordTrade).toHaveBeenCalled();
            expect(mockMessageProducer.send).toHaveBeenCalledWith(
                'trades',
                expect.any(String),
                expect.stringContaining('"status":"EXECUTED"')
            );
        });

        it('should handle CANCEL_TRADE command', async () => {
            await service.start();
            const messageHandler = mockMessageConsumer.onMessage.mock.calls[0][0];

            await messageHandler({
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
            });

            expect(mockMessageProducer.send).toHaveBeenCalledWith(
                'trades',
                mockTrade.buyOrderId,
                expect.stringContaining('"status":"CANCELLED"')
            );
        });

        it('should log warning for unknown command types', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            await service.start();
            const messageHandler = mockMessageConsumer.onMessage.mock.calls[0][0];

            await messageHandler({
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
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Unknown command type:')
            );
            consoleSpy.mockRestore();
        });
    });

    describe('Error Handling', () => {
        it('should handle message producer errors', async () => {
            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000)
                .mockResolvedValueOnce(2000);

            mockMessageProducer.send
                .mockRejectedValueOnce(new Error('Failed to publish'));

            await expect(service.executeTrade(mockTrade))
                .rejects.toThrow('Trade execution failed');
        });

        it('should handle repository disconnect errors gracefully', async () => {
            mockRepository.disconnect
                .mockRejectedValueOnce(new Error('Disconnect failed'));

            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000)
                .mockResolvedValueOnce(2000);

            await expect(service.executeTrade(mockTrade))
                .rejects.toThrow('Trade execution failed');
        });
    });
});