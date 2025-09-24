// ---- bootstrap runner (single file script use) ----
import { SubscribeUpdate } from "@triton-one/yellowstone-grpc";
import { KafkaConsumer } from "../src/kafka/consumer";
import { ProcessData } from "../src/processing";
import { db } from "../src/db";

(async () => {
  const manager = new ProcessData();
  const consumer = new KafkaConsumer();

  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC_TX ?? "tx-stream",
    groupId: process.env.KAFKA_GROUP_ID ?? "high-value-group",
    fromBeginning: false,
    handler: async (parsed /* data */, ctx) => {
      // If your producers push Yellowstone SubscribeUpdate JSON,
      // you can do BOTH: persist + detect HV transfers.
      try {
        // Persist minimal rows
        // await manager.processData(parsed as SubscribeUpdate);
        // Log big transfers
        await manager.processHighValueTransaction(parsed);
      } catch (e) {
        console.error("Handler error:", e, {
          topic: ctx.topic,
          partition: ctx.partition,
          offset: ctx.message.offset,
        });
      }
    },
  });

  process.on("SIGINT", async () => {
    try {
      await consumer.stopAll();
      await db.disconnect();
    } finally {
      process.exit(0);
    }
  });
})();