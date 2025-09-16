import { SubscribeUpdate, SubscribeUpdateTransaction, SubscribeUpdateTransactionInfo } from "@triton-one/yellowstone-grpc";
import { Transaction } from "@triton-one/yellowstone-grpc/dist/types/grpc/solana-storage";

export class SerializeData {
    
    private serializeTx(u: SubscribeUpdate) {
        const t: SubscribeUpdateTransaction = u.transaction!; // wrapper
        const tInfo: SubscribeUpdateTransactionInfo = t.transaction!; // detailed transaction info
        const txn: Transaction = tInfo.transaction!;
        
        return {
          signature: Buffer.from(tInfo.signature).toString("hex"),
          slot: Number(t.slot),
          block_time: new Date(Number(t.block_time ?? 0) * 1000).toISOString(),
          success: Number(tInfo.meta?.err ? 0 : 1),
          fee: Number(tInfo.meta?.fee ?? 0),
          cu_consumed: Number(tInfo.meta?.computeUnitsConsumed ?? 0),
          signer_count: Number(txn.message?.header?.numRequiredSignatures ?? 0),
          program_ids: (((tInfo.meta as any)?.loaded_addresses?.writable) ?? []).map((b: any) => b.toString()),
          accounts: (txn.message?.accountKeys ?? []).map((k: any) => Buffer.from(k).toString("hex")),
          ix_count: txn.message?.instructions?.length ?? 0,
          commitment: u.commitment ?? "confirmed",
          raw: tInfo.raw ? Buffer.from(tInfo.raw).toString("base64") : undefined,
        };
    }
      
      private serializeAccount(u: SubscribeUpdate) {
        const a = u.account!;
        return {
          pubkey: a.pubkey?.toString() ?? "",
          write_version: Number(a.write_version ?? 0),
          slot: Number(a.slot ?? 0),
          owner: a.account?.owner?.toString() ?? "",
          lamports: Number(a.account?.lamports ?? 0),
          executable: Number(a.account?.executable ? 1 : 0),
          rent_epoch: Number(a.account?.rent_epoch ?? 0),
          data_b64: Buffer.from(a.account?.data ?? new Uint8Array()).toString("base64"),
          commitment: u.commitment ?? "confirmed",
        };
      }
      
      private serializeBlock(u: SubscribeUpdate) {
        const b = u.block!;
        return {
          slot: Number(b.slot),
          block_time: new Date(Number(b.block_time) * 1000).toISOString(),
          parent_slot: Number(b.parent_slot),
          commitment: u.commitment ?? "confirmed",
        };
      }
      
      private *serializeLogs(u: SubscribeUpdate) {
        const logs = u.logs!;
        const signature = Buffer.from(logs.signature).toString("hex");
        const slot = Number(logs.slot);
        const commitment = u.commitment ?? "confirmed";
        for (let ix = 0; ix < (logs.instructions?.length ?? 0); ix++) {
          const ixLogs = logs.instructions![ix]?.logs ?? [];
          for (let li = 0; li < ixLogs.length; li++) {
            yield {
              signature,
              ix_index: ix,
              log_index: li,
              message: ixLogs[li],
              slot,
              commitment,
            };
          }
        }
      }
}