import {Kafka, logLevel, Producer, Message} from "kafkajs";

let producer : Producer | null = null;

export async function getProducer() {
    if (producer) return producer;
    const kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID ?? "sol-grpc-indexer",
        brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
        logLevel: logLevel.NOTHING,
    })

    producer = kafka.producer({
        idempotent: true,
        // tuning:
        // maxInFlightRequests: 5, // defaults safe for idempotence
        // retry: { retries: 8, initialRetryTime: 100 },
    })
    await producer.connect();
    return producer;
}

export async function publish(topic: string, key: string, value: unknown) {
    const p = await getProducer();
    const msg : Message = {key, value: Buffer.from(JSON.stringify(value))};
    await p.send({topic, messages: [msg]});
}

export async function publishBatch(topic: string, kvs: { key: string; value: unknown }[]) {
    if (!kvs.length) return;
    const p = await getProducer();
    await p.send({
      topic,
      messages: kvs.map(({ key, value }) => ({ key, value: Buffer.from(JSON.stringify(value)) })),
    });
}
  
export async function shutdownProducer() {
    if (producer) await producer.disconnect().catch(() => void 0);
}