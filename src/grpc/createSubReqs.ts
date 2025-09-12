import { SubscribeRequest } from "@triton-one/yellowstone-grpc";

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
            accountSubscribe: {
                account: tokenMints,
                owner: [],
                filters: []
              }
        },
        transactions: {},
        blocks: {},
        blocksMeta: {},
        entry: {},
        accountsDataSlice: [],
        transactionsStatus: {},
        commitment: undefined,
        ping: undefined,
    };
}