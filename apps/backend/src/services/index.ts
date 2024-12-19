import AuthService from "@/services/auth.service";
import TradeService from "@/services/trade.service";
import UserService from "@/services/user.service";
import OrderService from "@/services/order.service";
import RateService from "@/services/rate.service";
import InvoiceService from "@/services/invoice.service";
import { Repositories } from "@/repositories";
import { IMatchingEngine } from "@/domain/MatchingEngine";

export interface Services {
	auth: AuthService;
	trade: TradeService;
	order: OrderService;
	user: UserService;
	rate: RateService;
	invoice: InvoiceService;
}
export default function Services(
	repos: Repositories,
	matchingEngine: IMatchingEngine
): Services {
	const orderService = new OrderService(repos.order, matchingEngine);
	orderService.initializeEngine();
	return {
		auth: new AuthService(repos.user),
		trade: new TradeService(repos.trade, matchingEngine),
		order: orderService,
		user: new UserService(repos.user),
		rate: new RateService(repos.rate),
		invoice: new InvoiceService(repos.invoice, orderService),
	};
}
