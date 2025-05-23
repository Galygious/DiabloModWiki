/**
 * CLI Types and Interfaces
 * 
 * Types for command-line interface options and configurations
 */

import type { ValidationResult, ParseError, WikiConfig, CustomPage, WikiPage } from './d2-data.js';

// === CLI COMMAND OPTIONS ===

export interface GenerateOptions {
  /** Output directory for generated wiki */
  output?: string;
  /** Configuration file path */
  config?: string;
  /** Site name override */
  siteName?: string;
  /** Theme selection */
  theme?: 'dark' | 'light' | 'auto';
  /** Base URL for deployment */
  baseUrl?: string;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Force overwrite existing files */
  force?: boolean;
  /** Skip validation step */
  skipValidation?: boolean;
  /** Enable specific features */
  features?: string[];
  /** Custom CSS file path */
  customCss?: string;
  /** Generate in development mode */
  dev?: boolean;
}

export interface ServeOptions {
  /** Port to serve on */
  port?: number;
  /** Host to bind to */
  host?: string;
  /** Open browser automatically */
  open?: boolean;
  /** Enable live reload */
  livereload?: boolean;
  /** Verbose logging */
  verbose?: boolean;
}

export interface ValidateOptions {
  /** Show warnings */
  warnings?: boolean;
  /** Exit with error code on warnings */
  strict?: boolean;
  /** Output format */
  format?: 'text' | 'json' | 'table';
  /** Verbose output */
  verbose?: boolean;
}

export interface InitOptions {
  /** Project name */
  name?: string;
  /** Template to use */
  template?: 'basic' | 'advanced' | 'custom';
  /** Initialize with example data */
  withExample?: boolean;
  /** Overwrite existing files */
  force?: boolean;
}

// === CLI CONFIGURATION ===

export interface CLIConfig {
  /** Default output directory */
  defaultOutput: string;
  /** Default theme */
  defaultTheme: 'dark' | 'light' | 'auto';
  /** Default port for serve command */
  defaultPort: number;
  /** Default host for serve command */
  defaultHost: string;
  /** Verbose logging by default */
  verbose: boolean;
  /** Enable analytics */
  analytics: boolean;
  /** Update check settings */
  updateCheck: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
}

// === PROGRESS TRACKING ===

export interface ProgressInfo {
  /** Current step name */
  step: string;
  /** Current progress (0-100) */
  progress: number;
  /** Total steps */
  total: number;
  /** Current step number */
  current: number;
  /** Additional details */
  details?: string;
}

export interface TaskResult {
  /** Task name */
  task: string;
  /** Success status */
  success: boolean;
  /** Duration in milliseconds */
  duration: number;
  /** Result message */
  message?: string;
  /** Error if failed */
  error?: Error;
  /** Additional data */
  data?: any;
}

export interface GenerationResult {
  /** Success status */
  success: boolean;
  /** Output directory */
  outputDir: string;
  /** Number of pages generated */
  pagesGenerated: number;
  /** Generation time in milliseconds */
  duration: number;
  /** Validation results */
  validation?: ValidationResult;
  /** Task results */
  tasks: TaskResult[];
  /** Warning messages */
  warnings: string[];
  /** Error messages */
  errors: string[];
}

// === LOGGING ===

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LogOptions {
  level: LogLevel;
  timestamp: boolean;
  colors: boolean;
  prefix?: string;
}

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  success(message: string, ...args: any[]): void;
  verbose(message: string, ...args: any[]): void;
}

// === UPDATE TYPES ===

export interface UpdateInfo {
  /** Current version */
  current: string;
  /** Latest version */
  latest: string;
  /** Update available */
  updateAvailable: boolean;
  /** Release notes URL */
  releaseNotesUrl?: string;
  /** Download URL */
  downloadUrl?: string;
}

// === TEMPLATE TYPES ===

export interface Template {
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template version */
  version: string;
  /** Author */
  author: string;
  /** Template files */
  files: TemplateFile[];
  /** Dependencies */
  dependencies?: string[];
  /** Configuration */
  config?: any;
}

export interface TemplateFile {
  /** File path */
  path: string;
  /** File content */
  content: string;
  /** Is template (has placeholders) */
  isTemplate: boolean;
  /** File permissions */
  permissions?: number;
}

// === PLUGIN TYPES ===

export interface Plugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description: string;
  /** Plugin author */
  author: string;
  /** Plugin hooks */
  hooks: PluginHooks;
  /** Plugin configuration */
  config?: any;
}

export interface PluginHooks {
  /** Before parsing data */
  beforeParse?: (files: string[]) => void | Promise<void>;
  /** After parsing data */
  afterParse?: (data: any) => any | Promise<any>;
  /** Before generating pages */
  beforeGenerate?: (config: any) => void | Promise<void>;
  /** After generating pages */
  afterGenerate?: (results: any) => void | Promise<void>;
  /** Custom page generator */
  generatePages?: (data: any) => WikiPage[] | Promise<WikiPage[]>;
  /** Custom data transformer */
  transformData?: (data: any) => any | Promise<any>;
} 