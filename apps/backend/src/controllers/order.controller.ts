import OrderService from "@/services/order.service";
import { Router } from "express";

export default function OrderController(orderService: OrderService) {
	const router = Router();

	router.get("/", async (_, res) => {
		const orders = await orderService.getAll();
		res.json({ data: orders });
	});

	router.get("/:id", async(req, res) => {
		const order = await orderService.getById(req.params.id);
		res.json({ data: order });
	});

	router.post("/", async(req, res) => {
		const order = await orderService.create(req.body);
		res.status(201).json({ data: order });
	});

	router.put("/:id", async(req, res) => {
		const order = await orderService.updateStatus(req.params.id, req.body.status);
		res.status(200).json({ data: order });
	});

	return router;
}
