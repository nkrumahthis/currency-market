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

export interface IMessageProducer {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(topic: string, key:string, value:string): Promise<void>;
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