import InvoiceService from "@/services/invoice.service";
import { UserType } from "@prisma/client";
import fs from "fs";

import express from "express";
import multer from "multer";
import { CreateInvoiceData } from "@/types";

export default function InvoiceController(invoiceService: InvoiceService) {
	const router = express.Router();
	const upload = multer({ storage: multer.memoryStorage() });

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

	router.post("/", upload.single("fileUpload"), async (req, res) => {
		// if (req.user!.role !== UserType.CUSTOMER)
		// 	return res.status(403).json({ error: "User does not have permissions" });

		const uploadedFile = req.file;

		if (!uploadedFile) {
			return res.status(400).json({ error: "No file uploaded" });
		}
		console.warn("you are using default customer id")
		const data: CreateInvoiceData = {
            invoice: {
                customerId: "customer", // Placeholder for userId
                amount: parseFloat(req.body.amount),
                currencyPairId: `${req.body.baseCurrency}-${req.body.quoteCurrency}`,
                exchangeRate: parseFloat(req.body.exchangeRate),
                status: "PENDING",
                baseCurrency: req.body.baseCurrency,
                quoteCurrency: req.body.quoteCurrency,
            },
            bankDetails: {
                bankName: req.body.bankName,
                accountName: req.body.accountName,
                accountNumber: req.body.accountNumber,
                swiftCode: req.body.swift || undefined,
                iban: req.body.iban || undefined,
            },
            file: {
                file: uploadedFile,
            },
        };

		const invoice = await invoiceService.create(data);
		return res.status(201).json({ data: invoice });
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
