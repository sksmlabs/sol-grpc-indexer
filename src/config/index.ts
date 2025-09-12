import dotenv from "dotenv";

dotenv.config();

export const GRPC_ENDPOINT = process.env.GRPC_ENDPOINT;
export const GRPC_TOKEN = process.env.GRPC_TOKEN;