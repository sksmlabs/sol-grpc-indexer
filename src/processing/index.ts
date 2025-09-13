import { SubscribeUpdate, SubscribeUpdateTransactionInfo } from "@triton-one/yellowstone-grpc";
import * as bs58 from 'bs58';
import { db } from "../db";

export class ProcessData {

    private processBuffers(obj: any): any {
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

    async processTransaction(data: SubscribeUpdate) {

        // Convert buffers to readable format
        const processedData = this.processBuffers(data);

        if (!data.transaction?.transaction) return;
        const txnInfo: SubscribeUpdateTransactionInfo = processedData.transaction?.transaction;
        const slot = BigInt(processedData?.transaction.slot);
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
}