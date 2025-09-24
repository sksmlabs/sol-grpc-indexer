// src/kafka/producer.ts
import { Kafka, logLevel, Producer, Message } from "kafkajs";

export class KafkaProducer {
  private producer: Producer | null = null;
  private readonly clientId: string;
  private readonly brokers: string[];

  constructor(
    clientId: string = process.env.KAFKA_CLIENT_ID ?? "sol-grpc-indexer",
    brokers: string[] = (process.env.KAFKA_BROKERS ?? "localhost:29092").split(",")
  ) {
    this.clientId = clientId;
    this.brokers = brokers;
    this.connect();
  }

  /** Initialize and connect the producer */
  async connect(): Promise<Producer> {
    if (this.producer) return this.producer;

    const kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
      logLevel: logLevel.NOTHING,
    });

    this.producer = kafka.producer({
      idempotent: true,
      // tuning knobs if needed:
      // maxInFlightRequests: 5,
      // retry: { retries: 8, initialRetryTime: 100 },
    });

    await this.producer.connect();
    return this.producer;
  }

  /** Publish a single message */
  async publish(topic: string, key: string, value: unknown) {
    const p = await this.connect();
    const msg: Message = {
      key,
      value: Buffer.from(JSON.stringify(value)),
    };
    await p.send({ topic, messages: [msg] });
  }

  /** Publish multiple messages in a batch */
  async publishBatch(topic: string, kvs: { key: string; value: unknown }[]) {
    if (!kvs.length) return;
    const p = await this.connect();
    await p.send({
      topic,
      messages: kvs.map(({ key, value }) => ({
        key,
        value: Buffer.from(JSON.stringify(value)),
      })),
    });
  }

  /** Graceful shutdown */
  async disconnect() {
    if (this.producer) {
      await this.producer.disconnect().catch(() => void 0);
      this.producer = null;
    }
  }
}
