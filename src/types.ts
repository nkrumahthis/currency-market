export type Order = {
	id: string;
	side: "buy" | "sell";
	price: number;
	amount: number;
	timestamp: number;
};

export type Trade = {
	buyOrderId: string;
	sellOrderId: string;
	price: number;
	amount: number;
	timestamp: number;
};