import { Trade } from "@/types";

export interface ITradeRepository {
	connect(): Promise<void>;
    startTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
	rollbackTransaction(): Promise<void>;
	getAccountBalance(accountId: string, currency: string): Promise<number>;
	reserveAmount(accountId: string, currency: string, amount: number): Promise<void>;
	recordTrade(trade: Trade, tradeId: string): Promise<void>;
	updateBalance(amount: number, userId: string, currency: string): Promise<void>;
	increaseBalance(amount: number, userId: string, currency: string): Promise<void>;
	reduceBalance(amount: number, userId: string, currency: string): Promise<void>;
}
