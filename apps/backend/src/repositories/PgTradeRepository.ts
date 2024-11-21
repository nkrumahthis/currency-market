import { Pool, PoolClient } from "pg";
import { Trade } from "@/types";
import { TradeRepository } from "./TradeRepository";

export default class PgTradeRepository implements TradeRepository {
    private readonly QUERIES = {
        GET_BALANCE: `
            SELECT amount 
            FROM account_balances 
            WHERE user_id = $1 AND currency = $2
        `,
        UPDATE_BALANCE: `
            UPDATE account_balances 
            SET amount = amount + $1 
            WHERE user_id = $2 AND currency = $3
        `,
        RESERVE_AMOUNT: `
            UPDATE account_balances 
            SET reserved = reserved + $1 
            WHERE user_id = $2 AND currency = $3
        `,
        RECORD_TRADE: `
            INSERT INTO trades (
                id, buy_order_id, sell_order_id, buyer_id, seller_id, 
                base_currency, quote_currency, amount, price, fee, 
                status, settlement_status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `
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
            throw new Error("Invalid amount");
        }
    }

    private validateCurrency(currency: string): void {
        if (!currency?.match(/^[A-Z]{3}$/)) {
            throw new Error("Invalid currency code");
        }
    }

    private sanitizeInput(input: string): string {
        return input.replace(/[^\w\s-]/g, "");
    }

    async getAccountBalance(userId: string, currency: string): Promise<number> {
        this.ensureConnection();
        this.validateCurrency(currency);

        const result = await this.client!.query(this.QUERIES.GET_BALANCE, [
            this.sanitizeInput(userId),
            currency,
        ]);
        return result.rows[0]?.amount || 0;
    }

    async updateBalance(
        userId: string,
        currency: string,
        amount: number,
        operation: "increase" | "decrease"
    ): Promise<void> {
        this.ensureConnection();
        this.validateAmount(amount);
        this.validateCurrency(currency);

        const finalAmount = operation === "increase" ? amount : -amount;

        await this.client!.query(this.QUERIES.UPDATE_BALANCE, [
            finalAmount,
            this.sanitizeInput(userId),
            currency,
        ]);
    }

    async reserveAmount(userId: string, currency: string, amount: number): Promise<void> {
        this.ensureConnection();
        this.validateAmount(amount);
        this.validateCurrency(currency);

        await this.client!.query(this.QUERIES.RESERVE_AMOUNT, [
            amount,
            this.sanitizeInput(userId),
            currency,
        ]);
    }

    async recordTrade(trade: Trade, tradeId: string): Promise<void> {
        this.ensureConnection();
        this.validateAmount(trade.amount);
        this.validateCurrency(trade.baseCurrency);
        this.validateCurrency(trade.quoteCurrency);

        const fee = trade.amount * 0.001; // Example fee calculation (0.1%)
        const status = "EXECUTED";
        const settlementStatus = "PENDING";

        await this.client!.query(this.QUERIES.RECORD_TRADE, [
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
        ]);
    }

    async startTransaction(): Promise<void> {
        this.ensureConnection();
        await this.client!.query("BEGIN");
    }

    async commitTransaction(): Promise<void> {
        this.ensureConnection();
        await this.client!.query("COMMIT");
    }

    async rollbackTransaction(): Promise<void> {
        this.ensureConnection();
        await this.client!.query("ROLLBACK");
    }
}
