# Running the Midnight Indexer Locally

This guide explains how to run the Midnight Indexer in standalone mode, connecting to a local Substrate node.

## Prerequisites

```bash
# Install build dependencies
sudo apt update
sudo apt install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    protobuf-compiler \
    clang \
    cmake

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install subxt-cli (must match version in Cargo.toml - currently 0.44.0)
cargo install subxt-cli --version 0.44.0
```

## Node Version Compatibility

The indexer must have metadata that matches your node's runtime. If you're running a different node version than what's in `NODE_VERSION`, you need to regenerate the metadata.

### Check Your Node Version

```bash
curl -s -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"system_version","params":[],"id":1}' \
  http://127.0.0.1:9944 | jq -r '.result'
```

### Generate Metadata from Your Running Node

If your node version differs from `NODE_VERSION`, regenerate the metadata:

```bash
# Replace YOUR_NODE_VERSION with your actual version (e.g., 0.18.1)
NODE_VERSION="YOUR_NODE_VERSION"

# Create directory and download metadata
mkdir -p .node/$NODE_VERSION
subxt metadata --url ws://127.0.0.1:9944 -o .node/$NODE_VERSION/metadata.scale

# Update NODE_VERSION file
echo "$NODE_VERSION" > NODE_VERSION

# Rebuild the indexer
cargo build -p indexer-standalone --features standalone
```

## Running the Indexer

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `APP__INFRA__SECRET` | 32-byte hex secret for encryption (64 hex chars) | `303132...` |
| `APP__INFRA__NODE__URL` | Substrate node WebSocket URL | `ws://127.0.0.1:9944` |
| `APP__INFRA__STORAGE__CNN_URL` | SQLite database path | `target/data/indexer.sqlite` |

### Start the Indexer

```bash
# Create data directory
mkdir -p target/data

# Run the standalone indexer
RUST_LOG=info \
APP__INFRA__NODE__URL="ws://127.0.0.1:9944" \
APP__INFRA__STORAGE__CNN_URL=target/data/indexer.sqlite \
APP__INFRA__SECRET=303132333435363738393031323334353637383930313233343536373839303132 \
CONFIG_FILE=indexer-standalone/config.yaml \
cargo run -p indexer-standalone --features standalone
```

The indexer will:
1. Connect to your node at `ws://127.0.0.1:9944`
2. Create/migrate the SQLite database
3. Start indexing blocks from genesis
4. Expose the GraphQL API at `http://localhost:8088`

### Successful Output

You should see logs indicating blocks being indexed:

```
{"message":"starting indexing","kvs":{"highest_height":"None"}}
{"message":"listening to TCP connections","kvs":{"address":"0.0.0.0","port":8088}}
{"message":"block indexed","kvs":{"caught_up":false,"height":0,...}}
{"message":"block indexed","kvs":{"caught_up":false,"height":1,...}}
...
{"message":"caught-up status changed","kvs":{"caught_up":"true"}}
```

## Testing the GraphQL API

Once running, test the API:

```bash
# Get latest block
curl -s -X POST http://localhost:8088 \
  -H "Content-Type: application/json" \
  -d '{"query": "{ block { hash height protocolVersion timestamp } }"}' | jq

# Get genesis block
curl -s -X POST http://localhost:8088 \
  -H "Content-Type: application/json" \
  -d '{"query": "{ block(offset: {height: 0}) { hash height transactions { hash } } }"}' | jq
```
## Resetting the Indexer

To completely reset the indexer and start fresh:

```bash
# Stop the indexer process
# Remove the database file
rm -f target/data/indexer.sqlite

# Optional: Remove the entire data directory
rm -rf target/data

# Restart the indexer - it will recreate the database and re-index all blocks
```

## Troubleshooting

### Error: "Cannot decode from type; expected length X but got length Y"

This means the node metadata doesn't match your node version. Regenerate metadata:

```bash
subxt metadata --url ws://127.0.0.1:9944 -o .node/$(cat NODE_VERSION)/metadata.scale
cargo build -p indexer-standalone --features standalone
```

### Error: "relative URL without a base"

Check that the node URL is correctly formatted (must include `ws://` prefix).

### Connection Refused

Ensure your Substrate node is running and the WebSocket port (9944) is accessible.

## Architecture Overview

The standalone indexer combines three components in a single binary:

- **Chain Indexer**: Connects to the node, fetches and processes blocks
- **Wallet Indexer**: Associates connected wallets with relevant transactions
- **Indexer API**: Exposes GraphQL API for queries and subscriptions

Data is stored in an embedded SQLite database, making it ideal for local development.

## GraphQL API Endpoints

The API at `http://localhost:8088` supports:

- **Queries**: `block`, `transactions`, `contractAction`, `dustGenerationStatus`
- **Mutations**: `connect` (wallet), `disconnect` (wallet)
- **Subscriptions**: `blocks`, `contractActions`, `shieldedTransactions`, `unshieldedTransactions`

For the full schema, see `indexer-api/graphql/schema-v3.graphql`.
