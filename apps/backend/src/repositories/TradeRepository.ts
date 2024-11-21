import { Trade } from "@/types";

export interface TradeRepository {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getAccountBalance(accountId: string, currency: string): Promise<number>;
    updateBalance(userId: string, currency: string, amount: number, operation: 'increase' | 'decrease'): Promise<void>;
    reserveAmount(accountId: string, currency: string, amount: number): Promise<void>;
    recordTrade(trade: Trade, tradeId: string): Promise<void>;
    startTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    close(): Promise<void>;
}