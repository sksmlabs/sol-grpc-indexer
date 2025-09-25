#!/usr/bin/env ts-node
import "dotenv/config";
import { Kafka } from "kafkajs";
import readline from "readline";

async function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}

async function clearTopics() {
  const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
    .split(",")
    .map(b => b.trim())
    .filter(Boolean);

  const topics: string[] = [
    process.env.KAFKA_TOPIC_TX,
    process.env.KAFKA_TOPIC_ACCT,
    process.env.KAFKA_TOPIC_BLOCK,
    process.env.KAFKA_TOPIC_LOGS,
  ].filter((t): t is string => typeof t === "string" && t.trim().length > 0);

  console.log("⚠️  You are about to delete these topics:", topics);
  console.log("Using brokers:", brokers);

  const confirmed = await askConfirmation("Proceed with deletion? (y/n): ");
  if (!confirmed) {
    console.log("❌ Aborted by user.");
    process.exit(0);
  }

  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID ?? "clear-topics",
    brokers,
  });

  const admin = kafka.admin();
  await admin.connect();

  await admin.deleteTopics({ topics });
  console.log("✅ Deleted topics:", topics);

  await admin.disconnect();
}

clearTopics().catch(err => {
  console.error("Failed to clear topics:", err);
  process.exit(1);
});
