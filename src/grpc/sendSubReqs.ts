import type { ClientDuplexStream } from "@grpc/grpc-js";
import type { SubscribeRequest, SubscribeUpdate } from "@triton-one/yellowstone-grpc";

export function sendSubscribeRequests(
    stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>, 
    request: SubscribeRequest
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        stream.write(request, (err: Error | null) => {
            if (err) reject(err);
            else resolve();
        });       
    });
}