import Client, { SubscribeRequest, SubscribeUpdate } from "@triton-one/yellowstone-grpc";
import { GRPC_ENDPOINT } from "../config";
import { Millis } from "../types";
import { ProcessData } from "../processing";

export enum ClientState {
  Idle = "idle",
  Connecting = "connecting",
  Connected = "connected",
  BackingOff = "backing_off",
  Closed = "closed",
}

export class YellowStoneClient {
    private client: Client;
    private stream: any;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts = 10;
    private readonly reconnectDelay: Millis = 1000; // 1 second
    private maxAttempts: number = 5;
    private state: ClientState = ClientState.Idle;

    private processor = new ProcessData();

    constructor(
        private endpoint: string | undefined = GRPC_ENDPOINT,
        private onData?: (data: any) => void,
        private onError?: (error: any) => void
    ) {
        if (!this.endpoint) {
            throw new Error("GRPC_ENDPOINT is not set");
        }

        this.client = new Client(this.endpoint, undefined, undefined);
    }

    public async getVersion() {
        const version = await this.client.getVersion(); // gets the version information
        console.log(version);
    }

    public get connectionState(): ClientState {
        return this.state;
    }

    public getReconnectAttempts(): number {
        return this.reconnectAttempts;
    }

    async connect(subReq: SubscribeRequest) {
        // Avoid parallel connects
        if (this.state === ClientState.Connected || this.state === ClientState.Connecting) return;
        
        this.state = ClientState.Connecting;

        try {
            console.log(`Connecting to ${this.endpoint}...`);
            this.stream = await this.client.subscribe();
            this.state = ClientState.Connected;
            this.reconnectAttempts = 0;

            // Setup Event Handlers
            await this.setupStreamHandlers(subReq);

            // Send subscription request
            await this.sendSubscription(subReq);

        } catch (error) {
            console.error("Error subscribing to YellowStone:", error);
            // handle reconnection
            throw error;
        }
    }

    private async reconnect(subReq: SubscribeRequest) {
        if (this.state == ClientState.Connected) return;

        if (this.reconnectAttempts >= this.maxAttempts) {
            console.error("Max reconnect attempts reached. Unable to connect to YellowStone.");
            process.exit(1);
        }
        
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect to YellowStone... (${this.reconnectAttempts}/${this.maxAttempts})`);

        const delay = this.reconnectDelay * Math.pow(2, Math.min(this.reconnectAttempts - 1, 5));
    
        console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
        
        setTimeout(() => {
        this.connect(subReq).catch(console.error);
        }, delay);
    }

    disconnect(): void {
        if (this.stream) this.stream.end();
        // this.client.close();
        this.state = ClientState.Closed;
    }

    private setupStreamHandlers(subReq: SubscribeRequest) {
        // Set up event handlers
        this.stream.on("data", this.handleData.bind(this));
        this.stream.on("error", this.handleStreamError.bind(this));
        this.stream.on("end", () => this.handleDisconnect(subReq));
        this.stream.on("close", () => this.handleDisconnect(subReq));
    }

    private async sendSubscription(
        subReq: SubscribeRequest
      ): Promise<void> {
        return new Promise((resolve, reject) => {
          this.stream.write(subReq, (error: any) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      }

    private async handleData(data: SubscribeUpdate): Promise<void> {
        try {
          if (data.transaction) {
            this.processor.processTransaction(data);
          }
    
          if (data.account) {
            this.processor.processAccount(data);
          }
    
          if (data.slot) {
            console.log(data);
          }
    
          if (data.block) {
            console.log(`Block update: ${data.block.blockhash}`, {
              slot: data.block.slot,
              blockHeight: data.block.blockHeight,
            });
          }
        } catch (error) {
          console.error('Error processing update', error);
        }
      }

    private handleStreamError(error: any): void {
        console.error("Stream error:", error);
        this.state = ClientState.Closed;
        if (this.onError) this.onError(error);
      }
    
    private async handleDisconnect(subReq: SubscribeRequest): Promise<void> {
    if (this.state = ClientState.Connected) {
        console.log("Stream disconnected, attempting to reconnect...");
        this.state = ClientState.Closed;
        await this.reconnect(subReq);
    }
    }
}