import path from 'path';
import * as api from '../api';
import { type CounterProviders } from '../common-types';
import { Config, currentDir } from '../config';
import { createLogger } from '../logger';

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import 'dotenv/config';
import * as Rx from 'rxjs';
import { TestEnvironment } from './simulators/simulator';
import { Counter } from '@meshsdk/counter-contract';
import * as ledger from '@midnight-ntwrk/ledger-v6';
import { ShieldedAddress, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { tokenValue } from './utils/utils';
import { CombinedTokenTransfer } from '@midnight-ntwrk/wallet-sdk-facade';

const logDir = path.resolve(currentDir, '..', 'logs', 'public-provider', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

describe('API', () => {
  let testEnvironment: TestEnvironment;
  let wallet: api.WalletContext;
  let providers: CounterProviders;
  let configuration: Config;

  beforeAll(
    async () => {
      api.setLogger(logger);
      testEnvironment = new TestEnvironment(logger);
      const testConfiguration = await testEnvironment.start();
      logger.info(`Test configuration: ${JSON.stringify(testConfiguration)}`);
      configuration = testConfiguration.dappConfig;
    },
    1000 * 60 * 45,
  );

  beforeEach(
    async () => {
      // Reset before each test
      wallet = await testEnvironment.getWallet();
      providers = await api.configureProviders(wallet, configuration);
    },
    1000 * 60 * 45,
  );

  afterAll(async () => {
    await testEnvironment.shutdown();
  });

  it('allows to transfer shielded tokens only', async () => {
    const state = await Rx.firstValueFrom(wallet.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
    const stateReceiverAddress = state.shielded.address;
    const ledgerReceiverAddress = ShieldedAddress.codec
      .encode(configuration.networkId, stateReceiverAddress)
      .asString();
    // stateAddress: "coinPublicKey" & "encryptionPublicKey" - Bytes
    logger.info({
      section: 'Shielded Address',
      stateReceiverAddress,
    });
    // "mn_shield-addr_undeployed14gxh9wmhafr0np4gqrrx6awyus52jk7huyjy78kstym5ucnxawvtvtnrpgpszud4uyd0yjrlqyp7v5xvwqljsng2g79j5w4al9c4kuqm9zs2g"
    logger.info({
      section: 'ledgerReceiverAddress',
      ledgerReceiverAddress,
    });

    const ttl = new Date(Date.now() + 60 * 60 * 1000);
    const transfer = await wallet.wallet.transferTransaction(
      wallet.shieldedSecretKeys,
      wallet.dustSecretKey,
      [
        {
          type: 'shielded',
          outputs: [
            {
              type: ledger.shieldedToken().raw,
              receiverAddress: ledgerReceiverAddress,
              amount: tokenValue(1n),
            },
          ],
        },
      ],
      ttl,
    );

    //proof transaction
    const finalizedTx = await wallet.wallet.finalizeTransaction(transfer);
    const submittedTxHash = await wallet.wallet.submitTransaction(finalizedTx);
    logger.info({
      section: 'Submitted Transaction Hash',
      submittedTxHash,
    });

    await Rx.firstValueFrom(
      wallet.wallet
        .state()
        .pipe(Rx.filter((s) => s.shielded.availableCoins.some((c) => c.coin.value === tokenValue(1n)))),
    );
  });

  it('allows to transfer unshielded tokens', async () => {
    const state = await Rx.firstValueFrom(wallet.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
    const stateReceiverAddress = state.unshielded.address;
    const ledgerReceiverAddress = UnshieldedAddress.codec
      .encode(configuration.networkId, stateReceiverAddress)
      .asString();
    // stateAddress: "coinPublicKey" & "encryptionPublicKey" - Bytes
    logger.info({
      section: 'Shielded Address',
      stateReceiverAddress,
    });
    // "mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s"
    logger.info({
      section: 'ledgerReceiverAddress',
      ledgerReceiverAddress,
    });

    const tokenTransfer: CombinedTokenTransfer[] = [
      {
        type: 'unshielded',
        outputs: [
          {
            amount: tokenValue(1n),
            receiverAddress: ledgerReceiverAddress,
            type: ledger.unshieldedToken().raw,
          },
        ],
      },
    ];

    const ttl = new Date(Date.now() + 30 * 60 * 1000);
    const recipe = await wallet.wallet.transferTransaction(
      wallet.shieldedSecretKeys,
      wallet.dustSecretKey,
      tokenTransfer,
      ttl,
    );

    const signedTx = await wallet.wallet.signTransaction(recipe.transaction, (payload) =>
      wallet.unshieldedKeystore.signData(payload),
    );

    const finalizedTx = await wallet.wallet.finalizeTransaction({
      ...recipe,
      transaction: signedTx,
    });

    const submittedTxHash = await wallet.wallet.submitTransaction(finalizedTx);
    logger.info({
      section: 'Submitted Transaction Hash',
      submittedTxHash,
    });

    await Rx.firstValueFrom(
      wallet.wallet
        .state()
        .pipe(Rx.filter((s) => s.unshielded.availableCoins.some((c) => c.utxo.value === tokenValue(1n)))),
    );
  });

  it('allows to balance and submit an arbitrary shielded transaction', async () => {
    const transfer = {
      type: ledger.shieldedToken().raw,
      amount: tokenValue(1n),
    };

    const coin = ledger.createShieldedCoinInfo(transfer.type, transfer.amount);
    const output = ledger.ZswapOutput.new(
      coin,
      0,
      wallet.shieldedSecretKeys.coinPublicKey,
      wallet.shieldedSecretKeys.encryptionPublicKey,
    );

    const outputOffer = ledger.ZswapOffer.fromOutput(output, transfer.type, transfer.amount);

    const arbitraryTx = ledger.Transaction.fromParts(configuration.networkId, outputOffer);

    const provenArbitraryTx = await wallet.wallet.finalizeTransaction({
      type: 'TransactionToProve',
      transaction: arbitraryTx,
    });

    const balancedTx = await wallet.wallet.balanceTransaction(
      wallet.shieldedSecretKeys,
      wallet.dustSecretKey,
      provenArbitraryTx,
      new Date(Date.now() + 30 * 60 * 1000),
    );

    const finalizedTx = await wallet.wallet.finalizeTransaction(balancedTx);
    const submittedTxHash = await wallet.wallet.submitTransaction(finalizedTx);
    logger.info({
      section: 'Submitted Transaction Hash',
      submittedTxHash,
    });

    await Rx.firstValueFrom(
      wallet.wallet
        .state()
        .pipe(Rx.filter((s) => s.shielded.availableCoins.some((c) => c.coin.value === tokenValue(1n)))),
    );
  });

  it('allows to balance and submit an arbitrary unshielded transaction', async () => {
    const outputs = [
      {
        type: ledger.unshieldedToken().raw,
        value: tokenValue(1n),
        owner: wallet.unshieldedKeystore.getAddress(),
      },
    ];

    const intent = ledger.Intent.new(new Date(Date.now() + 30 * 60 * 1000));
    intent.guaranteedUnshieldedOffer = ledger.UnshieldedOffer.new([], outputs, []);

    const arbitraryTx = ledger.Transaction.fromParts(configuration.networkId, undefined, undefined, intent);

    const recipe = await wallet.wallet.balanceTransaction(
      wallet.shieldedSecretKeys,
      wallet.dustSecretKey,
      arbitraryTx,
      new Date(Date.now() + 30 * 60 * 1000),
    );

    if (recipe.type !== 'TransactionToProve') {
      throw new Error('Expected a transaction to prove');
    }

    const signedTx = await wallet.wallet.signTransaction(recipe.transaction, (payload) =>
      wallet.unshieldedKeystore.signData(payload),
    );

    const finalizedTx = await wallet.wallet.finalizeTransaction({
      ...recipe,
      transaction: signedTx,
    });

    const submittedTxHash = await wallet.wallet.submitTransaction(finalizedTx);
    logger.info({
      section: 'Submitted Transaction Hash',
      submittedTxHash,
    });

    await Rx.firstValueFrom(
      wallet.wallet
        .state()
        .pipe(Rx.filter((s) => s.unshielded.availableCoins.some((c) => c.utxo.value === tokenValue(1n)))),
    );
  });
});
