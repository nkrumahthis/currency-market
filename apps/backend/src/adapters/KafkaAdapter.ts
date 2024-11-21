import { MessageConsumer, MessageProducer } from "@/types";
import Kafka from "kafkajs";

export class KafkaProducer implements MessageProducer {
    private producer: Kafka.Producer;

    constructor(kafka: Kafka.Kafka) {
        this.producer = kafka.producer();
    }

    async connect(): Promise<void> {
        await this.producer.connect();
    }

    async disconnect(): Promise<void> {
        await this.producer.disconnect();
    }

    async send(topic: string, key: string, value: string): Promise<void> { 
        await this.producer.send({
            topic,
            messages: [{ key, value }],
        });
    }
}

export class KafkaConsumer implements MessageConsumer {
    private consumer: Kafka.Consumer;

    constructor(kafka: Kafka.Kafka, groupId: string) {
        this.consumer = kafka.consumer({ groupId });
    }

    async connect(): Promise<void> {
        await this.consumer.connect();
    }

    async disconnect(): Promise<void> {
        await this.consumer.disconnect();
    }

    async subscribe(topic: string, fromBeginning?: boolean): Promise<void> {
        await this.consumer.subscribe({ topic, fromBeginning });
    }

    async onMessage(handler: (message: any) => Promise<void>): Promise<void> {
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                await handler(message);
            },
        });
    }
}