import { createLogger } from './logger.js';
import path from 'node:path';
import { run } from './cli.js';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { currentDir, UndeployedConfig } from './config.js';

const config = new UndeployedConfig();
const dockerEnv = new DockerComposeEnvironment(path.resolve(currentDir, '..'), 'standalone.yml')
  .withWaitStrategy('counter-proof-server', Wait.forLogMessage('Actix runtime found; starting in Actix runtime', 1))
  .withWaitStrategy('counter-indexer', Wait.forLogMessage("starting indexing", 1));
const logger = await createLogger(config.logDir);
await run(config, logger, dockerEnv);
