import path from 'path';
import * as api from '../api';
import { currentDir } from '../config';
import { createLogger } from '../logger';
import { TestEnvironment } from '../test/simulators/simulator';
import 'dotenv/config';
import { sendArbitraryUnshieldedToken, sendUnshieldedToken } from '../test/utils/wallet-transfers';

const logDir = path.resolve(currentDir, '..', 'logs', 'setup-undeployed', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

async function setupStandalone() {
  api.setLogger(logger);
  const testEnvironment = new TestEnvironment(logger);
  const testConfiguration = await testEnvironment.start();
  const wallet = await testEnvironment.getWallet();
  const providers = await api.configureProviders(wallet, testConfiguration.dappConfig);

  try {
    const address = process.env.MY_UNDEPLOYED_UNSHIELDED_ADDRESS!;
    const result = await sendArbitraryUnshieldedToken(wallet, address, 1000000000n);
    // const result = await sendUnshieldedToken(wallet, address, 1n);
    logger.info(`address keystore ${wallet.unshieldedKeystore.getAddress()}`);
    logger.info(result);
  } catch (error) {
    logger.error('Setup failed:', error);
  }
  // Keep the process running forever
  logger.info('Setup complete. Keeping container alive forever...');
  await new Promise(() => {}); // This never resolves
}
setupStandalone().catch(console.error);
