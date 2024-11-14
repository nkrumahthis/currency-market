import { ITradeRepository } from "@/repositories/ITradeRepository";
import { Trade } from "@/types";

export default class TradeExecutionService {
    private repository: ITradeRepository;

    constructor(repository: ITradeRepository) {
        this.repository = repository;
    }

    async executeTrade(trade: Trade) {
        const tradeId = await this.generateTradeId();

        try {
            await this.repository.connect();
            await this.repository.startTransaction();
            
            try {
                await this.checkAndReserveBalances(trade);
                await this.repository.recordTrade(trade, tradeId);
                await this.updateBalances(trade);
                await this.repository.commitTransaction();
                
                await this.publishTradeEvent(trade, tradeId, "EXECUTED");
                await this.initiateSettlement(trade, tradeId);
            } catch (err: any) {
                await this.repository.rollbackTransaction();
                throw err;
            } finally {
                await this.repository.disconnect();
            }
        } catch (err: any) {
            throw new Error(`Trade execution failed: ${err.message}`);
        }
    }

    private async checkAndReserveBalances(trade: Trade) {
        const [sellerBalance, buyerBalance] = await Promise.all([
            this.repository.getAccountBalance(trade.sellOrderId, trade.sellCurrency),
            this.repository.getAccountBalance(trade.buyOrderId, trade.buyCurrency)
        ]);

        if (sellerBalance < trade.amount) {
            throw new Error("Insufficient seller balance");
        }

        if (buyerBalance < trade.amount) {
            throw new Error("Insufficient buyer balance");
        }

        await Promise.all([
            this.repository.reserveAmount(trade.sellerId, trade.sellCurrency, trade.amount),
            this.repository.reserveAmount(trade.buyerId, trade.buyCurrency, trade.amount)
        ]);
    }

    private async updateBalances(trade: Trade) {
        await Promise.all([
            this.repository.updateBalance(trade.sellerId, trade.sellCurrency, trade.amount, 'decrease'),
            this.repository.updateBalance(trade.buyerId, trade.buyCurrency, trade.amount, 'decrease'),
            this.repository.updateBalance(trade.sellerId, trade.buyCurrency, trade.amount, 'increase'),
            this.repository.updateBalance(trade.buyerId, trade.sellCurrency, trade.amount, 'increase')
        ]);
    }

    private async generateTradeId(): Promise<string> {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 5);
        return `T-${timestamp}-${random}`;
    }

    private async publishTradeEvent(trade: Trade, tradeId: string, eventId: string): Promise<void> {
        console.log('Trade executed:', { trade, tradeId, eventId });
    }

    private async initiateSettlement(trade: Trade, tradeId: string): Promise<void> {
        console.log('Initiating settlement:', { trade, tradeId });
    }
}