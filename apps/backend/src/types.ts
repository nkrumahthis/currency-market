export interface Order {
	id: string;
	side: "buy" | "sell";
	price: number;
	amount: number;
	timestamp: number;
	userId: string;
	baseCurrency: string;
    quoteCurrency: string;
};

export interface BankDetails {
    recipentName: string;
    bankName: string;
    accountNumber: number;
    swift: string;
}

export interface Invoice {
    filePath: string;
}

export interface Transaction {
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

export interface NewOrderRequest {
	side: "buy" | "sell";
	price: number;
	amount: number;
    baseCurrency: string;
	quoteCurrency: string;
	userId?: string;
};

export interface Trade {
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

export interface OrderBook {
	bids: { price: number; amount?: number; amounts?: number[]; quoteCurrency: string }[];
	asks: { price: number; amount?: number; amounts?: number[]; quoteCurrency: string }[];
	
}

export interface MessageProducer {
	connect: () => Promise<void>;
	disconnect: () => Promise<void>;
	send: (topic: string, key: string, value: string) => Promise<void>;
}

export interface MessageConsumer {
	connect: () => Promise<void>;
	disconnect: () => Promise<void>;
	subscribe: (topic: string, fromBeginning?: boolean) => Promise<void>;
	onMessage: (handler: (messageCommand: { topic: string; partition: string; message: any; }) => Promise<void>) => Promise<void>;
}

export interface TradeIdGenerator {
	generate: () => Promise<string>;
}
