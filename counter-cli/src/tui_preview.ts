import { createLogger } from './logger.js';
import { run } from './cli.js';
import { currentDir, PreviewConfig } from './config.js';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import path from 'node:path';

const config = new PreviewConfig();
const dockerEnv = new DockerComposeEnvironment(
  path.resolve(currentDir, '..'),
  'ps-preview.yml',
).withWaitStrategy('proof-server', Wait.forLogMessage('Actix runtime found; starting in Actix runtime', 1));
const logger = await createLogger(config.logDir);
await run(config, logger, dockerEnv);
