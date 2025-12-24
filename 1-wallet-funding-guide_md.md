# Midnight Node Quick Start, Wallet Funding & DUST Registration Guide

## Build

```bash
cd midnight-node
cargo build --release
```

## Run

```bash
CFG_PRESET=dev ./target/release/midnight-node --dev --name alice --base-path /tmp/midnight-dev
```

Run in background:
```bash
CFG_PRESET=dev ./target/release/midnight-node --dev --name alice --base-path /tmp/midnight-dev > /tmp/midnight-node.log 2>&1 &
tail -f /tmp/midnight-node.log
```

## Stop

```bash
pkill -f "midnight-node"
```

## Clean Database

```bash
CFG_PRESET=dev ./target/release/midnight-node purge-chain --dev --base-path /tmp/midnight-dev -y
```

## Verify Running

Check logs for block production:
```
🏆 Imported #1 (0x6b88…4e14 → 0x6d6a…eb63)
```

## Endpoints

| Service | URL |
|---------|-----|
| RPC | `ws://127.0.0.1:9944` |
| Prometheus | `http://127.0.0.1:9615` |

## Fresh Start

```bash
pkill -f midnight-node 2>/dev/null
CFG_PRESET=dev ./target/release/midnight-node --dev --name alice --base-path /tmp/midnight-dev
CFG_PRESET=dev ./target/release/midnight-node purge-chain --dev --base-path /tmp/midnight-dev -y
```


# Midnight Wallet Funding & DUST Registration Guide

This guide explains how to fund a new wallet and register for DUST generation using the pre-funded Alice wallet (`..01`) on a local development node.

## Prerequisites

- Midnight node running locally with `CFG_PRESET=dev`
- `midnight-node-toolkit` binary available at `target/release/midnight-node-toolkit`
- Node accessible at `ws://127.0.0.1:9944`

## Key Concepts

| Concept | Description |
|---------|-------------|
| **NIGHT** | The native token on Midnight |
| **DUST** | Gas token required to pay transaction fees |
| **Shielded Coins** | Private tokens (ZK-protected) |
| **Unshielded UTXOs** | Public tokens (transparent) |
| **DUST Registration** | Links your NIGHT holdings to generate DUST |
| **DUST Delegation** | Using another wallet's DUST to pay your fees |

## Pre-funded Dev Wallets

| Wallet | Seed | Purpose |
|--------|------|---------|
| **Alice (Funding)** | `..01` | Pre-funded with NIGHT and DUST in genesis |
| **Dev Wallet** | `..00` | Additional dev wallet |

> **Note:** `..01` is lazy hex notation for `0000000000000000000000000000000000000000000000000000000000000001`

---

## Step-by-Step: Fund a New Wallet

### Step 1: Get Your Wallet Addresses

First, get the addresses for your new wallet:

```bash
./target/release/midnight-node-toolkit show-address \
    --network undeployed \
    --seed "YOUR_WALLET_SEED_OR_MNEMONIC"
```

This outputs:
- `shielded` - Your private address (for receiving shielded tokens)
- `unshielded` - Your public address (for receiving unshielded tokens)
- `dust` - Your DUST address

**Example with mnemonic:**
```bash
./target/release/midnight-node-toolkit show-address \
    --network undeployed \
    --seed "word1 word2 word3..."
```ss

---

### Step 2: Send Unshielded NIGHT Tokens

Send **unshielded** NIGHT from Alice to your wallet. This is required for DUST registration.

```bash
./target/release/midnight-node-toolkit generate-txs single-tx \
    --source-seed "..01" \
    --destination-address "YOUR_UNSHIELDED_ADDRESS" \
    --unshielded-amount 100000000000000
```

**Parameters:**
- `--source-seed "..01"` - Alice's wallet (the funder)
- `--destination-address` - Your `unshielded` address from Step 1
- `--unshielded-amount` - Amount in tNIGHT (100000000000000 = 100 NIGHT)

**Example:**
```bash
./target/release/midnight-node-toolkit generate-txs single-tx \
    --source-seed "..01" \
    --destination-address "mn_addr_undeployed1en2rn2grc8aqeap5rqvasghre0266qew3lj0h7u46qfys8jcn0hs4q0qq9" \
    --unshielded-amount 100000000000000
```

---

### Step 3: Register for DUST (with Fee Delegation)

Register your DUST address using Alice's wallet to pay the DUST fees:

```bash
./target/release/midnight-node-toolkit generate-txs register-dust-address \
    --wallet-seed "YOUR_WALLET_SEED" \
    --funding-seed "..01"
```

**Parameters:**
- `--wallet-seed` - Your wallet seed (the wallet being registered)
- `--funding-seed "..01"` - Alice pays the DUST transaction fees

> **Key Insight:** The `--funding-seed` parameter enables **DUST fee delegation**. Alice's DUST pays for your registration transaction.

