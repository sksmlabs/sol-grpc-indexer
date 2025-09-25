import { SubscribeRequest, SubscribeUpdate, SubscribeUpdateTransactionInfo } from "@triton-one/yellowstone-grpc";
import * as bs58 from 'bs58';
import { db } from "../db";
import { KafkaConsumer } from "../kafka/consumer";

export class ProcessData {

    public processBuffers(obj: any): any {
        if (!obj) return obj;
        
        if (Buffer.isBuffer(obj) || obj instanceof Uint8Array) {
          return bs58.default.encode(obj);
        }
        
        if (Array.isArray(obj)) {
          return obj.map(item => this.processBuffers(item));
        }
        
        if (typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, this.processBuffers(v)])
          );
        }
        
        return obj;
    }

    async processData(data: SubscribeUpdate) {
      if (data.transaction) {
        this.processTransaction(data);
      }

      if (data.account) {
        this.processAccount(data);
      }

      if (data.slot) {
        this.processSlot(data);
      }

      if (data.block) {
        console.log(`Block update: ${data.block.blockhash}`, {
          slot: data.block.slot,
          blockHeight: data.block.blockHeight,
        });
      }
    }

    async processTransaction(data: any) {

        if (!data.transaction?.transaction) return;
        const txnInfo: SubscribeUpdateTransactionInfo = data.transaction?.transaction;
        const slot = BigInt(data?.transaction.slot);
        const signature = (txnInfo as any).signature;
        const success = !txnInfo?.meta?.err;
        const fee = txnInfo.meta?.fee ? BigInt(txnInfo.meta?.fee) : null;
        // const blockTime = txnInfo.blockTime

        const accounts = txnInfo.transaction?.message?.accountKeys || [];
        const recentBlockhash = txnInfo.transaction?.message?.recentBlockhash;

        console.log(slot, signature, success, fee, accounts, recentBlockhash);
        
        await db.client.transaction.create(
          {
            data: {
              signature: signature,
              slot,
              success,
              fee,
            }
          }
        )

    }

    async processAccount(data: SubscribeUpdate) {
        try {
            if (!data.account) return; // exit early if undefined
            // const pubkey = data.account.pubkey.toString();
            // console.log("Account pubkey:", pubkey);
          } catch (error) {
            console.error("Error processing account", error);
          }
    }

    async processSlot(data: SubscribeUpdate) {
      try {
        if (!data.slot) return; // exit early if undefined
        const { slot, parent } = data?.slot;

        await db.client.slotUpdate.upsert({
          where: { slot },
          update: {
            parent: parent ?? null
          },
          create: {
            slot,
            parent: parent ?? null
          }
        })
      } catch (error) {
        console.error("Error processing account", error);
      }
      
    }

    async processHighValueTransaction(data: any): Promise<void> {
      if (data.meta) {
        const preBalances = data.meta.preBalances || [];
        const postBalances = data.meta.postBalances || [];
        
        // Calculate largest balance change
        let maxChange = 0;
        preBalances.forEach((preBalance: number, index: number) => {
          const postBalance = postBalances[index] || 0;
          const change = Math.abs(postBalance - preBalance);
          maxChange = Math.max(maxChange, change);
        });
        
        // Only log transactions with > 10 SOL moved
        const changeInSOL = maxChange / 1e9;
        if (changeInSOL > 5) {
          await db.client.tokenTransfer.create(
            {
              data: {
                signature: data.signature,
                tokens: maxChange,
                fee: data.meta.fee,
                accounts: data.accounts
              }
            }
          )
        } else {
          console.log("Change in sol is less than 10", changeInSOL);
        }
      }
}

}

(async () => {
  const manager = new ProcessData();
  const consumer = new KafkaConsumer();

  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC_TX ?? "tx-stream",
    groupId: process.env.KAFKA_GROUP_ID ?? "high-value-group",
    handler: manager.processHighValueTransaction,
  });

  process.on("SIGINT", async () => {
    await consumer.stopAll();
    db.disconnect();
    process.exit(0);
  });
})();