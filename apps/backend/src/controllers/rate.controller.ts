import RateService from "@/services/rate.service";
import { Router } from "express";

export default function RateController(rateService: RateService) {
	const router = Router();

	router.get("/", async (_, res) => {
		const rates = await rateService.getLatest();
		return res.json({ data: rates });
	});

    router.get("/history", async (_, res) => {
		const rates = await rateService.getAll();
		return res.json({ data: rates });
	});

    router.get("/history/:id", async (req, res) => {
		const rates = await rateService.getById(req.params.id);
		return res.json({ data: rates });
	});

    router.get("/:currencyPair", async (req, res) => {
		const rate = await rateService.getLatestByCurrencyPair(req.params.currencyPair);
		return res.json({ data: rate });
	});

    router.post("/", async (req, res) => {
		const rates = await rateService.create(req.body);
		return res.json({ data: rates });
	});

	return router;
}
