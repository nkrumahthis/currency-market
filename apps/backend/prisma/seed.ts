const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const exchangeRateData = require("./rates-2024-12-16.json")
import { hashPassword } from "@/lib/auth.lib";

async function main() {
	const currencies = ["USD", "GHS", "GBP", "EUR", "XOF", "XAF", "NGN"];

	prisma.user.create({
		data: {
			id: "system",
			name: "system",
			email: "system@currmark.com",
			password: await hashPassword("system32"),
			type: "ADMIN",
		},
	})

	const currencyPairs: {
		id: string;
		baseCurrency: string;
		quoteCurrency: string;
	}[] = [];

	for (let i = 0; i < currencies.length; i++) {
		for (let j = i + 1; j < currencies.length; j++) {
			currencyPairs.push({
				id: `${currencies[i]}-${currencies[j]}`,
				baseCurrency: currencies[i],
				quoteCurrency: currencies[j],
			});
		}
	}

	await prisma.currencyPair.deleteMany();

	await prisma.currencyPair.createMany({
		data: currencyPairs,
		skipDuplicates: true
	});
	await prisma.exchangeRate.createMany({
		data: exchangeRateData
	})
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
