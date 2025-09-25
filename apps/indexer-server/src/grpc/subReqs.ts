import { CommitmentLevel, SubscribeRequest } from "@triton-one/yellowstone-grpc";

export function createSlotSubscription(): SubscribeRequest {
    return {
        slots: {
            'slot-updates': {},
        },
        accounts: {},
        transactions: {},
        blocks: {},
        blocksMeta: {},
        accountsDataSlice: [],
        entry: {},
        transactionsStatus: {},
        commitment: undefined,
        ping: undefined,
    }
}

export function createPingSubscription(): SubscribeRequest {
    return {
      slots: {},
      accounts: {},
      transactions: {},
      blocks: {},
      blocksMeta: {},
      accountsDataSlice: [],
      entry: {},
      transactionsStatus: {},
      commitment: undefined,
      ping: { id: 1 },
    };
  }

export function createTokenSubscription(tokenMints: string[]): SubscribeRequest {
    return {
        slots: {},
        accounts: {
            'token-accounts': {
                account: tokenMints,
                owner: [],
                filters: [],
            },
        },
        transactions: {
            'token-transfers': {
                vote: false,
                failed: false,
                signature: undefined,
                accountInclude: [],
                accountExclude: [],
                accountRequired: [],
            },
        },
        blocks: {},
        blocksMeta: {},
        entry: {},
        accountsDataSlice: [],
        transactionsStatus: {},
        commitment: undefined,
        ping: undefined,
    };
}

export function createSolTransferSubscription(): SubscribeRequest {
    return {
        slots: {},
        accounts: {},
        transactions: {
          client: {
            accountInclude: ["11111111111111111111111111111111"], // System Program
            accountExclude: [],
            accountRequired: [],
            vote: false,
            failed: false,
          }
        },
        blocks: {},
        blocksMeta: {},
        entry: {},
        accountsDataSlice: [],
        transactionsStatus: {},
        commitment: CommitmentLevel.CONFIRMED,
        ping: undefined,
    };
}