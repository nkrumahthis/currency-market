import InvoiceRepository from "@/repositories/invoice.repository";
import OrderService from "./order.service";
import { Invoice, InvoiceStatus } from "@prisma/client";
import { IMatchingEngine } from "@/domain/MatchingEngine";

export default class InvoiceService {
	constructor(
		private readonly invoiceRepository: InvoiceRepository,
		private readonly orderService: OrderService,
	) {
	}

	async getAllByCustomerId(customerId: string): Promise<Invoice[]> {
		return await this.invoiceRepository.getByCustomerId(customerId);
	}

	async getAll(): Promise<Invoice[]> {
		return await this.invoiceRepository.getAll();
	}

	async create(data: {
		customerId: string;
		amount: number;
		currencyPairId: string;
		exchangeRate: number;
		status: "PENDING" | "PAID" | "CANCELLED";
		bankDetailsId: string;
		fileId: string;
	}): Promise<Invoice> {
		const invoice = await this.invoiceRepository.create(data);
		await this.orderService.createFromInvoice(invoice);
		return invoice;
	}

	async getDetails(invoiceId: string): Promise<Invoice | null> {
		return await this.invoiceRepository.getById(invoiceId);
	}

	async updateStatus(
		invoiceId: string,
		status: InvoiceStatus
	): Promise<Invoice | null> {
		return await this.invoiceRepository.updateStatus(invoiceId, status);
	}
}
