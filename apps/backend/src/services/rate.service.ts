import RateRepository from "@/repositories/rate.repository";

export default class RateService {
	constructor(private readonly rateRepository: RateRepository) {}

	async getLatest() {
		return await this.rateRepository.getLatest();
	}

	async getAll() {
		return await this.rateRepository.getAll();
	}

	async getById(id: string) {
		return await this.rateRepository.getById(id);
	}

	async getLatestByCurrencyPair(currencyPairId: string) {
		return await this.rateRepository.getLatestByCurrencyPair(currencyPairId.toUpperCase())
	}

	async create(rate: {
		currencyPairId: string;
		rate: number;
		adminId: string;
	}) {
		return await this.rateRepository.create(rate);
	}
}
