import TradeRepository from "@/repositories/trade.repository";
import { Trade } from "@prisma/client";
import OrderService from "./order.service";
import { IMatchingEngine, TradeMatch } from "@/domain/MatchingEngine";

export default class TradeService {
	constructor(
		private readonly tradeRepository: TradeRepository,
		matchingEngine: IMatchingEngine
	) {
		matchingEngine.onTradeMatch(this.handleTradeMatch.bind(this));
	}

	async handleTradeMatch(match: TradeMatch): Promise<void> {
		const { buyOrder, sellOrder, matchAmount, rate } = match;

		await this.tradeRepository.createTradeWithOrderUpdates(
			buyOrder,
			sellOrder,
			matchAmount,
			rate
		);
	}

	async getTrades(): Promise<Trade[]> {
		return this.tradeRepository.getAll();
	}

	async getTradeById(id: string): Promise<Trade | null> {
		return this.tradeRepository.getById(id);
	}

	async createTrade(trade: Trade): Promise<Trade> {
		return this.tradeRepository.create(trade);
	}

	async getCustomerTrades(customerId: string): Promise<Trade[]> {
		return this.tradeRepository.getByCustomerId(customerId);
	}

	async getPartnerTrades(partnerId: string): Promise<Trade[]> {
		return this.tradeRepository.getByPartnerId(partnerId);
	}

	async getCurrencyPairTrades(currencyPairId: string): Promise<Trade[]> {
		return this.tradeRepository.getByCurrencyPair(currencyPairId);
	}
}
