import { Invoice, InvoiceStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export default class InvoiceRepository {
	async create(data: {
		customerId: string;
		amount: number;
		currencyPairId: string;
		exchangeRate: number;
		status: "PENDING" | "PAID" | "CANCELLED";
		bankDetailsId: string;
		fileId: string;
	}): Promise<Invoice> {
		return prisma.invoice.create({ data });
	}

	async getByCustomerId(customerId: string): Promise<Invoice[]> {
		return prisma.invoice.findMany({ where: { customerId } });
	}

    async getAll(): Promise<Invoice[]> {
        return prisma.invoice.findMany();
    }

    async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
        return prisma.invoice.update({
            where: { id },
            data: { status },
        });
    }

	async getById(id: string) {
		return prisma.invoice.findUnique({
			where: { id },
			include: {
				bankDetails: true,
				upload: true,
			},
		});
	}

	async adminGetById(id: string) {
		return prisma.invoice.findUnique({
			where: { id },
			include: {
				bankDetails: true,
				upload: true,
				customer: true,
				currencyPair: true,
			},
		});
	}
}
