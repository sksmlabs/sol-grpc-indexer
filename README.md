# Solana Yellowstone gRPC Indexer

[![Star this repo](https://img.shields.io/badge/⭐_Star-This_repo-lightgrey?style=flat)](https://github.com/sksmlabs/sol-grpc-indexer)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat&logo=solana&logoColor=white)](https://solana.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript-based Solana blockchain indexer that connects to Yellowstone gRPC endpoints to stream and process real-time blockchain data including transactions, accounts, and slot updates.

## Features

- 🔄 **Real-time Data Streaming**: Connect to Yellowstone gRPC endpoints for live Solana data
- 📊 **Multiple Subscription Types**: Support for slot updates, token accounts, and ping subscriptions
- 🛠️ **TypeScript Support**: Fully typed with comprehensive error handling
- 🔧 **Buffer Processing**: Automatic conversion of binary data to readable formats using bs58 encoding
- 📈 **Transaction Processing**: Extract transaction details including signatures, fees, and account keys
- 🏗️ **Modular Architecture**: Clean separation of concerns with dedicated modules for gRPC client, processing, and configuration

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

- **Token Account Monitoring**: Monitor specific token accounts
```bash
npm run dev token usdt  # Monitor USDT
npm run dev token usdc  # Monitor USDC
npm run dev token wsol  # Monitor Wrapped SOL
```

## Configuration

The indexer supports various configuration options:

- **GRPC_ENDPOINT**: Yellowstone gRPC server endpoint
- **GRPC_TOKEN**: Authentication token (if required)
- **Supported Tokens**: USDT, USDC, WSOL (easily extensible)

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

## Error Handling

- Comprehensive error handling for gRPC connections
- Automatic reconnection with exponential backoff
- Graceful handling of malformed data
- Detailed error logging for debugging

## Project Structure

```
src/
├── config/          # Configuration management
├── constants/       # Application constants (token mints, etc.)
├── grpc/           # gRPC client and subscription management
│   ├── client.ts   # Main gRPC client implementation
│   ├── createSubReqs.ts  # Subscription request builders
│   └── sendSubReqs.ts    # Subscription sending logic
├── processing/     # Data processing and transformation
│   └── index.ts    # Transaction and account processing
├── types/          # TypeScript type definitions
└── index.ts        # Main application entry point
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions, please open an issue on GitHub or contact the maintainers.

---

**Note**: This indexer requires access to a Yellowstone gRPC endpoint. Make sure you have proper credentials and network access before running the application.