import { USDC_MINT, USDT_MINT, WSOL_MINT } from "./constants";
import { YellowStoneClient } from "./grpc/client";
import {
  createSlotSubscription,
  createPingSubscription,
  createTokenSubscription,
  createSolTransferSubscription,
} from "./grpc/subReqs";
import { ensureTopics } from "./kafka/admin";
import { processHighValueTransaction } from "./processing/proHighValTxn";


async function main(): Promise<void> {
  // 1) Make sure topics exist (idempotent)
  await retry(ensureTopics, { tries: 5, delayMs: 1000 });

  const client = new YellowStoneClient();

  const [type, token] = [process.argv[2]?.toLowerCase() || "slot", process.argv[3]?.toLowerCase()];

  const subs: Record<string, () => any> = {
    slot: createSlotSubscription,
    ping: createPingSubscription,
    sol: () => {
      // client.setOnData(processHighValueTransaction);
      return createSolTransferSubscription();
    },
    token: () => {
      const tokenMap: Record<string, string> = { usdt: USDT_MINT, usdc: USDC_MINT, wsol: WSOL_MINT };
      const mint = tokenMap[token!];
      if (!mint) {
        console.error("Usage: ts-node src/index.ts token [usdt|usdc|wsol]");
        process.exit(1);
      }
      return createTokenSubscription([mint]);
    },
  };

  const factory = subs[type];
  if (!factory) {
    console.error("Usage: ts-node src/index.ts [slot|ping|token <usdt|usdc|wsol>]");
    process.exit(1);
  }

  client.getVersion();
  await client.connect(factory());
}

type RetryOpts = { tries: number; delayMs: number };
async function retry<T>(fn: () => Promise<T>, { tries, delayMs }: RetryOpts): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, delayMs)); }
  }
  throw lastErr;
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
