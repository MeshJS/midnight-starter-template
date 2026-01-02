#!/usr/bin/env bash

# echo "=== Running version check ==="
# docker run --rm midnightntwrk/midnight-node-toolkit:latest-main \
#     version

# echo -e "\n=== Running batch transactions ==="
# docker run --rm midnightntwrk/midnight-node-toolkit:latest-main \
#     generate-txs --dry-run batches -n 1 -b 2

# echo -e "\n=== Running single transaction ==="
# docker run --rm midnightntwrk/midnight-node-toolkit:latest-main \
#     generate-txs --dry-run single-tx \
#    --shielded-amount 100 \
#    --unshielded-amount 5 \
#    --source-seed "0000000000000000000000000000000000000000000000000000000000000001" \
#    --destination-address mn_shield-addr_undeployed12p0cn6f9dtlw74r44pg8mwwjwkr74nuekt4xx560764703qeeuvqxqqgft8uzya2rud445nach4lk74s7upjwydl8s0nejeg6hh5vck0vueqyws5 \
#    --destination-address mn_addr_undeployed13h0e3c2m7rcfem6wvjljnyjmxy5rkg9kkwcldzt73ya5pv7c4p8skzgqwj \
#    --destination-address mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s

docker run --rm midnightntwrk/midnight-node-toolkit:latest-main \
show-address \
--network undeployed     \
--seed 0000000000000000000000000000000000000000000000000000000000000001 \
--coin-public

docker run --rm midnightntwrk/midnight-node-toolkit:latest-main \
generate-intent deploy --dry-run \
-c toolkit-js/contract/contract.config.ts \
--toolkit-js-path ../toolkit-js/ \
--coin-public aa0d72bb77ea46f986a800c66d75c4e428a95bd7e1244f1ed059374e6266eb98 \
--output-intent "/out/deploy.bin" \
--output-private-state "/out/initial_private_state.json" \
--output-zswap-state "/out/out.json"