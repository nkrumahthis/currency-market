import TradeService from "@/services/trade.service";
import { Router } from "express";

export default function TradeController(tradeService: TradeService): Router {
	const router = Router();

	router.get("/", async (_, res) => {
		console.log(1)
		const trades = await tradeService.getTrades();
		return res.json({ data: trades });
	});

	router.get("/:id", async (req, res) => {
		console.log(2)

		const trade = await tradeService.getTradeById(req.params.id);
		if (!trade) return res.status(404).json({ error: "Trade not found" });
		return res.json({ data: trade });
	});

	router.post("/", async (req, res) => {
		const trade = await tradeService.createTrade(req.body);
		return res.json({ data: trade });
	});

	return router;
}
