import { USDC_MINT, USDT_MINT, WSOL_MINT } from "./constants";
import { YellowStoneClient } from "./grpc/client";
import {
  createSlotSubscription,
  createPingSubscription,
  createTokenSubscription,
} from "./grpc/createSubReqs";

async function main(): Promise<void> {
  const [type, token] = [process.argv[2]?.toLowerCase() || "slot", process.argv[3]?.toLowerCase()];

  const subs: Record<string, () => any> = {
    slot: createSlotSubscription,
    ping: createPingSubscription,
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

  const client = new YellowStoneClient();
  client.getVersion();
  await client.connect(factory());
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