**Example:**
```bash
./target/release/midnight-node-toolkit generate-txs register-dust-address \
    --wallet-seed "word1 word2 word3 ..." \
    --funding-seed "..01"
```

---

### Step 4: Verify Your Wallet

Check your wallet balance:

```bash
./target/release/midnight-node-toolkit show-wallet \
    --seed "YOUR_WALLET_SEED"
```

You should see:
- `coins` - Shielded tokens (if any)
- `utxos` - Unshielded tokens
- `dust_utxos` - Your DUST registration entries

---

### Step 5: Check DUST Balance

Verify DUST is being generated:

```bash
./target/release/midnight-node-toolkit dust-balance \
    --seed "YOUR_WALLET_SEED"
```

You should see:
- `generation_infos` - Your DUST generation entries
- `source` - DUST sources
- `total` - Total DUST available

---

## Optional: Send Shielded Tokens

To send private (shielded) tokens:

```bash
./target/release/midnight-node-toolkit generate-txs single-tx \
    --source-seed "..01" \
    --destination-address "YOUR_SHIELDED_ADDRESS" \
    --shielded-amount 100000000000000
```

**Example:**
```bash
./target/release/midnight-node-toolkit generate-txs single-tx \
    --source-seed "..01" \
    --destination-address "mn_shield-addr_undeployed1rejryyjpye2gd5xskh8z8g5mps536q5x65mtmknn0cw4jwavac7ta0ren8skwqxz52gzumnt0s9rpda6p3y53psvgxz9vwa5myhvghcrkrx3q" \
    --shielded-amount 100000000000000
```

---

## Complete Example Script

```bash
#!/bin/bash
# Fund a new wallet on Midnight dev network

NEW_WALLET_SEED="your wallet seed or mnemonic here"
FUNDING_SEED="..01"  # Alice's pre-funded wallet
AMOUNT=100000000000000  # 100 NIGHT

# 1. Get addresses
echo "=== Getting wallet addresses ==="
./target/release/midnight-node-toolkit show-address \
    --network undeployed \
    --seed "$NEW_WALLET_SEED"

# 2. Get unshielded address (you'll need to extract this from step 1 output)
UNSHIELDED_ADDR="mn_addr_undeployed1..."  # Replace with actual address

# 3. Send unshielded NIGHT
echo "=== Sending unshielded NIGHT ==="
./target/release/midnight-node-toolkit generate-txs single-tx \
    --source-seed "$FUNDING_SEED" \
    --destination-address "$UNSHIELDED_ADDR" \
    --unshielded-amount $AMOUNT

# Wait for block confirmation
sleep 5

# 4. Register for DUST (Alice pays fees)
echo "=== Registering for DUST ==="
./target/release/midnight-node-toolkit generate-txs register-dust-address \
    --wallet-seed "$NEW_WALLET_SEED" \
    --funding-seed "$FUNDING_SEED"

# Wait for block confirmation
sleep 5

# 5. Verify
echo "=== Wallet State ==="
./target/release/midnight-node-toolkit show-wallet --seed "$NEW_WALLET_SEED"

echo "=== DUST Balance ==="
./target/release/midnight-node-toolkit dust-balance --seed "$NEW_WALLET_SEED"
```

---

## Troubleshooting

### "Insufficient DUST" Error

**Problem:** You tried to register without fee delegation.

**Solution:** Add `--funding-seed "..01"` to use Alice's DUST for fees:
```bash
./target/release/midnight-node-toolkit generate-txs register-dust-address \
    --wallet-seed "YOUR_SEED" \
    --funding-seed "..01"  # <-- Add this
```

### No DUST After Registration

**Problem:** You only have shielded coins, no unshielded UTXOs.

**Solution:** DUST registration requires **unshielded** NIGHT. Send unshielded tokens first:
```bash
./target/release/midnight-node-toolkit generate-txs single-tx \
    --source-seed "..01" \
    --destination-address "YOUR_UNSHIELDED_ADDRESS" \
    --unshielded-amount 100000000000000
```

### "OutsideTimeToDismiss" Error

**Problem:** Transaction too large (too many UTXOs).

**Solution:** Use a wallet with fewer UTXOs, or consolidate UTXOs first.

---

## Token Units Reference

| Unit | Value | Description |
|------|-------|-------------|
| 1 NIGHT | 1,000,000,000,000 tNIGHT | 10^12 base units |
| 100 NIGHT | 100,000,000,000,000 tNIGHT | Typical funding amount |

---

## Summary

1. **Get addresses** with `show-address`
2. **Send unshielded NIGHT** with `single-tx --unshielded-amount`
3. **Register for DUST** with `register-dust-address --funding-seed "..01"`
4. **Verify** with `show-wallet` and `dust-balance`

The key innovation is **DUST fee delegation** - Alice (`..01`) can pay the DUST fees for registering any wallet, solving the chicken-and-egg problem of needing DUST to get DUST.



docker run -p 6300:6300 midnightnetwork/proof-server:6.1.0-alpha.6 -- midnight-proof-server --network preview