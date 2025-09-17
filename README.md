# Solana Yellowstone gRPC Indexer

[![Star this repo](https://img.shields.io/badge/⭐_Star-This_repo-lightgrey?style=flat)](https://github.com/sksmlabs/sol-grpc-indexer)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Kafka](https://img.shields.io/badge/Kafka-231F20?style=flat&logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat&logo=solana&logoColor=white)](https://solana.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript-based Solana blockchain indexer that connects to Yellowstone gRPC endpoints to stream and process real-time blockchain data including transactions, accounts, and slot updates. It publishes processed data to Kafka, with structured logging and secure env validation.

## Features

- 🔄 **Real-time Data Streaming**: Connect to Yellowstone gRPC endpoints for live Solana data
- 📊 **Multiple Subscription Types**: Support for slot updates, SOL transfers, token accounts, and ping subscriptions
- 🛠️ **TypeScript Support**: Fully typed with comprehensive error handling
- 🔧 **Buffer Processing**: Automatic conversion of binary data to readable formats using bs58 encoding
- 📈 **Transaction Processing**: Extract transaction details including signatures, fees, and account keys
- 🏗️ **Modular Architecture**: Clean separation of concerns with dedicated modules for gRPC client, processing, and configuration
-. **Kafka Integration**: Topic bootstrap, idempotent creation, and producers
-. **Structured Logging**: Pino-based logs with redaction and pretty output in dev

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Access to a Yellowstone gRPC endpoint

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sksmlabs/sol-grpc-indexer.git
cd sol-grpc-indexer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
GRPC_ENDPOINT=your_yellowstone_grpc_endpoint
GRPC_TOKEN=your_grpc_token_if_required
```

## Usage

### Available Commands

- **Slot Updates**: Stream slot information
```bash
npm run dev slot
```

- **Ping Subscription**: Test connection with ping
```bash
npm run dev ping
```

- **SOL Transfer Stream**: Stream transactions that include System Program
```bash
npm run dev sol
```

- **Token Account Monitoring**: Monitor specific token accounts
```bash
npm run dev token usdt  # Monitor USDT
npm run dev token usdc  # Monitor USDC
npm run dev token wsol  # Monitor Wrapped SOL
```

### Production build
```bash
npm run build
npm start
```

### Docker helpers (optional)
```bash
npm run docker:up      # start docker-compose stack
npm run docker:down    # stop
npm run docker:rebuild # rebuild and start
```

## Configuration

The indexer supports various configuration options:

- **GRPC_ENDPOINT**: Yellowstone gRPC server endpoint
- **GRPC_TOKEN**: Authentication token (if required)
- **LOG_LEVEL**: Logger level (default: debug in dev, info in prod)
- **NODE_ENV**: Set to `production` to enable JSON logs and disable pretty transport
- **Supported Tokens**: USDT, USDC, WSOL (easily extensible)

On startup, required env vars are validated and the app exits with a clear error if missing.

## Data Processing

The indexer processes various types of Solana data:

### Transaction Processing
- Extracts transaction signatures
- Processes account keys and recent blockhashes
- Calculates transaction fees and success status
- Converts binary data to readable formats

### Account Processing
- Monitors account changes
- Extracts public keys and account data
- Handles account state updates

## Reliability & Security

- Comprehensive error handling for gRPC connections
- Exponential backoff on reconnect attempts
- Sensitive fields are redacted from logs (tokens, passwords, secrets)
- Input is normalized (buffers encoded) prior to processing/publishing
- Graceful exits with non-zero code when unrecoverable

## Project Structure

```
src/
├── config/           # Env loading, validation, secure config
├── constants/        # Application constants (token mints, etc.)
├── grpc/             # gRPC client and subscription management
│   ├── client.ts     # Main gRPC client implementation
│   └── subReqs.ts    # Subscription request builders
├── kafka/            # Kafka admin and producers
│   ├── admin.ts
│   └── producer.ts
├── processing/       # Data processing and transformation
│   ├── index.ts      # Transaction/account/slot handlers
│   └── proHighValTxn.ts
├── stream/           # Stream routing/forwarding
│   └── index.ts
├── types/            # TypeScript declarations/utilities
└── index.ts          # Main application entry point

logs/
├── log.ts            # Pino logger with redaction & pretty transport in dev
└── log-events.ts     # Centralized, typed log event names
```

## Kafka

- Topics are ensured on startup (idempotent). You can manually clear topics:
```bash
npm run kafka:clear
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions, please open an issue on GitHub or contact the maintainers.

---

**Note**: This indexer requires access to a Yellowstone gRPC endpoint. Make sure you have proper credentials and network access before running the application.
