import prisma from "../lib/prisma";

export default class RateRepository {
	async getLatest() {
		return await prisma.exchangeRate.findMany({
			select: {
				currencyPairId: true,
				currencyPair: true,
				rate: true,
				admin: {
					select: {
						name: true,
						email: true,
						type: true,
					}
				}
			},
			orderBy: { updatedAt: "desc" },
			distinct: ["currencyPairId"],
		});
	}

	async getLatestByCurrencyPair(currencyPairId: string) {
		console.log(currencyPairId);
		return await prisma.exchangeRate.findFirst({
			select: {
				currencyPairId: true,
				currencyPair: true,
				rate: true,
			},
			where: {
				currencyPairId,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	async getAll() {
		return await prisma.exchangeRate.findMany();
	}

	async getById(id: string) {
		console.log(id);
		return await prisma.exchangeRate.findUnique({
			where: { id },
			select: {
				currencyPairId: true,
				createdAt: true,
				updatedAt: true,
				rate: true,
				currencyPair: {
					select: {
						id: true,
						baseCurrency: true,
						quoteCurrency: true,
					},
				},
				admin: {
					select: { name: true, email: true, type: true },
				},
			},
		});
	}

	async create(rate: {
		currencyPairId: string;
		rate: number;
		adminId: string;
	}) {
		return await prisma.exchangeRate.create({ data: rate });
	}
}
