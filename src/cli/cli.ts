#!/usr/bin/env node

/**
 * D2 Mod Wiki Generator CLI - Simplified Version
 * 
 * Working CLI implementation for testing and demonstration
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs-extra';
import glob from 'glob';
import { parseTSV, createD2TypeConverters } from '../parsers/tsv-parser.js';
import type { UniqueItem } from '../types/d2-data.js';

const packageInfo = {
  name: 'd2-mod-wiki-generator',
  version: '0.1.0',
  description: 'Static site generator for Diablo 2 mod wikis from d2modgen output',
};

// Simple logger
const logger = {
  info: (msg: string) => console.log(chalk.blue('[INFO]'), msg),
  success: (msg: string) => console.log(chalk.green('[SUCCESS]'), msg),
  warn: (msg: string) => console.log(chalk.yellow('[WARN]'), msg),
  error: (msg: string) => console.error(chalk.red('[ERROR]'), msg),
};

// Main CLI program
const program = new Command();

program
  .name(packageInfo.name)
  .description(packageInfo.description)
  .version(packageInfo.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command');

// Generate command
program
  .command('generate')
  .description('Generate a static wiki from D2 mod data')
  .argument('<mod-path>', 'Path to the mod data directory')
  .option('-o, --output <path>', 'Output directory for the generated wiki', './wiki-output')
  .option('-n, --site-name <name>', 'Override site name', 'D2 Mod Wiki')
  .option('-t, --theme <theme>', 'Theme selection (dark|light|auto)', 'dark')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-f, --force', 'Force overwrite existing files', false)
  .action(async (modPath: string, options: any) => {
    try {
      logger.info(chalk.cyan('🎮 D2 Mod Wiki Generator'));
      console.log('');

      // Validate input path
      if (!await fs.pathExists(modPath)) {
        logger.error(`Mod directory does not exist: ${modPath}`);
        process.exit(1);
      }

      // Resolve paths
      const resolvedModPath = path.resolve(modPath);
      const resolvedOutputPath = path.resolve(options.output);

      logger.info(`📁 Source: ${chalk.yellow(resolvedModPath)}`);
      logger.info(`📁 Output: ${chalk.yellow(resolvedOutputPath)}`);
      console.log('');

      // Check if output directory exists and handle accordingly
      if (await fs.pathExists(resolvedOutputPath)) {
        if (!options.force) {
          const files = await fs.readdir(resolvedOutputPath);
          if (files.length > 0) {
            logger.error('Output directory is not empty. Use --force to overwrite.');
            process.exit(1);
          }
        } else {
          logger.warn('Overwriting existing output directory...');
          await fs.emptyDir(resolvedOutputPath);
        }
      }

      // Generate wiki
      logger.info('🔄 Generating wiki...');
      await generateWiki(resolvedOutputPath, options, resolvedModPath);
      
      logger.success('🎉 Wiki generated successfully!');
      logger.info(`📖 Open: ${chalk.cyan(path.join(resolvedOutputPath, 'index.html'))}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Generation failed: ' + errorMessage);
      process.exit(1);
    }
  });

// Serve command
program
  .command('serve')
  .description('Serve a generated wiki locally')
  .argument('<wiki-path>', 'Path to the generated wiki directory')
  .option('-p, --port <port>', 'Port to serve on', '3000')
  .action(async (wikiPath: string, options: any) => {
    logger.info(chalk.cyan('🌐 D2 Wiki Dev Server'));
    console.log('');
    logger.info(`📁 Wiki directory: ${chalk.yellow(wikiPath)}`);
    logger.info(`🌐 Server URL: ${chalk.cyan(`http://localhost:${options.port}`)}`);
    console.log('');
    logger.warn('🚧 Serve command not yet implemented');
    logger.info('For now, you can serve the generated files with:');
    logger.info(chalk.gray(`  npx serve ${wikiPath} -p ${options.port}`));
  });

// Validate command
program
  .command('validate')
  .description('Validate mod data files without generating wiki')
  .argument('<mod-path>', 'Path to the mod data directory')
  .option('-v, --verbose', 'Enable verbose output', false)
  .action(async (modPath: string, _options: any) => {
    logger.info(chalk.cyan('🔍 D2 Mod Data Validator'));
    console.log('');
    logger.info(`📁 Validating: ${chalk.yellow(modPath)}`);
    console.log('');
    logger.warn('🚧 Validate command not yet implemented');
  });

// Generate wiki function
async function generateWiki(outputPath: string, options: any, modPath: string): Promise<void> {
  await fs.ensureDir(outputPath);
  await fs.ensureDir(path.join(outputPath, 'assets', 'css'));
  await fs.ensureDir(path.join(outputPath, 'assets', 'js'));

  // 1. Parse Unique Items (basic)
  const { uniqueItems, itemNames } = await parseUniqueItemsFromMod(modPath, options.verbose);

  // 2. Write index.html
  const indexHtml = createIndexHtml(options);
  await fs.writeFile(path.join(outputPath, 'index.html'), indexHtml);

  // 3. Write items.html
  const itemsHtml = createItemsHtml(uniqueItems, itemNames, options);
  await fs.writeFile(path.join(outputPath, 'items.html'), itemsHtml);

  // 4. CSS & JS
  const css = createCSS(options.theme);
  await fs.writeFile(path.join(outputPath, 'assets', 'css', 'style.css'), css);
  const js = createJS();
  await fs.writeFile(path.join(outputPath, 'assets', 'js', 'app.js'), js);
}

async function parseUniqueItemsFromMod(modPath: string, verbose = false): Promise<{ uniqueItems: UniqueItem[]; itemNames: Record<string,string> }> {
  const converters = createD2TypeConverters();
  const matches = glob.sync('**/uniqueitems.txt', { cwd: modPath });
  const file = matches.length ? path.resolve(modPath, matches[0]) : null;
  if (!file) return { uniqueItems: [], itemNames: {} };
  const raw = await fs.readFile(file, 'utf8');
  const tsv = parseTSV<UniqueItem>(raw, file, { typeConverters: converters });
  if (verbose) logger.info(`Parsed ${tsv.data.length} unique items`);
  // try localization
  let itemNames: Record<string,string> = {};
  const locMatch = glob.sync('**/item-names.json', { cwd: modPath });
  if (locMatch.length) {
    const locRaw = await fs.readFile(path.resolve(modPath, locMatch[0]), 'utf8');
    try { itemNames = JSON.parse(locRaw); } catch {}
  }
  return { uniqueItems: tsv.data, itemNames };
}

