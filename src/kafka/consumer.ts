import { Consumer, Kafka, logLevel } from "kafkajs";

type SubscribeOptions = {
    topic: string;             // one or many topics
    groupId: string;              // must be set per consumer
    fromBeginning?: boolean;      // default false
};
  
export class KafkaConsumer {
    private readonly kafka: Kafka;
    private consumers: Map<string, Consumer>;
    private readonly clientId: string;
    private readonly brokers: string[];

    constructor(
        clientId: string = process.env.KAFKA_CLIENT_ID ?? "sol-grpc-indexer",
        brokers: string[] = (process.env.KAFKA_BROKERS ?? "localhost:29092").split(",")
    ) {
        this.clientId = clientId;
        this.brokers = brokers;
        this.kafka = new Kafka({
            clientId: this.clientId,
            brokers: this.brokers,
            logLevel: logLevel.INFO
        })
        this.consumers = new Map();
    }

    async subscribe({ topic, groupId, fromBeginning = false}: SubscribeOptions): Promise<void> {
        let consumer = this.consumers.get(groupId);
        if (!consumer) {
            consumer = this.kafka.consumer({ groupId });
            await consumer.connect();
            this.consumers.set(groupId, consumer);
        }

        await consumer.subscribe({ topic, fromBeginning });
    }

    /**
     * Gracefully disconnect and remove a specific consumer (by groupId).
     */
    async stop(groupId: string): Promise<void> {
        const consumer = this.consumers.get(groupId);
        if (!consumer) return;
        try {
        await consumer.disconnect();
        } finally {
        this.consumers.delete(groupId);
        }
    }

    /**
     * Gracefully disconnect all consumers.
     */
    async stopAll(): Promise<void> {
        const stops = Array.from(this.consumers.values()).map((c) => c.disconnect().catch(() => {}));
        await Promise.all(stops);
        this.consumers.clear();
    }

}