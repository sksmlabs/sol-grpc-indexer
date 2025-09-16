import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID ?? "sol-grpc-index",
    brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
    logLevel: logLevel.INFO
})

const topics = [
    {topic: process.env.KAFKA_TOPIC_TX!, numPartitions: 12, replicationFactor: 1},
    {topic: process.env.KAFKA_TOPIC_ACCT!, numPartitions: 12, replicationFactor: 1},
    {topic: process.env.KAFKA_TOPIC_BLOCK!, numPartitions: 6, replicationFactor: 1},
    {topic: process.env.KAFKA_TOPIC_LOG!, numPartitions: 12, replicationFactor: 1}
]

export async function ensureTopics() {
    const admin = kafka.admin();
    await admin.connect();
    try {
      await admin.createTopics({ topics, waitForLeaders: true });
    } finally {
      await admin.disconnect();
    }
}