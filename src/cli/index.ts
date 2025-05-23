#!/usr/bin/env node

/**
 * D2 Mod Wiki Generator CLI
 * 
 * Main command-line interface for generating static wikis from D2 mod data
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { generateCommand } from './commands/generate';
import { serveCommand } from './commands/serve';
import { validateCommand } from './commands/validate';
import { initCommand } from './commands/init';
import { createLogger } from './utils/logger';

const packageInfo = {
  name: 'd2-mod-wiki-generator',
  version: '0.1.0',
  description: 'Static site generator for Diablo 2 mod wikis from d2modgen output',
};

const logger = createLogger({ level: 'info', colors: true, timestamp: false });

// Main CLI program
const program = new Command();

program
  .name(packageInfo.name)
  .description(packageInfo.description)
  .version(packageInfo.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command');

// Generate command - main functionality
program
  .addCommand(generateCommand)
  .addCommand(serveCommand)
  .addCommand(validateCommand)
  .addCommand(initCommand);

// Global error handler
program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  
  logger.error('An unexpected error occurred:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  if (process.env.NODE_ENV === 'development') {
    logger.error(error.stack || 'No stack trace available');
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Show help if no command provided
if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

// Parse command line arguments
program.parse(process.argv);

// If we get here without a command, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 