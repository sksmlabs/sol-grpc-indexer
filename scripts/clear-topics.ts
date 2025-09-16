import "dotenv/config";
import { Kafka } from "kafkajs";

async function clearTopics() {
  const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
    .split(",")
    .map(b => b.trim())
    .filter(Boolean);

  const topics = [
    process.env.KAFKA_TOPIC_TX    ?? "sol.txs",
    process.env.KAFKA_TOPIC_ACCT  ?? "sol.accounts",
    process.env.KAFKA_TOPIC_BLOCK ?? "sol.blocks",
    process.env.KAFKA_TOPIC_LOGS  ?? "sol.logs",
  ];

  console.log("Clearing topics with config:", { brokers, topics });

  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID ?? "clear-topics",
    brokers,
  });

  const admin = kafka.admin();
  await admin.connect();

  // delete
  await admin.deleteTopics({ topics });
  console.log("Deleted topics:", topics);

  await admin.disconnect();
}

clearTopics().catch(err => {
  console.error("Failed to clear topics:", err);
  process.exit(1);
});
