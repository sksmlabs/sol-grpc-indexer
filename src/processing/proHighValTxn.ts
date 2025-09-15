export function processHighValueTransaction(data: any): void {
      if (data.transaction?.transaction?.meta) {
        const tx = data.transaction.transaction;
        const preBalances = tx.meta.preBalances || [];
        const postBalances = tx.meta.postBalances || [];
        
        // Calculate largest balance change
        let maxChange = 0;
        preBalances.forEach((preBalance: number, index: number) => {
          const postBalance = postBalances[index] || 0;
          const change = Math.abs(postBalance - preBalance);
          maxChange = Math.max(maxChange, change);
        });
        
        // Only log transactions with > 10 SOL moved
        const changeInSOL = maxChange / 1e9;
        if (changeInSOL > 10) {
          console.log(`\n💰 High-Value Transaction:`);
          // console.log(`  Signature: ${tx.signature}`);
          console.log(`  Slot: ${data.transaction.slot}`);
          console.log(`  Max SOL Transfer: ${changeInSOL.toFixed(2)} SOL`);
          console.log(`  Fee: ${tx.meta.fee / 1e9} SOL`);
          console.log(`  Accounts: ${tx.transaction?.message?.accountKeys?.length || 0}`);
        }
      }
}