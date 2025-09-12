import Client, { SubscribeRequest } from "@triton-one/yellowstone-grpc";
import { GRPC_ENDPOINT, GRPC_TOKEN } from "../config";


export class YellowStoneClient {
    private client: any;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxAttempts: number = 5;

    constructor() {
        const headers = 
            GRPC_TOKEN && GRPC_TOKEN?.trim() !== '' 
            ?  { 'x-token': GRPC_TOKEN } 
            : undefined;

        if (!GRPC_ENDPOINT) {
            throw new Error("GRPC_ENDPOINT is not set");
        }

        this.client = new Client(GRPC_ENDPOINT, GRPC_TOKEN, headers);
    }

    private async reconnect() {
        if (this.isConnected) return;

        if (this.reconnectAttempts >= this.maxAttempts) {
            console.error("Max reconnect attempts reached. Unable to connect to YellowStone.");
            process.exit(1);
        }
        
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect to YellowStone... (${this.reconnectAttempts}/${this.maxAttempts})`);
    }

    async subscribe(subReq: SubscribeRequest) {
        try {
            const stream = this.client.subscribe();
            this.isConnected = true;
            this.reconnectAttempts = 0;

        } catch (error) {
            console.error("Error subscribing to YellowStone:", error);
            throw error;
        }
    }
}