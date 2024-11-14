export type Order = {
	id: string;
	side: "buy" | "sell";
	price: number;
	amount: number;
	timestamp: number;
    userId: string;
    currency: string;
};

export type Trade = {
    buyerId: string;
	buyOrderId: string;
    sellerId: string;
	sellOrderId: string;
	price: number;
	amount: number;
    sellCurrency: string;
    buyCurrency: string;
	timestamp: number;
};