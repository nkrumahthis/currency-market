import TradeRepository from "@/repositories/trade.repository";
import UserRepository from "@/repositories/user.repository";
import OrderRepository from "@/repositories/order.repository";
import RateRepository from "@/repositories/rate.repository";
import InvoiceRepository from "@/repositories/invoice.repository";

export interface Repositories {
	trade: TradeRepository;
	order: OrderRepository;
	user: UserRepository;
	rate: RateRepository;
	invoice: InvoiceRepository;
}

export default function Repositories(): Repositories {
	return {
		trade: new TradeRepository(),
		order: new OrderRepository(),
		user: new UserRepository(),
		rate: new RateRepository(),
		invoice: new InvoiceRepository(),
	};
}
