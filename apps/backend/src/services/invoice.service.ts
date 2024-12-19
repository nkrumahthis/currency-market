import InvoiceRepository from "@/repositories/invoice.repository";
import OrderService from "./order.service";
import { Invoice, InvoiceStatus } from "@prisma/client";
import { IMatchingEngine } from "@/domain/MatchingEngine";
import { IFileUploader } from "@/lib/uploader";
import FileRepository from "@/repositories/file.repository";
import { randomUUID } from "crypto";
import { CreateInvoiceData } from "@/types";

export default class InvoiceService {
	constructor(
		private readonly invoiceRepository: InvoiceRepository,
		private readonly orderService: OrderService,
		private readonly fileUploader: IFileUploader,
	) {}

	async getAllByCustomerId(customerId: string): Promise<Invoice[]> {
		return await this.invoiceRepository.getByCustomerId(customerId);
	}

	async getAll(): Promise<Invoice[]> {
		return await this.invoiceRepository.getAll();
	}

	async create(data: CreateInvoiceData): Promise<Invoice> {
		const fileId = randomUUID();
		await this.fileUploader.uploadFile(data.file!.file, fileId);
		data.file!.fileId = fileId;

		const invoice = await this.invoiceRepository.create(data);
		await this.orderService.createFromInvoice(invoice);
		return invoice;
	}

	async getDetails(invoiceId: string): Promise<Invoice | null> {
		return await this.invoiceRepository.getById(invoiceId);
	}

	async downloadFile(
		invoiceId: string,
		destinationPath: string
	): Promise<void> {
		const invoice = await this.invoiceRepository.getById(invoiceId);
		if (!invoice) {
			throw new Error("Invoice not found");
		}

		if (!invoice.upload) {
			throw new Error("Invoice does not have an uploaded file");
		}
		await this.fileUploader.downloadFile(
			invoice.upload.filePath,
			destinationPath
		);
	}

	async updateStatus(
		invoiceId: string,
		status: InvoiceStatus
	): Promise<Invoice | null> {
		return await this.invoiceRepository.updateStatus(invoiceId, status);
	}
}
