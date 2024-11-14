import { ITradeRepository } from "@/repositories/ITradeRepository";
import TradeExecutionService from "@/services/TradeExecutionService";
import { Trade } from "@/types";

const mockTrade: Trade = {
    sellerId: "seller123",
    buyerId: "buyer456",
    sellOrderId: "order789",
    buyOrderId: "order101",
    sellCurrency: "USD",
    buyCurrency: "EUR",
    amount: 1000,
    timestamp: 0,
    price: 1
};

describe('TradeExecutionService', () => {
    let service: TradeExecutionService;
    let mockRepository: jest.Mocked<ITradeRepository>;

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

        service = new TradeExecutionService(mockRepository);
    });

    describe('executeTrade', () => {
        it('should successfully execute a trade', async () => {
            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000) // seller balance
                .mockResolvedValueOnce(2000); // buyer balance

            await service.executeTrade(mockTrade);

            expect(mockRepository.connect).toHaveBeenCalled();
            expect(mockRepository.startTransaction).toHaveBeenCalled();
            expect(mockRepository.recordTrade).toHaveBeenCalled();
            expect(mockRepository.commitTransaction).toHaveBeenCalled();
            expect(mockRepository.disconnect).toHaveBeenCalled();
        });

        it('should rollback transaction on error', async () => {
            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000)
                .mockResolvedValueOnce(2000);

            mockRepository.updateBalance
                .mockRejectedValueOnce(new Error('Database error'));

            await expect(service.executeTrade(mockTrade))
                .rejects.toThrow('Trade execution failed');

            expect(mockRepository.rollbackTransaction).toHaveBeenCalled();
            expect(mockRepository.disconnect).toHaveBeenCalled();
        });

        it('should validate seller balance', async () => {
            mockRepository.getAccountBalance
                .mockResolvedValueOnce(500) // insufficient seller balance
                .mockResolvedValueOnce(2000);

            await expect(service.executeTrade(mockTrade))
                .rejects.toThrow('Insufficient seller balance');
        });

        it('should validate buyer balance', async () => {
            mockRepository.getAccountBalance
                .mockResolvedValueOnce(2000)
                .mockResolvedValueOnce(500); // insufficient buyer balance

            await expect(service.executeTrade(mockTrade))
                .rejects.toThrow('Insufficient buyer balance');
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
            
            // Verify parallel execution
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
            
            // Verify parallel execution
            const calls = updateBalanceSpy.mock.invocationCallOrder;
            expect(Math.abs(calls[0] - calls[1])).toBe(1);
            expect(Math.abs(calls[2] - calls[3])).toBe(1);
        });
    });

    describe('generateTradeId', () => {
        it('should generate unique trade IDs', async () => {
            mockRepository.getAccountBalance
                .mockResolvedValue(2000);

            const ids = new Set();
            for (let i = 0; i < 100; i++) {
                await service.executeTrade(mockTrade);
                const id = mockRepository.recordTrade.mock.calls[i][1];
                ids.add(id);
            }

            expect(ids.size).toBe(100);
            ids.forEach(id => {
                expect(id).toMatch(/^T-[a-z0-9]+-[a-z0-9]+$/);
            });
        });
    });
});