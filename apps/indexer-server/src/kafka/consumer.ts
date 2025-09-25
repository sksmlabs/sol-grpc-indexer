import { Consumer, EachMessagePayload, Kafka, logLevel } from "kafkajs";
import { logger } from "../logs/log";
import { E } from "../logs/log-events";
import zlib from "zlib";

type SubscribeOptions = {
    topic: string;             // one or many topics
    groupId: string;              // must be set per consumer
    fromBeginning?: boolean;      // default false
    /**
   * Handler receives the parsed message value (JSON if possible),
   * plus the raw Kafka payload if you need offsets/headers.
   */
    handler: (data: any, ctx: EachMessagePayload) => Promise<void> | void;
};

/** Best-effort decode: JSON (plain), JSON (gzipped), else return Buffer/string */
function decodeMessageValue(value: Buffer | null): any {
    if (!value) return null;
  
    // try plain UTF-8 JSON
    try {
      const s = value.toString("utf8");
      if (s.length && (s[0] === "{" || s[0] === "[")) {
        return JSON.parse(s);
      }
    } catch {/* fall through */}
  
    // try gzipped JSON (magic bytes 1F 8B)
    if (value.length > 2 && value[0] === 0x1f && value[1] === 0x8b) {
      try {
        const unz = zlib.gunzipSync(value);
        return JSON.parse(unz.toString("utf8"));
      } catch {/* fall through */}
    }
  
    // not JSON → return as string if printable, else Buffer
    const asStr = value.toString("utf8");
    return /^[\x09\x0A\x0D\x20-\x7E]+$/.test(asStr) ? asStr : value;
  }
  
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

    async subscribe({ topic, groupId, fromBeginning = false, handler}: SubscribeOptions): Promise<void> {
        let consumer = this.consumers.get(groupId);
        if (!consumer) {
            consumer = this.kafka.consumer({ groupId });
            await consumer.connect();
            this.consumers.set(groupId, consumer);
        }

        await consumer.subscribe({ topic, fromBeginning });

        await consumer.run({eachMessage: async(payload: EachMessagePayload) => {
            const { message } = payload;
            const parsed = decodeMessageValue(message.value);
            await handler(parsed, payload)
        }});
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