function createItemsHtml(items: UniqueItem[], names: Record<string,string>, options:any): string {
  const rows = items.map(it => {
    const name = names[it.name] || it.name;
    return `<tr><td>${name}</td><td>${it.type}</td><td>${it.lvl}</td><td>${it.lvlreq}</td></tr>`;
  }).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unique Items - ${options.siteName}</title>
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body class="theme-${options.theme}">
  <header>
    <h1>Unique Items</h1>
    <nav>
      <a href="index.html">Home</a>
    </nav>
  </header>
  <main>
    <table class="items-table">
      <thead><tr><th>Name</th><th>Type</th><th>Level</th><th>ReqLvl</th></tr></thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </main>
  <footer><p>Generated by D2 Mod Wiki Generator</p></footer>
</body>
</html>`;
}

function createIndexHtml(options: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.siteName}</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="theme-${options.theme}">
    <header>
        <h1>🎮 ${options.siteName}</h1>
        <nav>
            <a href="items.html">Unique Items</a>
            <a href="#sets">Set Items</a>
            <a href="#skills">Skills</a>
            <a href="#monsters">Monsters</a>
        </nav>
    </header>
    
    <main>
        <section id="welcome">
            <h2>Welcome to your D2 Mod Wiki!</h2>
            <p>This is a demonstration of the D2 Mod Wiki Generator.</p>
            <p><strong>Status:</strong> 🚧 CLI is working! Real data parsing coming soon.</p>
        </section>
        
        <section id="features">
            <h3>🛠️ Current Features</h3>
            <ul>
                <li>✅ Working CLI interface</li>
                <li>✅ Project structure generation</li>
                <li>✅ Theme support (${options.theme})</li>
                <li>✅ Output validation</li>
                <li>🚧 Data parsing (in development)</li>
                <li>🚧 Real content generation (coming soon)</li>
            </ul>
        </section>

        <!-- Additional sections will be added once data parsing for sets, skills, monsters is implemented -->
    </main>
    
    <footer>
        <p>Generated by D2 Mod Wiki Generator v${packageInfo.version}</p>
        <p>Theme: ${options.theme}</p>
    </footer>
    
    <script src="assets/js/app.js"></script>
</body>
</html>`;
}

function createCSS(theme: string): string {
  const isDark = theme === 'dark';
  
  return `/* D2 Mod Wiki Styles - ${theme} theme */
:root {
    --bg-color: ${isDark ? '#1a1a1a' : '#ffffff'};
    --text-color: ${isDark ? '#e0e0e0' : '#333333'};
    --accent-color: #d4af37;
    --border-color: ${isDark ? '#333333' : '#dddddd'};
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    line-height: 1.6;
}

header {
    background: linear-gradient(135deg, #8B4513, #CD853F);
    padding: 2rem;
    text-align: center;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: white;
}

nav a {
    color: white;
    text-decoration: none;
    margin: 0 1rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

nav a:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    margin-bottom: 2rem;
}

ul {
    padding-left: 2rem;
}

li {
    margin-bottom: 0.5rem;
}

footer {
    text-align: center;
    padding: 2rem;
    border-top: 1px solid var(--border-color);
    margin-top: 3rem;
    opacity: 0.7;
}`;
}

function createJS(): string {
  return `// D2 Mod Wiki JavaScript
console.log('🎮 D2 Mod Wiki loaded successfully!');
console.log('CLI version: ${packageInfo.version}');
console.log('Ready for mod data integration!');`;
}

// Parse command line arguments
if (require.main === module) {
  program.parse(process.argv);
  
  // If no command provided, show help
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
} 