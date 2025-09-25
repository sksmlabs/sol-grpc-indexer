#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const kafkajs_1 = require("kafkajs");
const readline_1 = __importDefault(require("readline"));
async function askConfirmation(question) {
    const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
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
    const topics = [
        process.env.KAFKA_TOPIC_TX,
        process.env.KAFKA_TOPIC_ACCT,
        process.env.KAFKA_TOPIC_BLOCK,
        process.env.KAFKA_TOPIC_LOGS,
    ].filter((t) => typeof t === "string" && t.trim().length > 0);
    console.log("⚠️  You are about to delete these topics:", topics);
    console.log("Using brokers:", brokers);
    const confirmed = await askConfirmation("Proceed with deletion? (y/n): ");
    if (!confirmed) {
        console.log("❌ Aborted by user.");
        process.exit(0);
    }
    const kafka = new kafkajs_1.Kafka({
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
//# sourceMappingURL=clear-topics.js.map