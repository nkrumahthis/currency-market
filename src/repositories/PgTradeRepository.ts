import { Trade } from "@/types";
import { ITradeRepository } from "./ITradeRepository";
import { Pool, PoolClient } from "pg";

export default class PgTradeRepository implements ITradeRepository {
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

    async connect() {
        this.client = await this.db.connect()
    }

	async getAccountBalance(
		accountId: string,
		currency: string
	): Promise<number> {
		const result = await this.client!.query(
			"SELECT amount FROM account_balances WHERE account_id = $1 and currency = $2;",
			[accountId, currency]
		);

		return result.rows[0]?.amount || 0;
	}
	async reserveAmount(
		accountId: string,
		currency: string,
		amount: number
	): Promise<void> {
		await this.client!.query(
			"UPDATE account_balances SET reserved = reserved + $1 WHERE account_id = $2 AND currency = $3;",
			[amount, accountId, currency]
		);
	}

	async recordTrade(trade: Trade, tradeId: string): Promise<void> {
		const query = `
            INSERT INTO trades(
                trade_id,
                seller_id,
                buyer_id,
                sell_currency,
                buy_currency,
                amount,
                status,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `;

		await this.client!.query(query, [
			tradeId,
			trade.sellerId,
			trade.buyerId,
			trade.sellCurrency,
			trade.buyCurrency,
			trade.amount,
			"EXECUTED",
			new Date(),
		]);
	}

	async updateBalance(
		amount: number,
		userId: string,
		currency: string,

	): Promise<void> {
		await this.client!.query(
			"UPDATE account_balances SET amount = amount - $1 WHERE account_id = $2 AND currency = $3;",
			[amount, userId, currency]
		);
	}

    async increaseBalance(
		amount: number,
		userId: string,
		currency: string
	): Promise<void> {
		await this.client!.query(
			"UPDATE account_balances SET amount = amount + $1 WHERE account_id = $2 AND currency = $3;",
			[amount, userId, currency]
		);
	}

    async reduceBalance(
		amount: number,
		userId: string,
		currency: string
	): Promise<void> {
		await this.client!.query(
			"UPDATE account_balances SET amount = amount - $1 WHERE account_id = $2 AND currency = $3;",
			[amount, userId, currency]
		);
	}

	async startTransaction(): Promise<void> {
		await this.client!.query("BEGIN");
	}

	async commitTransaction(): Promise<void> {
		await this.client!.query("COMMIT");
	}

	async rollbackTransaction(): Promise<void> {
		await this.client!.query("ROLLBACK");
	}
}
