export type Order = {
	id: string;
	side: "buy" | "sell";
	price: number;
	amount: number;
	timestamp: number;
	userId: string;
	baseCurrency: string;
    quoteCurrency: string;
};

export type BankDetails = {
    recipentName: string;
    bankName: string;
    accountNumber: number;
    swift: string;
}

export type Invoice = {
    filePath: string;
}

export type Transaction = {
    id: string;
    timestamp: number;
    sellOrderId?: string;
    buyOrderId?: string;
    sellOrders?: Order[];
    buyOrder?: Order;
    baseCurrency: string;
    quoteCurrency: string;
    userId: string;
    recipientAmount: number;
    recipientCurrency: string;
    senderAmount: number;
    senderCurrency: string;
    invoice: Invoice;
    bankDetails: BankDetails;
}

export type NewOrderRequest = {
	side: "buy" | "sell";
	price: number;
	amount: number;
    baseCurrency: string;
	quoteCurrency: string;
	userId?: string;
};

export type Trade = {
	buyerId: string;
	buyOrderId: string;
	sellerId: string;
	sellOrderId: string;
	price: number;
	amount: number;
	baseCurrency: string;
	quoteCurrency: string;
	timestamp: number;
};

export type OrderBookFull = {
	asks: { price: number; amounts: number[]; quoteCurrency: string }[];
	bids: { price: number; amounts: number[]; quoteCurrency: string }[];
};

export type OrderBookSummary = {
	asks: { price: number; amount: number; quoteCurrency: string }[];
	bids: { price: number; amount: number; quoteCurrency: string }[];
};

export interface IMessageProducer {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	send(topic: string, key: string, value: string): Promise<void>;
}

export interface IMessageConsumer {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	subscribe(topic: string, fromBeginning?: boolean): Promise<void>;
	onMessage(handler: (message: any) => Promise<void>): Promise<void>;
}

export interface ITradeIdGenerator {
	generate(): Promise<string>;
}
