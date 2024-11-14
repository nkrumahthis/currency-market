import { Pool, PoolClient } from "pg";
import { Trade } from "@/types";
import { ITradeRepository } from "./ITradeRepository";

export default class PgTradeRepository implements ITradeRepository {
    private readonly QUERIES = {
        GET_BALANCE: 'SELECT amount FROM account_balances WHERE account_id = $1 AND currency = $2',
        UPDATE_BALANCE: 'UPDATE account_balances SET amount = amount + $1 WHERE account_id = $2 AND currency = $3',
        RESERVE_AMOUNT: 'UPDATE account_balances SET reserved = reserved + $1 WHERE account_id = $2 AND currency = $3',
        RECORD_TRADE: `
            INSERT INTO trades(
                trade_id, seller_id, buyer_id, sell_currency, buy_currency,
                amount, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`
    } as const;

    private db: Pool;
    private client: PoolClient | null = null;

    constructor() {
        this.db = new Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT!),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
    }

    async connect(): Promise<void> {
        if (this.client) {
            throw new Error("Connection already exists");
        }
        this.client = await this.db.connect();
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.release();
            this.client = null;
        }
    }

    async close(): Promise<void> {
        await this.disconnect();
        await this.db.end();
    }

    private ensureConnection(): void {
        if (!this.client) {
            throw new Error("No database connection");
        }
    }

    private validateAmount(amount: number): void {
        if (amount <= 0 || !Number.isFinite(amount)) {
            throw new Error('Invalid amount');
        }
    }

    private validateCurrency(currency: string): void {
        if (!currency?.match(/^[A-Z]{3}$/)) {
            throw new Error('Invalid currency code');
        }
    }

    private sanitizeInput(input: string): string {
        return input.replace(/[^\w\s-]/g, '');
    }

    async getAccountBalance(accountId: string, currency: string): Promise<number> {
        this.ensureConnection();
        this.validateCurrency(currency);
        
        const safeAccountId = this.sanitizeInput(accountId);
        const result = await this.client!.query(this.QUERIES.GET_BALANCE, [safeAccountId, currency]);
        return result.rows[0]?.amount || 0;
    }

    async updateBalance(
        userId: string,
        currency: string,
        amount: number,
        operation: 'increase' | 'decrease'
    ): Promise<void> {
        this.ensureConnection();
        this.validateAmount(amount);
        this.validateCurrency(currency);

        const safeUserId = this.sanitizeInput(userId);
        const finalAmount = operation === 'increase' ? amount : -amount;
        
        await this.client!.query(
            this.QUERIES.UPDATE_BALANCE,
            [finalAmount, safeUserId, currency]
        );
    }

    async reserveAmount(accountId: string, currency: string, amount: number): Promise<void> {
        this.ensureConnection();
        this.validateAmount(amount);
        this.validateCurrency(currency);

        const safeAccountId = this.sanitizeInput(accountId);
        await this.client!.query(
            this.QUERIES.RESERVE_AMOUNT,
            [amount, safeAccountId, currency]
        );
    }

    async recordTrade(trade: Trade, tradeId: string): Promise<void> {
        this.ensureConnection();
        this.validateAmount(trade.amount);
        this.validateCurrency(trade.sellCurrency);
        this.validateCurrency(trade.buyCurrency);

        await this.client!.query(this.QUERIES.RECORD_TRADE, [
            tradeId,
            this.sanitizeInput(trade.sellerId),
            this.sanitizeInput(trade.buyerId),
            trade.sellCurrency,
            trade.buyCurrency,
            trade.amount,
            'EXECUTED',
            new Date()
        ]);
    }

    async startTransaction(): Promise<void> {
        this.ensureConnection();
        await this.client!.query('BEGIN');
    }

    async commitTransaction(): Promise<void> {
        this.ensureConnection();
        await this.client!.query('COMMIT');
    }

    async rollbackTransaction(): Promise<void> {
        this.ensureConnection();
        await this.client!.query('ROLLBACK');
    }
}