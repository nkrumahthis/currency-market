import { Router } from "express";
import AuthController from "@/controllers/auth.controller";
import TradeController from "@/controllers/trade.controller";
import UserController from "@/controllers/user.controller";
import OrderController from "@/controllers/order.controller";
import RateController from "@/controllers/rate.controller";
import InvoiceController from "@/controllers/invoice.controller";

import type { Services } from "@/services";

export interface Controllers {
	auth: Router;
	trade: Router;
	order: Router;
	user: Router;
	rate: Router;
	invoice: Router;
}

export default function Controllers(services: Services): Controllers {
	return {
		auth: AuthController(services.auth),
		trade: TradeController(services.trade),
		order: OrderController(services.order),
		user: UserController(services.user),
		rate: RateController(services.rate),
		invoice: InvoiceController(services.invoice),
	};
}
