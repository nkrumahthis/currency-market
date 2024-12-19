import { Invoice, InvoiceStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CreateInvoiceData } from "@/types";

export default class InvoiceRepository {
	async create(data: CreateInvoiceData): Promise<Invoice> {
		const invoice = await prisma.invoice.create({
			data: {
				...data.invoice,
				status: InvoiceStatus.PENDING,
			},
		});

		prisma.file.create({
			data: {
				filePath: data.file!.file.filename,
				invoiceId: invoice.id,
				fileSize: data.file!.file.size,
				fileType: data.file!.file.mimetype,
			},
		});

		prisma.bankDetails.create({
			data: {
				...data.bankDetails,
				invoiceId: invoice.id,
			},
		});

		const updatedInvoice = await prisma.invoice.findUnique({
			where: { id: invoice.id },
			include: {
				bankDetails: true,
				upload: true,
			},
		});

		return updatedInvoice!;
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
