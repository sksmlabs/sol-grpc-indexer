import { SubscribeUpdate, SubscribeUpdateTransactionInfo } from "@triton-one/yellowstone-grpc";

export class ProcessData {
    async processTransaction(data: SubscribeUpdate) {
        console.log(data);
        if (!data.transaction?.transaction) return;
        const transaction: SubscribeUpdateTransactionInfo = data.transaction?.transaction;
        const slot = BigInt(data?.transaction.slot);
        

        if (!transaction) {
            console.error('Transaction is undefined');
            return;
        }
        const signature = (transaction as any).signature;
        
        // const blockTime = transaction.blockTime ? new Date(transaction.blockTime * 1000) : null;
        // console.log(slot);

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
}