/**
 * CLI Logger Utility
 * 
 * Provides colored console logging with different levels
 */

import chalk from 'chalk';
import type { Logger, LogOptions } from '@/types';

/**
 * Creates a logger with specified options
 */
export function createLogger(options: Partial<LogOptions> = {}): Logger {
  const {
    level = 'info',
    timestamp = false,
    colors = true,
    prefix = '',
  } = options;

  const logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4,
  };

  const currentLevel = logLevels[level];

  function shouldLog(messageLevel: keyof typeof logLevels): boolean {
    return logLevels[messageLevel] >= currentLevel;
  }

  function formatMessage(level: string, message: string, ...args: any[]): string {
    let formatted = '';

    // Add timestamp if requested
    if (timestamp) {
      const now = new Date().toISOString();
      formatted += colors ? chalk.gray(`[${now}]`) : `[${now}]`;
      formatted += ' ';
    }

    // Add prefix if provided
    if (prefix) {
      formatted += colors ? chalk.cyan(`[${prefix}]`) : `[${prefix}]`;
      formatted += ' ';
    }

    // Add level indicator
    if (colors) {
      switch (level) {
        case 'debug':
          formatted += chalk.magenta('[DEBUG]');
          break;
        case 'info':
          formatted += chalk.blue('[INFO]');
          break;
        case 'warn':
          formatted += chalk.yellow('[WARN]');
          break;
        case 'error':
          formatted += chalk.red('[ERROR]');
          break;
        case 'success':
          formatted += chalk.green('[SUCCESS]');
          break;
        case 'verbose':
          formatted += chalk.gray('[VERBOSE]');
          break;
      }
    } else {
      formatted += `[${level.toUpperCase()}]`;
    }

    formatted += ' ';
    formatted += message;

    // Add additional arguments
    if (args.length > 0) {
      formatted += ' ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
    }

    return formatted;
  }

  return {
    debug(message: string, ...args: any[]): void {
      if (shouldLog('debug')) {
        console.log(formatMessage('debug', message, ...args));
      }
    },

    info(message: string, ...args: any[]): void {
      if (shouldLog('info')) {
        console.log(formatMessage('info', message, ...args));
      }
    },

    warn(message: string, ...args: any[]): void {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', message, ...args));
      }
    },

    error(message: string, ...args: any[]): void {
      if (shouldLog('error')) {
        console.error(formatMessage('error', message, ...args));
      }
    },

    success(message: string, ...args: any[]): void {
      if (shouldLog('info')) {
        console.log(formatMessage('success', message, ...args));
      }
    },

    verbose(message: string, ...args: any[]): void {
      if (shouldLog('debug')) {
        console.log(formatMessage('verbose', message, ...args));
      }
    },
  };
}

/**
 * Progress indicator utility
 */
export class ProgressIndicator {
  private spinner: string[] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private current = 0;
  private interval: NodeJS.Timeout | null = null;
  private message = '';

  constructor(private logger: Logger) {}

  start(message: string): void {
    this.message = message;
    this.current = 0;
    
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      process.stdout.write(`\r${chalk.cyan(this.spinner[this.current])} ${this.message}`);
      this.current = (this.current + 1) % this.spinner.length;
    }, 100);
  }

  update(message: string): void {
    this.message = message;
  }

  stop(finalMessage?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Clear the spinner line
    process.stdout.write('\r\x1b[K');
    
    if (finalMessage) {
      this.logger.success(finalMessage);
    }
  }

  fail(errorMessage: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Clear the spinner line
    process.stdout.write('\r\x1b[K');
    
    this.logger.error(errorMessage);
  }
} 