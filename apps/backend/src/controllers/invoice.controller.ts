import InvoiceService from "@/services/invoice.service";
import { UserType } from "@prisma/client";

import express from "express";

export default function InvoiceController(invoiceService: InvoiceService) {
	const router = express.Router();

	router.get("/", (req, res) => {
		if (req.user!.role === UserType.CUSTOMER) {
			const invoices = invoiceService.getAllByCustomerId(req.user!.userId);
			return res.json({ data: invoices });
		} else if (req.user!.role === UserType.ADMIN) {
			const invoices = invoiceService.getAll();
			return res.json({ data: invoices });
		} else
			return res
				.status(403)
				.json({ error: "User does not have permissions for this resource." });
	});

	router.post("/", (req, res) => {
		if (req.user!.role !== UserType.CUSTOMER)
			return res.status(403).json({ error: "User does not have permissions" });

		const invoice = invoiceService.create(req.body);
		return res.json({ data: invoice });
	});

	router.get("/:id", async (req, res) => {
		if (req.user!.role === UserType.CUSTOMER) {
			const invoice = await invoiceService.getDetails(req.params.id);
			if (!invoice) return res.status(404).json({ error: "Invoice not found" });
		}
	});

	router.put("/:id", async (req, res) => {
		if (req.user!.role === UserType.CUSTOMER) {
			const invoice = await invoiceService.updateStatus(
				req.params.id,
				req.body.status
			);
			if (!invoice) return res.status(404).json({ error: "Invoice not found" });
		} else
			return res.status(403).json({ error: "User does not have permissions" });
	});

	return router;
}
