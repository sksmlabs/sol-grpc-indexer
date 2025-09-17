import { Kafka, logLevel } from "kafkajs";
import { logger } from "../../logs/log";
import { E } from "../../logs/log-events";

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID ?? "sol-grpc-index",
    brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
    logLevel: logLevel.INFO
})

const topics = [
    {topic: process.env.KAFKA_TOPIC_TX!, numPartitions: 12, replicationFactor: 1},
    {topic: process.env.KAFKA_TOPIC_ACCT!, numPartitions: 12, replicationFactor: 1},
    {topic: process.env.KAFKA_TOPIC_BLOCK!, numPartitions: 6, replicationFactor: 1},
    {topic: process.env.KAFKA_TOPIC_LOGS!, numPartitions: 12, replicationFactor: 1}
]

export async function ensureTopics() {
    const admin = kafka.admin();
    logger.info({event: E.KAFKA_ADMIN_CONNECT}, "Kafka admin connected");
    await admin.connect();
    try {
      const created = await admin.createTopics({ waitForLeaders: true, topics });
      if (created) {
        logger.info({event: E.KAFKA_ADMIN_TOPIC_CREATE, topics: topics.map(t => t.topic) }, "Kafka topics created");
      } else {
        logger.info({event: E.KAFKA_ADMIN_TOPIC_EXISTS, topics: topics.map(t => t.topic) }, "Kafka topics already exist");
      }
    } finally {
      await admin.disconnect();
    }
}