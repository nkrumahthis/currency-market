import { TradeRepository } from "@/repositories/TradeRepository";
import { MessageConsumer, MessageProducer, Trade } from "@/types";

export default class TradeExecutionService {
	private repository: TradeRepository;
	private messageProducer: MessageProducer;
	private messageConsumer: MessageConsumer;

	constructor(
		repository: TradeRepository,
		messageProducer: MessageProducer,
		messageConsumer: MessageConsumer
	) {
		this.repository = repository;
		this.messageProducer = messageProducer;
		this.messageConsumer = messageConsumer;
	}

	async start(): Promise<void> {
		await this.messageProducer.connect();
		await this.messageConsumer.connect();
		await this.messageConsumer.onMessage(
			async (messageCommand: {
				topic: string;
				partition: string;
				message: any;
			}) => {
				const { topic, partition, message } = messageCommand;
				const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
				console.log(`- ${prefix} ${message.key}#${message.value}`);

				try {
					const command = JSON.parse(message.value!.toString());
					await this.handleTradeCommand(command);
				} catch (error) {
					console.error("Error processing trade command:", error);
				}
			}
		);
	}

	async stop(): Promise<void> {
		await this.messageProducer.disconnect();
		await this.messageConsumer.disconnect();
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
			await this.publishTradeEvent(trade, tradeId, "FAILED");
			throw new Error(`Trade execution failed: ${err.message}`);
		}
	}

	private async cancelTrade(trade: Trade) {
		await this.repository.connect();
		await this.repository.startTransaction();

		try {
			await this.publishTradeEvent(trade, trade.buyOrderId, "CANCELLED");
		} catch (err: any) {
			await this.repository.rollbackTransaction();
			throw err;
		} finally {
			await this.repository.disconnect();
		}
	}

	private async checkAndReserveBalances(trade: Trade) {
		const [sellerBalance, buyerBalance] = await Promise.all([
			this.repository.getAccountBalance(trade.sellOrderId, trade.quoteCurrency),
			this.repository.getAccountBalance(trade.buyOrderId, trade.baseCurrency),
		]);

		if (sellerBalance < trade.amount) {
			throw new Error("Insufficient seller balance");
		}

		if (buyerBalance < trade.amount) {
			throw new Error("Insufficient buyer balance");
		}

		await Promise.all([
			this.repository.reserveAmount(
				trade.sellerId,
				trade.quoteCurrency,
				trade.amount
			),
			this.repository.reserveAmount(
				trade.buyerId,
				trade.baseCurrency,
				trade.amount
			),
		]);
	}

	private async updateBalances(trade: Trade) {
		await Promise.all([
			this.repository.updateBalance(
				trade.sellerId,
				trade.quoteCurrency,
				trade.amount,
				"decrease"
			),
			this.repository.updateBalance(
				trade.buyerId,
				trade.baseCurrency,
				trade.amount,
				"decrease"
			),
			this.repository.updateBalance(
				trade.sellerId,
				trade.quoteCurrency,
				trade.amount,
				"increase"
			),
			this.repository.updateBalance(
				trade.buyerId,
				trade.baseCurrency,
				trade.amount,
				"increase"
			),
		]);
	}

	private async generateTradeId(): Promise<string> {
		const timestamp = Date.now().toString(36);
		const random = Math.random().toString(36).substring(2, 5);
		return `T-${timestamp}-${random}`;
	}

	async publishTradeEvent(
		trade: Trade,
		tradeId: string,
		status: string,
		errorMessage: string | null = null
	): Promise<void> {
		const tradeMessage = {
			tradeId,
			status,
			errorMessage,
			trade,
			timestamp: Date.now(),
		};

		await this.messageProducer.send(
			"trades",
			tradeId,
			JSON.stringify(tradeMessage)
		);
	}

	private async initiateSettlement(
		trade: Trade,
		tradeId: string
	): Promise<void> {
		console.log("Initiating settlement:", { trade, tradeId });
	}

	private async handleTradeCommand(command: {
		type: string;
		trade: Trade;
	}): Promise<void> {
		switch (command.type) {
			case "EXECUTE_TRADE":
				await this.executeTrade(command.trade);
				break;
			case "CANCEL_TRADE":
				await this.cancelTrade(command.trade);
				break;
			default:
				console.warn(`Unknown command type: ${command.type}`);
		}
	}
}
