/**
 * Generate Command
 * 
 * Main command for generating static wiki sites from D2 mod data
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs-extra';
import { createLogger, ProgressIndicator } from '../utils/logger.js';
import { parseModData } from '../../parsers/mod-data-parser';
import type { GenerateOptions, Logger } from '../../types';

export const generateCommand = new Command('generate')
  .description('Generate a static wiki from D2 mod data')
  .argument('<mod-path>', 'Path to the mod data directory')
  .option('-o, --output <path>', 'Output directory for the generated wiki', './wiki-output')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-n, --site-name <name>', 'Override site name')
  .option('-t, --theme <theme>', 'Theme selection (dark|light|auto)', 'dark')
  .option('-b, --base-url <url>', 'Base URL for deployment', '/')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-f, --force', 'Force overwrite existing files', false)
  .option('--skip-validation', 'Skip data validation step', false)
  .option('--features <features>', 'Enable specific features (comma-separated)')
  .option('--custom-css <path>', 'Path to custom CSS file')
  .option('--dev', 'Generate in development mode', false)
  .action(async (modPath: string, options: GenerateOptions) => {
    const logger = createLogger({ 
      level: options.verbose ? 'debug' : 'info',
      colors: true,
      timestamp: false
    });

    const progress = new ProgressIndicator(logger);

    try {
      logger.info(chalk.cyan('🎮 D2 Mod Wiki Generator'));
      logger.info('');

      // Validate input path
      if (!await fs.pathExists(modPath)) {
        logger.error(`Mod directory does not exist: ${modPath}`);
        process.exit(1);
      }

      // Resolve paths
      const resolvedModPath = path.resolve(modPath);
      const resolvedOutputPath = path.resolve(options.output || './wiki-output');

      logger.info(`📁 Source: ${chalk.yellow(resolvedModPath)}`);
      logger.info(`📁 Output: ${chalk.yellow(resolvedOutputPath)}`);
      logger.info('');

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

      // Step 1: Parse mod data
      progress.start('Parsing mod data files...');
      
      const parseResult = await parseModData(resolvedModPath, {
        validateData: !options.skipValidation,
        includeDetailedErrors: options.verbose,
        skipMissingFiles: true,
        verbose: options.verbose
      });
      
      // Check for critical errors
      const criticalErrors = parseResult.errors.filter(e => e.type === 'fatal' || e.type === 'error');
      if (criticalErrors.length > 0) {
        progress.fail('Critical errors in mod data');
        logger.error(`Found ${criticalErrors.length} critical errors:`);
        criticalErrors.forEach(err => {
          logger.error(`  ${err.file}: ${err.message}`);
        });
        process.exit(1);
      }
      
      const warnings = parseResult.errors.filter(e => e.type === 'warning');
      if (warnings.length > 0 && options.verbose) {
        logger.warn(`Found ${warnings.length} warnings:`);
        warnings.forEach(warn => {
          logger.warn(`  ${warn.file}: ${warn.message}`);
        });
      }
      
      progress.stop('✅ Mod data parsed successfully');
      
      if (options.verbose) {
        logger.verbose(`Files processed: ${parseResult.stats.filesProcessed}`);
        logger.verbose(`Parse time: ${parseResult.stats.parseTime}ms`);
        logger.verbose(`Unique items: ${parseResult.data.uniqueItems.length}`);
        logger.verbose(`Set items: ${parseResult.data.setItems.length}`);
        logger.verbose(`Skills: ${parseResult.data.skills.length}`);
        logger.verbose(`Monsters: ${parseResult.data.monsters.length}`);
      }

      // Step 2: Generate wiki structure
      progress.start('Generating wiki pages...');
      
      await generateWikiContent(resolvedOutputPath, parseResult.data, options, logger);
      
      progress.stop('✅ Wiki pages generated');

      // Step 3: Copy assets and finalize
      progress.start('Finalizing wiki...');
      
      await simulateFinalizeStep(resolvedOutputPath, options, logger);
      
      progress.stop('✅ Wiki generation complete');

      logger.info('');
      logger.success(`🎉 Wiki generated successfully!`);
      logger.info(`📖 Open: ${chalk.cyan(path.join(resolvedOutputPath, 'index.html'))}`);
      logger.info(`🌐 Serve: ${chalk.cyan(`d2-wiki serve ${resolvedOutputPath}`)}`);

    } catch (error) {
      progress.fail('Failed to generate wiki');
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Generation failed:', errorMessage);
      
      if (options.verbose && error instanceof Error && error.stack) {
        logger.error('Stack trace:', error.stack);
      }
      
      process.exit(1);
    }
  });

/**
 * Generate wiki content using real parsed mod data with meaningful properties
 */
async function generateWikiContent(
  outputPath: string,
  modData: any,
  options: GenerateOptions,
  logger: Logger
): Promise<void> {
  // Create output directory structure
  await fs.ensureDir(outputPath);
  await fs.ensureDir(path.join(outputPath, 'items'));
  await fs.ensureDir(path.join(outputPath, 'skills'));
  await fs.ensureDir(path.join(outputPath, 'monsters'));
  await fs.ensureDir(path.join(outputPath, 'assets'));
  await fs.ensureDir(path.join(outputPath, 'assets', 'css'));
  await fs.ensureDir(path.join(outputPath, 'assets', 'js'));

  // Group items by name to handle duplicates
  const groupedUniqueItems = groupItemsByName(modData.uniqueItems || []);
  const groupedSetsData = groupSetsByName(modData.setItems || [], modData.setDefinitions || []);
  
  // Create backward-compatible format for existing functions
  const groupedSetItems: Record<string, any[]> = {};
  for (const [setName, setData] of Object.entries(groupedSetsData)) {
    groupedSetItems[setName] = setData.pieces;
  }
  
  // Generate enhanced index.html with real statistics
  await generateEnhancedIndex(outputPath, modData, groupedUniqueItems, groupedSetItems, options, logger);
  
  // Debug: Log lookup data for testing
  if (options.verbose) {
    logger.verbose('Sample skill lookup entries:');
    const sampleEntries = Object.entries(modData.skillLookup || {}).slice(0, 10);
    sampleEntries.forEach(([id, name]) => {
      logger.verbose(`  ${id} -> ${name}`);
    });
    
    logger.verbose('Sample skill tab lookup entries:');
    const sampleTabEntries = Object.entries(modData.skillTabLookup || {}).slice(0, 5);
    sampleTabEntries.forEach(([id, name]) => {
      logger.verbose(`  ${id} -> ${name}`);
    });
    
    logger.verbose('Sample skill description lookup entries:');
    const sampleDescEntries = Object.entries(modData.skillDescLookup || {}).slice(0, 5);
    sampleDescEntries.forEach(([id, desc]) => {
      logger.verbose(`  ${id} -> ${(desc as any).name} (${(desc as any).stringName})`);
    });
    
    logger.verbose('Sample item type lookup entries:');
    const sampleItemTypeEntries = Object.entries(modData.itemTypeLookup || {}).slice(0, 10);
    sampleItemTypeEntries.forEach(([code, name]) => {
      logger.verbose(`  ${code} -> ${name}`);
    });
    
    logger.verbose(`Total lookups loaded: ${Object.keys(modData.skillLookup || {}).length} skills, ${Object.keys(modData.skillDescLookup || {}).length} skill descriptions, ${Object.keys(modData.itemTypeLookup || {}).length} item types`);
  }
  
  // Generate detailed item pages with properties
  await generateDetailedItemPages(outputPath, groupedUniqueItems, groupedSetItems, modData, logger);
  
  // Generate skill pages with authentic D2-style skill tree layout
  await generateSkillPages(outputPath, modData.skills || [], logger);
  
  // Generate assets
  await generateEnhancedCSS(outputPath, options.theme || 'dark');
  await generateEnhancedJS(outputPath);
}

/**
 * Group items by name to handle variations, with special handling for set item naming patterns
 */
function groupItemsByName(items: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  /**
   * Extract base name for set items that follow the pattern "Name Number" (e.g., "Arctic Horn 7")
   * Returns the original name if it doesn't match the pattern
   */
  const getBaseName = (name: string): string => {
    // Pattern: ends with space followed by one or more digits
    const setItemPattern = /^(.+)\s+\d+$/;
    const match = name.match(setItemPattern);
    return match ? match[1] : name;
  };
  
  for (const item of items) {
    const fullName = item.name || item.index || 'Unknown';
    const baseName = getBaseName(fullName);
    
    if (!grouped[baseName]) {
      grouped[baseName] = [];
    }
    grouped[baseName].push(item);
  }
  
  return grouped;
}

/**
 * Extract and format item properties with set bonuses and proper D2 resistance logic
 */
function formatItemProperties(item: any, modData?: any): { individual: string[], setBonuses: Record<string, string[]> } {
  // First, collect individual properties and calculate resistances properly
  const resistances = { fire: 0, cold: 0, lightning: 0, poison: 0 };
  const otherProperties: Array<{ prop: string, par: any, min: any, max: any }> = [];
  
  // Process individual property fields (prop1-12, min1-12, max1-12) and separate resistances
  for (let i = 1; i <= 12; i++) {
    const prop = item[`prop${i}`];
    const par = item[`par${i}`];
    const min = item[`min${i}`];
    const max = item[`max${i}`];
    
    if (prop && prop.trim() !== '') {
      // Parse numeric values with special handling for class skills
      const parseNumericValue = (value: any): number | undefined => {
        // Handle null, undefined, or empty values
        if (value === null || value === undefined || value === '') {
          return undefined;
        }
        
        // Handle numbers (including NaN)
        if (typeof value === 'number') {
          return isNaN(value) ? undefined : value;
        }
        
        // Handle strings
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '' || trimmed === 'NaN' || trimmed.toLowerCase() === 'nan') {
            return undefined;
          }
          
          // Try to parse as integer first, then float
          let parsed = parseInt(trimmed, 10);
          if (isNaN(parsed)) {
            parsed = parseFloat(trimmed);
          }
          
          return isNaN(parsed) ? undefined : parsed;
        }
        
        // Handle booleans
        if (typeof value === 'boolean') {
          return value ? 1 : 0;
        }
        
        // Handle any other type - try to convert to number
        const converted = Number(value);
        return isNaN(converted) ? undefined : converted;
      };

      let minVal = parseNumericValue(min);
      let maxVal = parseNumericValue(max);
      
      // Special handling for class skills - sometimes the value is in par field
      const classSkills = ['ama', 'sor', 'nec', 'pal', 'bar', 'dru', 'ass'];
      if (classSkills.includes(prop) && (minVal === undefined || maxVal === undefined)) {
        const parVal = parseNumericValue(par);
        if (parVal !== undefined) {
          minVal = parVal;
          maxVal = parVal;
        }
      }
      
      // Enhanced fallback for properties that should have values but don't
      // These are properties that typically should have numeric values
      const shouldHaveValues = ['allskills', 'str', 'dex', 'vit', 'enr', 'hp', 'mana', 'ac', 'dmg%'];
      if (shouldHaveValues.includes(prop) && (minVal === undefined || maxVal === undefined)) {
        // Default to 1 for skill-like properties, 0 for others
        const defaultValue = prop === 'allskills' || prop.includes('skill') ? 1 : 0;
        minVal = minVal ?? defaultValue;
        maxVal = maxVal ?? defaultValue;
      }
      
      // Skip properties without valid numeric values
      if (minVal === undefined && maxVal === undefined) {
        continue;
      }
      
      // Get the effective value (use average for ranges, or the single value)
      let effectiveValue: number;
      if (minVal !== undefined && maxVal !== undefined) {
        effectiveValue = minVal === maxVal ? minVal : (minVal + maxVal) / 2;
      } else {
        effectiveValue = minVal !== undefined ? minVal : maxVal!;
      }
      
      // Handle resistance properties
      if (prop === 'res-all') {
        resistances.fire += effectiveValue;
        resistances.cold += effectiveValue;
        resistances.lightning += effectiveValue;
        resistances.poison += effectiveValue;
      } else if (prop === 'res-fire') {
        resistances.fire += effectiveValue;
      } else if (prop === 'res-cold') {
        resistances.cold += effectiveValue;
      } else if (prop === 'res-ltng') {
        resistances.lightning += effectiveValue;
      } else if (prop === 'res-pois') {
        resistances.poison += effectiveValue;
      } else if (prop.startsWith('res-') && prop.endsWith('-max')) {
        // Handle maximum resistance properties separately (they don't combine with regular resistances)
        otherProperties.push({ prop, par, min: minVal || 0, max: maxVal || minVal || 0 });
      } else {
        // Non-resistance property
        otherProperties.push({ prop, par, min: minVal || 0, max: maxVal || minVal || 0 });
      }
    }
  }
  
  // Process individual properties first
  const individualProperties = processProperties(resistances, otherProperties, modData);
  
  // Now process set bonuses
  const setBonuses = processSetBonuses(item, modData);
  
  return {
    individual: individualProperties,
    setBonuses: setBonuses
  };
}

/**
 * Process individual item properties with resistance logic and priority sorting
 */
function processProperties(
  resistances: { fire: number, cold: number, lightning: number, poison: number },
  otherProperties: Array<{ prop: string, par: any, min: any, max: any }>,
  modData?: any
): string[] {
  // Now format all properties with priority tracking
  const propertyMap = new Map<string, { values: number[], pars: any[], priority: number }>();
  
  // Helper function to get stat priority from ItemStatCost.json
  const getStatPriority = (prop: string): number => {
    if (!modData?.propertiesLookup || !modData?.itemStatCostLookup) {
      return 0; // Default priority
    }
    
    try {
      const propertyData = modData.propertiesLookup[prop];
      if (propertyData && propertyData.stat1) {
        const statName = propertyData.stat1;
        const statCostData = modData.itemStatCostLookup[statName];
        if (statCostData && statCostData.descpriority !== undefined) {
          const priority = parseInt(statCostData.descpriority) || 0;
          return priority;
        }
      }
    } catch (error) {
      // Fallback to 0 if lookup fails
    }
    
    return 0; // Default priority for unknown stats
  };
  
  // Handle resistances with D2 logic - resistances typically have high priority
  const resistanceValues = [resistances.fire, resistances.cold, resistances.lightning, resistances.poison];
  const allSame = resistanceValues.every(val => val === resistanceValues[0]) && resistanceValues[0] !== 0;
  
  if (allSame) {
    const allResProperty = `All Resistances +${resistanceValues[0]}%`;
    // Use res-all priority since that's what created this combined stat
    const resPriority = getStatPriority('res-all');
    propertyMap.set(allResProperty, { values: [resistanceValues[0]], pars: [''], priority: resPriority });
  } else {
    if (resistances.fire !== 0) {
      const fireProperty = `Fire Resist +${resistances.fire}%`;
      const firePriority = getStatPriority('res-fire');
      propertyMap.set(fireProperty, { values: [resistances.fire], pars: [''], priority: firePriority });
    }
    if (resistances.cold !== 0) {
      const coldProperty = `Cold Resist +${resistances.cold}%`;
      const coldPriority = getStatPriority('res-cold');
      propertyMap.set(coldProperty, { values: [resistances.cold], pars: [''], priority: coldPriority });
    }
    if (resistances.lightning !== 0) {
      const lightningProperty = `Lightning Resist +${resistances.lightning}%`;
      const lightningPriority = getStatPriority('res-ltng');
      propertyMap.set(lightningProperty, { values: [resistances.lightning], pars: [''], priority: lightningPriority });
    }
    if (resistances.poison !== 0) {
      const poisonProperty = `Poison Resist +${resistances.poison}%`;
      const poisonPriority = getStatPriority('res-pois');
      propertyMap.set(poisonProperty, { values: [resistances.poison], pars: [''], priority: poisonPriority });
    }
  }
  
  // Handle other properties
  for (const { prop, par, min, max } of otherProperties) {
    const formattedProperty = formatProperty(prop, par, min, max, modData);
    const priority = getStatPriority(prop);
    
    if (!propertyMap.has(formattedProperty)) {
      propertyMap.set(formattedProperty, { values: [], pars: [], priority });
    }
    
    const effectiveValue = min === max ? min : (min + max) / 2;
    const existingData = propertyMap.get(formattedProperty)!;
    existingData.values.push(effectiveValue);
    existingData.pars.push(par);
    // Keep the highest priority if combining properties
    existingData.priority = Math.max(existingData.priority, priority);
  }
  
  // Process combined properties and prepare for sorting
  const propertiesWithPriority: Array<{ text: string, priority: number }> = [];
  
  for (const [propertyText, data] of propertyMap.entries()) {
    if (data.values.length > 1) {
      const totalValue = data.values.reduce((sum, val) => sum + val, 0);
      
      // Try to update the value in the property text
      const updatedProperty = propertyText.replace(/([+-]?\d+(?:-\d+)?)/g, (match) => {
        const isRange = match.includes('-');
        if (isRange) {
          return `${Math.round(totalValue)}`;
        } else {
          return `${Math.round(totalValue)}`;
        }
      });
      
      propertiesWithPriority.push({ text: updatedProperty, priority: data.priority });
    } else {
      propertiesWithPriority.push({ text: propertyText, priority: data.priority });
    }
  }
  
  // Sort by priority (higher priority first), maintaining file order for equal priorities
  propertiesWithPriority.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    return 0; // Maintain original order for equal priorities
  });
  
  // Return just the text, now properly ordered
  return propertiesWithPriority.map(p => p.text);
}

/**
 * Process set bonuses from aprop fields
 */
function processSetBonuses(item: any, modData?: any): Record<string, string[]> {
  const setBonuses: Record<string, string[]> = {};
  
  // Parse numeric values for set bonus properties
  const parseNumericValue = (value: any): number | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    if (typeof value === 'number') {
      return isNaN(value) ? undefined : value;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === 'NaN' || trimmed.toLowerCase() === 'nan') {
        return undefined;
      }
      const parsed = parseInt(trimmed, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  // Helper function to get stat priority from ItemStatCost.json
  const getStatPriority = (prop: string): number => {
    if (!modData?.propertiesLookup || !modData?.itemStatCostLookup) {
      return 0; // Default priority
    }
    
    try {
      const propertyData = modData.propertiesLookup[prop];
      if (propertyData && propertyData.stat1) {
        const statName = propertyData.stat1;
        const statCostData = modData.itemStatCostLookup[statName];
        if (statCostData && statCostData.descpriority !== undefined) {
          const priority = parseInt(statCostData.descpriority) || 0;
          return priority;
        }
      }
    } catch (error) {
      // Fallback to 0 if lookup fails
    }
    
    return 0; // Default priority for unknown stats
  };
  
  // Process set bonus properties (aprop1a/b through aprop5a/b)
  // 'a' suffix typically means 2-piece bonus, 'b' suffix typically means 3-piece bonus
  const bonusTypes = [
    { suffix: 'a', label: '2 pieces' },
    { suffix: 'b', label: '3 pieces' },
    // Some mods might have more levels, but these are the most common
  ];
  
  for (const { suffix, label } of bonusTypes) {
    const bonusPropertiesWithPriority: Array<{ text: string, priority: number }> = [];
    
    // Check up to 5 bonus property slots (aprop1a-aprop5a, aprop1b-aprop5b, etc.)
    for (let i = 1; i <= 5; i++) {
      const prop = item[`aprop${i}${suffix}`];
      const par = item[`apar${i}${suffix}`];
      const min = parseNumericValue(item[`amin${i}${suffix}`]);
      const max = parseNumericValue(item[`amax${i}${suffix}`]);
      
      if (prop && prop.trim() !== '' && (min !== undefined || max !== undefined)) {
        // Use the same formatting logic as individual properties
        const minVal = min ?? 0;
        const maxVal = max ?? min ?? 0;
        const formattedProperty = formatProperty(prop, par, minVal, maxVal, modData);
        if (formattedProperty) {
          const priority = getStatPriority(prop);
          bonusPropertiesWithPriority.push({ text: formattedProperty, priority });
        }
      }
    }
    
    // Sort by priority (higher priority first), maintaining file order for equal priorities
    bonusPropertiesWithPriority.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return 0; // Maintain original order for equal priorities
    });
    
    // Only add this bonus level if it has properties
    if (bonusPropertiesWithPriority.length > 0) {
      setBonuses[label] = bonusPropertiesWithPriority.map(p => p.text);
    }
  }
  
  return setBonuses;
}

/**
 * Format individual property into readable text using authentic D2 formatting
 */
function formatProperty(prop: string, par: any, minVal: number, maxVal: number, modData?: any): string {
  // Better parsing of numeric values to avoid NaN
  const parseNumericValue = (value: any): number | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    if (typeof value === 'number') {
      return isNaN(value) ? undefined : value;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') {
        return undefined;
      }
      const parsed = parseInt(trimmed, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  // Helper function to resolve skill/class names from param
  const resolveSkillName = (skillId: string | number): string => {
    if (!skillId) return 'Unknown';
    const skillDesc = modData?.skillDescLookup?.[skillId];
    return skillDesc?.name || modData?.skillLookup?.[skillId] || skillId.toString();
  };
  
  const resolveClassName = (classId: string | number): string => {
    const classNames: Record<string, string> = {
      '0': 'Amazon', '1': 'Sorceress', '2': 'Necromancer', '3': 'Paladin',
      '4': 'Barbarian', '5': 'Druid', '6': 'Assassin',
      // Add class abbreviations used in property codes
      'ama': 'Amazon', 'sor': 'Sorceress', 'nec': 'Necromancer', 'pal': 'Paladin',
      'bar': 'Barbarian', 'dru': 'Druid', 'ass': 'Assassin'
    };
    return classNames[classId?.toString()] || `Class ${classId}`;
  };
  
  const minValParsed = parseNumericValue(minVal);
  const maxValParsed = parseNumericValue(maxVal);
  
  // Determine the stat value to display
  let statValue: number | undefined;
  if (minValParsed !== undefined && maxValParsed !== undefined) {
    if (minValParsed === maxValParsed) {
      statValue = minValParsed;
    } else {
      // For ranges, we'll use min-max format in specific descfuncs
      statValue = minValParsed; // Default to min for now
    }
  } else if (minValParsed !== undefined) {
    statValue = minValParsed;
  } else if (maxValParsed !== undefined) {
    statValue = maxValParsed;
  }

  // Use the proper D2 formatting chain: property code → Properties → ItemStatCost → format with DescFunc
  if (modData?.propertiesLookup && modData?.itemStatCostLookup && statValue !== undefined) {
    try {
      // Step 1: Get stat name from Properties.json using property code
      const propertyData = modData.propertiesLookup[prop];
      if (propertyData && propertyData.stat1) {
        const statName = propertyData.stat1;
        
        // Step 2: Get formatting info from ItemStatCost.json using stat name
        const statCostData = modData.itemStatCostLookup[statName];
        if (statCostData) {
          const descFunc = parseInt(statCostData.descfunc) || 1;
          const descVal = parseInt(statCostData.descval) || 1;
          const descStrPos = statCostData.descstrpos || '';
          const descStrNeg = statCostData.descstrneg || '';
          const descStr2 = statCostData.descstr2 || '';
          
          // Get the appropriate description string based on value sign
          const isPositive = statValue >= 0;
          const descStr = isPositive ? descStrPos : descStrNeg;
          
          // Get localized string from item-modifiers if available
          let localizedStr = descStr;
          let localizedStr2 = descStr2;
          
          if (modData.itemModifierLookup) {
            const modifier = modData.itemModifierLookup[descStr];
            if (modifier && modifier.enUS) {
              localizedStr = modifier.enUS;
            }
            
            if (descStr2) {
              const modifier2 = modData.itemModifierLookup[descStr2];
              if (modifier2 && modifier2.enUS) {
                localizedStr2 = modifier2.enUS;
              }
            }
          }
          
          // Special handling for skill properties that use min/max as chance/level
          const isSkillProperty = ['item_skillongethit', 'item_skillonhit', 'item_skillonattack', 'item_skillonkill', 'item_skillondeath', 'item_skillonlevelup'].includes(statName);
          
          // For skill properties, use specialized formatting
          if (isSkillProperty && localizedStr.includes('%d') && localizedStr.includes('%s')) {
            const chance = minValParsed !== undefined ? minValParsed : maxValParsed || statValue;
            const level = maxValParsed !== undefined ? maxValParsed : minValParsed || statValue;
            const skillName = resolveSkillName(par) || par || 'Unknown Skill';
            
            // Replace placeholders in the proper order for skill properties
            // Format: "%d%% Chance to cast level %d %s when struck"
            let formatted = localizedStr;
            const placeholders = formatted.match(/%d|%s/g) || [];
            
            // Replace in order: chance, level, skill name
            if (placeholders.length >= 3) {
              formatted = formatted.replace(/%d/, chance.toString());
              formatted = formatted.replace(/%d/, level.toString());
              formatted = formatted.replace(/%s/, skillName);
            }
            
            // Clean up any remaining %% escaping
            formatted = formatted.replace(/%%/g, '%');
            
            return formatted;
          }
          
          // Special handling for class-specific properties
          let effectiveParam = par;
          const classSkills = ['ama', 'sor', 'nec', 'pal', 'bar', 'dru', 'ass'];
          if (classSkills.includes(prop) && descFunc === 13) {
            // For class skill properties, use the property code itself as the class identifier
            effectiveParam = prop;
          }
          
          // Apply the standard DescFunc formatting for non-skill properties
          const formatted = applyDescFunc(descFunc, statValue, minValParsed, maxValParsed, localizedStr, localizedStr2, effectiveParam, modData, resolveSkillName, resolveClassName);
          if (formatted) {
            return formatted;
          }
        } else {
          // No stat cost data found - return property with value
          return `${prop}: ${minValParsed !== undefined && maxValParsed !== undefined && minValParsed === maxValParsed ? minValParsed : `${minValParsed || 0}-${maxValParsed || 0}`}`;
        }
      } else if (propertyData && propertyData.func1) {
        // Handle special properties that have func1 but no stat1 - try function-based formatting
        const func1 = parseInt(propertyData.func1) || 0;
        const functionFormatted = tryFunctionBasedFormatting(prop, func1, statValue, minValParsed, maxValParsed);
        if (functionFormatted) {
          return functionFormatted;
        }
        
        // If function-based formatting fails, return property with value
        return `${prop}: ${minValParsed !== undefined && maxValParsed !== undefined && minValParsed === maxValParsed ? minValParsed : `${minValParsed || 0}-${maxValParsed || 0}`}`;
      } else {
        // No property data found - return property with value
        return `${prop}: ${minValParsed !== undefined && maxValParsed !== undefined && minValParsed === maxValParsed ? minValParsed : `${minValParsed || 0}-${maxValParsed || 0}`}`;
      }
    } catch (lookupError) {
      // D2 stat formatting failed - return property with value
      return `${prop}: ${minValParsed !== undefined && maxValParsed !== undefined && minValParsed === maxValParsed ? minValParsed : `${minValParsed || 0}-${maxValParsed || 0}`}`;
    }
  }
  
  // If no D2 data available, return property with value
  return `${prop}: ${minValParsed !== undefined && maxValParsed !== undefined && minValParsed === maxValParsed ? minValParsed : `${minValParsed || 0}-${maxValParsed || 0}`}`;
}

/**
 * Try to format properties using function-based logic when no stat1 mapping exists
 */
function tryFunctionBasedFormatting(
  prop: string,
  func1: number, 
  value: number,
  minVal?: number,
  maxVal?: number
): string | null {
  // Handle value ranges for display
  let valueText = '';
  if (minVal !== undefined && maxVal !== undefined && minVal !== maxVal) {
    valueText = `${minVal}-${maxVal}`;
  } else {
    valueText = value.toString();
  }
  
  // Handle common function-based property patterns
  switch (func1) {
    case 6: // Often used for damage-related properties
      if (prop === 'dmg-max') {
        return `+${valueText} to Maximum Damage`;
      }
      break;
      
    case 7: // Often used for percentage-based properties
      if (prop === 'dmg%') {
        return `+${valueText}% Enhanced Damage`;
      }
      break;
      
    case 1: // Often used for basic stat additions
      // Handle common property patterns
      if (prop.includes('dmg')) {
        return `+${valueText} to ${prop.replace('dmg', 'Damage').replace('-', ' ')}`;
      }
      if (prop.includes('att')) {
        return `+${valueText}% to Attack Rating`;
      }
      break;
      
    case 8: // Often used for rate/speed properties (like cast rate)
      if (prop.includes('cast')) {
        return `+${valueText}% Faster Cast Rate`;
      }
      if (prop.includes('run') || prop.includes('walk')) {
        return `+${valueText}% Faster Run/Walk`;
      }
      break;
      
    default:
      // Try to infer from property name
      if (prop.endsWith('%')) {
        return `+${valueText}% ${prop.replace('%', '').replace('-', ' ').replace(/_/g, ' ')}`;
      }
      break;
  }
  
  // If we can't determine the format, return null to fall back to default
  return null;
}

/**
 * Apply D2 DescFunc formatting (functions 1-28)
 */
function applyDescFunc(
  descFunc: number,
  value: number,
  minVal?: number,
  maxVal?: number,
  string1: string = '',
  string2: string = '',
  param?: any,
  modData?: any,
  resolveSkillName?: (skillId: string | number) => string,
  resolveClassName?: (classId: string | number) => string
): string {
  // Handle value ranges for display
  let valueText = '';
  if (minVal !== undefined && maxVal !== undefined && minVal !== maxVal) {
    valueText = `${minVal}-${maxVal}`;
  } else {
    valueText = value.toString();
  }
  
  // Helper function to replace placeholders in localized strings
  const replacePlaceholders = (str: string, val: string | number): string => {
    return str
      .replace(/%\+d/g, `+${val}`)
      .replace(/%d/g, val.toString())
      .replace(/%i/g, val.toString())
      .replace(/%\+(\d+)d/g, `+${val}`)
      .replace(/\{0\}/g, val.toString())
      .replace(/\{1\}/g, val.toString())
      .replace(/%%/g, '%'); // Fix double % symbols (D2 uses %% to escape %)
  };
  
  // Fallback functions if not provided
  const resolveSkillNameFn = resolveSkillName || ((skillId: string | number): string => {
    if (!skillId) return 'Unknown';
    const skillDesc = modData?.skillDescLookup?.[skillId];
    return skillDesc?.name || modData?.skillLookup?.[skillId] || skillId.toString();
  });
  
  const resolveClassNameFn = resolveClassName || ((classId: string | number): string => {
    const classNames: Record<string, string> = {
      '0': 'Amazon', '1': 'Sorceress', '2': 'Necromancer', '3': 'Paladin',
      '4': 'Barbarian', '5': 'Druid', '6': 'Assassin',
      'ama': 'Amazon', 'sor': 'Sorceress', 'nec': 'Necromancer', 'pal': 'Paladin',
      'bar': 'Barbarian', 'dru': 'Druid', 'ass': 'Assassin'
    };
    return classNames[classId?.toString()] || `Class ${classId}`;
  });
  
  const resolveSkillTab = (tabId: string | number): string => {
    return modData?.skillTabLookup?.[tabId] || `Tab ${tabId}`;
  };
  
  // Process the localized strings to replace placeholders
  const processedString1 = replacePlaceholders(string1, valueText);
  const processedString2 = replacePlaceholders(string2, valueText);
  
  let result = '';
  
  switch (descFunc) {
    case 1: // +[value] [string1]
      if (processedString1) {
        result = processedString1.includes(valueText) ? processedString1 : `+${valueText} ${processedString1}`;
      } else {
        result = `+${valueText}`;
      }
      break;
      
    case 2: // [value]% [string1]
      if (processedString1) {
        result = processedString1.includes(valueText) ? processedString1 : `${valueText}% ${processedString1}`;
      } else {
        result = `${valueText}%`;
      }
      break;
      
    case 3: // [value] [string1]
      if (processedString1) {
        result = processedString1.includes(valueText) ? processedString1 : `${valueText} ${processedString1}`;
      } else {
        result = `${valueText}`;
      }
      break;
      
    case 4: // +[value]% [string1]
      if (processedString1) {
        result = processedString1.includes(valueText) ? processedString1 : `+${valueText}% ${processedString1}`;
      } else {
        result = `+${valueText}%`;
      }
      break;
      
    case 5: // [value*100/128]% [string1]
      const scaledValue = Math.round(value * 100 / 128);
      const scaledText = replacePlaceholders(string1, scaledValue);
      result = scaledText || `${scaledValue}% ${string1}`;
      break;
      
    case 6: // +[value] [string1] [string2]
      result = processedString1 ? 
        (processedString1.includes(valueText) ? `${processedString1} ${processedString2}` : `+${valueText} ${processedString1} ${processedString2}`) :
        `+${valueText}`;
      break;
      
    case 7: // [value]% [string1] [string2]
      result = processedString1 ? 
        (processedString1.includes(valueText) ? `${processedString1} ${processedString2}` : `${valueText}% ${processedString1} ${processedString2}`) :
        `${valueText}%`;
      break;
      
    case 8: // +[value]% [string1] [string2]
      result = processedString1 ? 
        (processedString1.includes(valueText) ? `${processedString1} ${processedString2}` : `+${valueText}% ${processedString1} ${processedString2}`) :
        `+${valueText}%`;
      break;
      
    case 9: // [value] [string1] [string2]
      result = processedString1 ? 
        (processedString1.includes(valueText) ? `${processedString1} ${processedString2}` : `${valueText} ${processedString1} ${processedString2}`) :
        `${valueText}`;
      break;
      
    case 10: // [value*100/128]% [string1] [string2]
      const scaledValue2 = Math.round(value * 100 / 128);
      const scaledText2 = replacePlaceholders(string1, scaledValue2);
      result = scaledText2 ? `${scaledText2} ${processedString2}` : `${scaledValue2}% ${string1} ${string2}`;
      break;
      
    case 11: // Repairs 1 Durability In [100 / value] Seconds
      const repairTime = Math.round(100 / value);
      result = `Repairs 1 Durability In ${repairTime} Seconds`;
      break;
      
    case 12: // +[value] [string1]
      result = processedString1 ? 
        (processedString1.includes(valueText) ? processedString1 : `+${valueText} ${processedString1}`) :
        `+${valueText}`;
      break;
      
    case 13: // +[value] to [class] Skill Levels
      const className = resolveClassNameFn(param);
      result = `+${valueText} to ${className} Skill Levels`;
      break;
      
    case 14: // +[value] to [skilltab] Skill Levels ([class] Only)
      const skillTab = resolveSkillTab(param);
      const tabClassName = resolveClassNameFn(Math.floor(parseInt(param || '0') / 3));
      result = `+${valueText} to ${skillTab} (${tabClassName} Only)`;
      break;
      
    case 15: // [chance]% to cast [slvl] [skill] on [event]
      const skillName = resolveSkillNameFn(param);
      const chance = minVal !== undefined ? minVal : value;
      const skillLevel = maxVal !== undefined ? maxVal : value;
      result = `${chance}% Chance to Cast Level ${skillLevel} ${skillName} on Strike`;
      break;
      
    case 16: // Level [sLvl] [skill] Aura When Equipped
      const auraSkill = resolveSkillNameFn(param);
      result = `Level ${valueText} ${auraSkill} Aura When Equipped`;
      break;
      
    case 17: // [value] [string1] (Increases near [time])
      result = processedString1 ? `${processedString1} (Increases Near Dawn)` : `${valueText} ${string1} (Increases Near Dawn)`;
      break;
      
    case 18: // [value]% [string1] (Increases near [time])
      result = processedString1 ? `${processedString1} (Increases Near Dawn)` : `${valueText}% ${string1} (Increases Near Dawn)`;
      break;
      
    case 19: // sprintf implementation - use string1 as format
      result = replacePlaceholders(string1, valueText);
      break;
      
    case 20: // [value * -1]% [string1]
      const negValue = value * -1;
      const negText = replacePlaceholders(string1, negValue);
      result = negText || `${negValue}% ${string1}`;
      break;
      
    case 21: // [value * -1] [string1]
      const negValue2 = value * -1;
      const negText2 = replacePlaceholders(string1, negValue2);
      result = negText2 || `${negValue2} ${string1}`;
      break;
      
    case 22: // [value]% [string1] [montype] (bugged in vanilla)
      result = processedString1 ? `${processedString1} ${processedString2}` : `${valueText}% ${string1} ${string2}`;
      break;
      
    case 23: // [value]% [string1] [monster]
      result = processedString1 ? `${processedString1} ${processedString2}` : `${valueText}% ${string1} ${string2}`;
      break;
      
    case 24: // charges format
      const charges = maxVal !== undefined ? maxVal : value;
      const level = minVal !== undefined ? minVal : value;
      const skillNameCharges = resolveSkillNameFn(param);
      result = `Level ${level} ${skillNameCharges} (${charges} Charges)`;
      break;
      
    case 27: // +[value] to [skill] ([class] Only)
      const skillNameClass = resolveSkillNameFn(param);
      const ownerClass = resolveClassNameFn(0);
      result = `+${valueText} to ${skillNameClass} (${ownerClass} Only)`;
      break;
      
    case 28: // +[value] to [skill]
      const skillNameGeneric = resolveSkillNameFn(param);
      result = `+${valueText} to ${skillNameGeneric}`;
      break;
      
    default:
      // Unknown descfunc, try to process the string anyway
      result = processedString1 || `${valueText} ${string1}`;
      break;
  }
  
  // Clean up the result
  return result.trim().replace(/\s+/g, ' ');
}

/**
 * Legacy formatting functions removed - all properties now use D2 lookup chain
 */

/**
 * Simulate finalization step
 */
async function simulateFinalizeStep(
  outputPath: string,
  options: GenerateOptions,
  logger: Logger
): Promise<void> {
  // Generate assets
  await generateEnhancedCSS(outputPath, options.theme || 'dark');
  await generateEnhancedJS(outputPath);
  
  if (options.verbose) {
    logger.verbose('Finalization completed');
  }
}

/**
 * Generate enhanced index page
 */
async function generateEnhancedIndex(
  outputPath: string,
  modData: any,
  groupedUniqueItems: Record<string, any[]>,
  groupedSetItems: Record<string, any[]>,
  options: GenerateOptions,
  logger: Logger
): Promise<void> {
  const uniqueCount = Object.keys(groupedUniqueItems).length;
  const setCount = Object.keys(groupedSetItems).length;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.siteName || 'D2 Mod Wiki'}</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="theme-${options.theme || 'dark'}">
    <header>
        <div class="container">
            <h1>${options.siteName || 'D2 Mod Wiki'}</h1>
            <nav>
                <a href="#overview">Overview</a>
                <a href="items/unique.html">Unique Items</a>
                <a href="items/sets.html">Set Items</a>
                <a href="skills/index.html">Skills</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <section id="overview">
            <h2>Mod Overview</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Unique Items</h3>
                    <div class="stat-number">${uniqueCount}</div>
                    <p>Unique items with enhanced D2 formatting</p>
                </div>
                <div class="stat-card">
                    <h3>Set Items</h3>
                    <div class="stat-number">${setCount}</div>
                    <p>Set items with authentic properties</p>
                </div>
                <div class="stat-card">
                    <h3>Skills</h3>
                    <div class="stat-number">${(modData.skills || []).length}</div>
                    <p>Skills with detailed information</p>
                </div>
            </div>
        </section>
    </main>

    <script src="assets/js/app.js"></script>
</body>
</html>`;

  await fs.writeFile(path.join(outputPath, 'index.html'), html);
  logger.success(`Generated enhanced index page`);
}

/**
 * Generate detailed item pages
 */
async function generateDetailedItemPages(
  outputPath: string,
  groupedUniqueItems: Record<string, any[]>,
  groupedSetItems: Record<string, any[]>,
  modData: any,
  logger: Logger
): Promise<void> {
  // Generate unique items page with D2 formatting
  const uniqueHtml = generateItemPageHtml('Unique Items', groupedUniqueItems, 'unique-item', modData);
  await fs.writeFile(path.join(outputPath, 'items', 'unique.html'), uniqueHtml);
  
  // Generate unified set items page with complete set information
  const groupedSetsData = groupSetsByName(modData.setItems || [], modData.setDefinitions || []);
  const setHtml = generateSetItemsPage(groupedSetsData, modData, 'dark');
  await fs.writeFile(path.join(outputPath, 'items', 'sets.html'), setHtml);
  
  logger.success(`Generated detailed item pages with D2 formatting and unified set displays`);
}

/**
 * Generate HTML for item page
 */
function generateItemPageHtml(
  title: string,
  groupedItems: Record<string, any[]>,
  cssClass: string,
  modData: any
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body class="theme-dark">
    <header>
        <div class="container">
            <h1><a href="../index.html">D2 Mod Wiki</a></h1>
            <nav>
                <a href="../index.html">Home</a>
                <a href="unique.html">Unique Items</a>
                <a href="sets.html">Set Items</a>
                <a href="../skills/index.html">Skills</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <h2>${title}</h2>
        
        <div class="items-grid-container">
            ${Object.entries(groupedItems).map(([name, variations]) => `
            <div class="item-column ${cssClass}">
                <div class="item-column-header">
                    <h3>${name}</h3>
                    <span class="variation-count">${variations.length} Variation${variations.length > 1 ? 's' : ''}</span>
                </div>
                
                <div class="variations-stack">
                    ${variations.map((item, index) => `
                    <div class="variation-card">
                        <div class="variation-header">
                            <span class="variation-label">Variation ${index + 1}</span>
                            <div class="item-summary">
                                <span class="item-type">${item.type || 'Unknown'}</span>
                                <span class="item-level">Req: ${item.lvlreq || item.lvl || '?'}</span>
                            </div>
                        </div>
                        
                        <div class="variation-stats">
                            <div class="properties-list">
                                ${(() => {
                                  const properties = formatItemProperties(item, modData);
                                  let html = '';
                                  
                                  // Individual properties section
                                  if (properties.individual.length > 0) {
                                    html += properties.individual.map(prop => 
                                      `<div class="property-item individual-property">${prop}</div>`
                                    ).join('');
                                  } else {
                                    html += '<div class="no-properties">No individual properties</div>';
                                  }
                                  
                                  // Set bonuses section
                                  const setBonusKeys = Object.keys(properties.setBonuses);
                                  if (setBonusKeys.length > 0) {
                                    html += '<div class="set-bonuses-divider"></div>';
                                    html += '<div class="set-bonuses-header">Set Bonuses:</div>';
                                    
                                    setBonusKeys.forEach(pieceCount => {
                                      const bonuses = properties.setBonuses[pieceCount];
                                      if (bonuses.length > 0) {
                                        html += `<div class="set-bonus-group">`;
                                        html += `<div class="set-bonus-label">${pieceCount}:</div>`;
                                        html += bonuses.map(bonus => 
                                          `<div class="property-item set-bonus-property">${bonus}</div>`
                                        ).join('');
                                        html += `</div>`;
                                      }
                                    });
                                  }
                                  
                                  return html;
                                })()}
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            `).join('')}
        </div>
    </main>

    <script src="../assets/js/app.js"></script>
</body>
</html>`;
}

/**
 * Generate skill pages
 */
async function generateSkillPages(
  outputPath: string,
  skills: any[],
  logger: Logger
): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skills</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body class="theme-dark">
    <header>
        <div class="container">
            <h1><a href="../index.html">D2 Mod Wiki</a></h1>
            <nav>
                <a href="../index.html">Home</a>
                <a href="../items/unique.html">Unique Items</a>
                <a href="../items/sets.html">Set Items</a>
                <a href="index.html">Skills</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <h2>Skills</h2>
        <div class="skill-grid">
            ${skills.map(skill => `
            <div class="skill-card">
                <h4>${skill.skill || 'Unknown Skill'}</h4>
                <div class="skill-info">
                    <div>Class: ${skill.charclass || 'Unknown'}</div>
                    <div>Level Req: ${skill.reqlevel || 'Unknown'}</div>
                </div>
            </div>
            `).join('')}
        </div>
    </main>

    <script src="../assets/js/app.js"></script>
</body>
</html>`;

  await fs.writeFile(path.join(outputPath, 'skills', 'index.html'), html);
  logger.success(`Generated skills page`);
}

/**
 * Generate enhanced CSS
 */
async function generateEnhancedCSS(outputPath: string, theme: string): Promise<void> {
  const css = `/* D2 Mod Wiki Enhanced Styles */
:root {
    --bg-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
    --text-color: ${theme === 'dark' ? '#e0e0e0' : '#333333'};
    --accent-color: #d4af37;
    --border-color: ${theme === 'dark' ? '#333333' : '#dddddd'};
    --card-bg: ${theme === 'dark' ? '#2a2a2a' : '#f8f8f8'};
    --header-bg: linear-gradient(135deg, #8B4513, #CD853F);
    --property-color: ${theme === 'dark' ? '#ffd700' : '#b8860b'};
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    line-height: 1.6;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

header {
    background: var(--header-bg);
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

header h1 { margin: 0; font-size: 2rem; }
header h1 a { color: white; text-decoration: none; }

nav { margin-top: 0.5rem; }
nav a {
    color: white;
    text-decoration: none;
    margin-right: 1.5rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}
nav a:hover { background-color: rgba(255,255,255,0.2); }

main { padding: 2rem 0; }
h2 { color: var(--accent-color); margin-bottom: 1.5rem; font-size: 2rem; }

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    text-align: center;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--accent-color);
    display: block;
    margin: 0.5rem 0;
}

.items-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    align-items: start;
}

.item-column {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
}

.item-column-header {
    background: var(--header-bg);
    color: white;
    padding: 1rem;
    text-align: center;
}

.item-column-header h3 {
    margin: 0 0 0.5rem 0;
    color: white;
    font-size: 1.2rem;
}

.variation-count {
    background: rgba(255,255,255,0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
}

.variations-stack { display: flex; flex-direction: column; }

.variation-card {
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-color);
}

.variation-card:last-child { border-bottom: none; }

.variation-header {
    background: ${theme === 'dark' ? '#1e1e1e' : '#f0f0f0'};
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

.variation-label {
    font-weight: bold;
    color: var(--accent-color);
    display: block;
    margin-bottom: 0.25rem;
}

.item-summary {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    opacity: 0.8;
}

.variation-stats { padding: 1rem; }

.properties-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.property-item {
    background: ${theme === 'dark' ? '#2a2a2a' : '#f5f5f5'};
    padding: 0.5rem;
    border-radius: 4px;
    border-left: 3px solid var(--accent-color);
    font-size: 0.9rem;
    color: var(--property-color);
    cursor: pointer;
    transition: background-color 0.2s;
}

.property-item:hover {
    background: ${theme === 'dark' ? '#333333' : '#e8e8e8'};
}

.individual-property {
  border-left: 3px solid var(--accent-color);
}

.set-bonuses-divider {
  margin: 0.75rem 0 0.5rem 0;
  height: 1px;
  background: var(--border-color);
}

.set-bonuses-header {
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.set-bonus-group {
  margin-bottom: 0.75rem;
}

.set-bonus-label {
  font-weight: bold;
  color: ${theme === 'dark' ? '#90EE90' : '#228B22'};
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.set-bonus-property {
  border-left: 3px solid ${theme === 'dark' ? '#90EE90' : '#228B22'};
  background: ${theme === 'dark' ? '#1a2f1a' : '#f0f8f0'};
  margin-left: 0.5rem;
  margin-bottom: 0.25rem;
}

.set-bonus-property:hover {
  background: ${theme === 'dark' ? '#234f23' : '#e8f5e8'};
}

.skill-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.skill-card {
    background: var(--card-bg);
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
}

.skill-card h4 { color: var(--accent-color); margin-bottom: 0.5rem; }

.skill-info { font-size: 0.9rem; }
.skill-info div { margin: 0.25rem 0; color: var(--property-color); }

.unique-item { border-left: 4px solid #8B4513; }
.set-item { border-left: 4px solid #228B22; }

@media (max-width: 768px) {
    .container { padding: 0 15px; }
    .stats-grid, .items-grid-container, .skill-grid { grid-template-columns: 1fr; }
    header h1 { font-size: 1.5rem; }
    h2 { font-size: 1.5rem; }
}`;

  await fs.writeFile(path.join(outputPath, 'assets', 'css', 'style.css'), css);
}

/**
 * Generate enhanced JavaScript
 */
async function generateEnhancedJS(outputPath: string): Promise<void> {
  const js = `// D2 Mod Wiki Enhanced JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('D2 Mod Wiki with authentic D2 formatting loaded!');
    
    // Add copy-to-clipboard for properties
    document.querySelectorAll('.property-item').forEach(property => {
        property.addEventListener('click', function() {
            navigator.clipboard.writeText(this.textContent).then(() => {
                const original = this.style.backgroundColor;
                this.style.backgroundColor = 'var(--accent-color)';
                setTimeout(() => {
                    this.style.backgroundColor = original;
                }, 200);
            });
        });
        property.title = 'Click to copy property';
    });
});`;

  await fs.writeFile(path.join(outputPath, 'assets', 'js', 'app.js'), js);
} 

/**
 * Group set items by actual set name and create unified set displays
 */
function groupSetsByName(setItems: any[], setDefinitions: any[]): Record<string, { 
  setName: string, 
  pieces: any[], 
  definition?: any 
}> {
  const grouped: Record<string, { setName: string, pieces: any[], definition?: any }> = {};
  
  // Create lookup for set definitions
  const setDefLookup = new Map<string, any>();
  for (const setDef of setDefinitions) {
    setDefLookup.set(setDef.index || setDef.name, setDef);
  }
  
  // Group items by their set field
  for (const item of setItems) {
    const setName = item.set || item.index; // Use the 'set' field which contains the set name
    if (!setName || setName.trim() === '') continue;
    
    if (!grouped[setName]) {
      grouped[setName] = {
        setName,
        pieces: [],
        definition: setDefLookup.get(setName)
      };
    }
    
    grouped[setName].pieces.push(item);
  }
  
  return grouped;
}

/**
 * Generate unified set items page with complete set information and progressive bonuses
 */
function generateSetItemsPage(
  groupedSetsData: Record<string, { setName: string, pieces: any[], definition?: any }>,
  modData: any,
  theme: string
): string {
  // Format set bonus properties using the same logic as individual properties
  const formatSetBonusProperties = (setDef: any, pieceCount: number): string[] => {
    if (!setDef) return [];
    
    const propertiesWithPriority: Array<{ text: string, priority: number }> = [];
    const parseNumericValue = (value: any): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined;
      if (typeof value === 'number') return isNaN(value) ? undefined : value;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '' || trimmed === 'NaN') return undefined;
        const parsed = parseInt(trimmed, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      return undefined;
    };

    // Helper function to get stat priority from ItemStatCost.json
    const getStatPriority = (prop: string): number => {
      if (!modData?.propertiesLookup || !modData?.itemStatCostLookup) {
        return 0; // Default priority
      }
      
      try {
        const propertyData = modData.propertiesLookup[prop];
        if (propertyData && propertyData.stat1) {
          const statName = propertyData.stat1;
          const statCostData = modData.itemStatCostLookup[statName];
          if (statCostData && statCostData.descpriority !== undefined) {
            const priority = parseInt(statCostData.descpriority) || 0;
            return priority;
          }
        }
      } catch (error) {
        // Fallback to 0 if lookup fails
      }
      
      return 0; // Default priority for unknown stats
    };
    
    // Define which fields to check based on piece count
    let codeFields: string[] = [];
    let paramFields: string[] = [];
    let minFields: string[] = [];
    let maxFields: string[] = [];
    
    if (pieceCount === 2) {
      codeFields = ['PCode2a', 'PCode2b'];
      paramFields = ['PParam2a', 'PParam2b'];
      minFields = ['PMin2a', 'PMin2b'];
      maxFields = ['PMax2a', 'PMax2b'];
    } else if (pieceCount === 3) {
      codeFields = ['PCode3a', 'PCode3b'];
      paramFields = ['PParam3a', 'PParam3b'];
      minFields = ['PMin3a', 'PMin3b'];
      maxFields = ['PMax3a', 'PMax3b'];
    } else if (pieceCount === 4) {
      codeFields = ['PCode4a', 'PCode4b'];
      paramFields = ['PParam4a', 'PParam4b'];
      minFields = ['PMin4a', 'PMin4b'];
      maxFields = ['PMax4a', 'PMax4b'];
    } else if (pieceCount === 5) {
      codeFields = ['PCode5a', 'PCode5b'];
      paramFields = ['PParam5a', 'PParam5b'];
      minFields = ['PMin5a', 'PMin5b'];
      maxFields = ['PMax5a', 'PMax5b'];
    } else if (pieceCount >= 6) {
      // Full set bonuses (FCode1-8)
      codeFields = ['FCode1', 'FCode2', 'FCode3', 'FCode4', 'FCode5', 'FCode6', 'FCode7', 'FCode8'];
      paramFields = ['FParam1', 'FParam2', 'FParam3', 'FParam4', 'FParam5', 'FParam6', 'FParam7', 'FParam8'];
      minFields = ['FMin1', 'FMin2', 'FMin3', 'FMin4', 'FMin5', 'FMin6', 'FMin7', 'FMin8'];
      maxFields = ['FMax1', 'FMax2', 'FMax3', 'FMax4', 'FMax5', 'FMax6', 'FMax7', 'FMax8'];
    }
    
    // Process each bonus property
    for (let i = 0; i < codeFields.length; i++) {
      const prop = setDef[codeFields[i]];
      const par = setDef[paramFields[i]];
      const min = parseNumericValue(setDef[minFields[i]]);
      const max = parseNumericValue(setDef[maxFields[i]]);
      
      if (prop && prop.trim() !== '' && (min !== undefined || max !== undefined)) {
        const minVal = min ?? 0;
        const maxVal = max ?? min ?? 0;
        const formattedProperty = formatProperty(prop, par, minVal, maxVal, modData);
        if (formattedProperty) {
          const priority = getStatPriority(prop);
          propertiesWithPriority.push({ text: formattedProperty, priority });
        }
      }
    }
    
    // Sort by priority (higher priority first), maintaining file order for equal priorities
    propertiesWithPriority.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return 0; // Maintain original order for equal priorities
    });
    
    return propertiesWithPriority.map(p => p.text);
  };

  // Enhanced function to get individual piece bonuses for specific piece counts
  const getIndividualPieceBonuses = (pieces: any[], pieceCount: number): Record<string, string[]> => {
    const pieceBonuses: Record<string, string[]> = {};
    
    const parseNumericValue = (value: any): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined;
      if (typeof value === 'number') return isNaN(value) ? undefined : value;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '' || trimmed === 'NaN') return undefined;
        const parsed = parseInt(trimmed, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      return undefined;
    };
    
    // Helper function to get stat priority from ItemStatCost.json
    const getStatPriority = (prop: string): number => {
      if (!modData?.propertiesLookup || !modData?.itemStatCostLookup) {
        return 0; // Default priority
      }
      
      try {
        const propertyData = modData.propertiesLookup[prop];
        if (propertyData && propertyData.stat1) {
          const statName = propertyData.stat1;
          const statCostData = modData.itemStatCostLookup[statName];
          if (statCostData && statCostData.descpriority !== undefined) {
            const priority = parseInt(statCostData.descpriority) || 0;
            return priority;
          }
        }
      } catch (error) {
        // Fallback to 0 if lookup fails
      }
      
      return 0; // Default priority for unknown stats
    };
    
    // Determine which suffix to check based on piece count
    // Typically: 'a' = 2-piece, 'b' = 3-piece, etc.
    // But some mods use different conventions, so we'll check multiple patterns
    const suffixes = pieceCount === 2 ? ['a'] : 
                    pieceCount === 3 ? ['b'] : 
                    pieceCount === 4 ? ['c'] : 
                    pieceCount === 5 ? ['d'] : 
                    ['e', 'f', 'g', 'h']; // Full set bonuses might use various suffixes
    
    for (const piece of pieces) {
      const pieceName = piece.name || piece.index;
      const bonusesWithPriority: Array<{ text: string, priority: number }> = [];
      
      // Check each possible suffix for this piece count
      for (const suffix of suffixes) {
        // Check up to 5 bonus property slots (aprop1a-aprop5a, etc.)
        for (let i = 1; i <= 5; i++) {
          const prop = piece[`aprop${i}${suffix}`];
          const par = piece[`apar${i}${suffix}`];
          const min = parseNumericValue(piece[`amin${i}${suffix}`]);
          const max = parseNumericValue(piece[`amax${i}${suffix}`]);
          
          if (prop && prop.trim() !== '' && (min !== undefined || max !== undefined)) {
            const minVal = min ?? 0;
            const maxVal = max ?? min ?? 0;
            const formattedProperty = formatProperty(prop, par, minVal, maxVal, modData);
            if (formattedProperty && !bonusesWithPriority.some(b => b.text === formattedProperty)) {
              const priority = getStatPriority(prop);
              bonusesWithPriority.push({ text: formattedProperty, priority });
            }
          }
        }
      }
      
      // Sort by priority (higher priority first), maintaining file order for equal priorities
      bonusesWithPriority.sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return 0; // Maintain original order for equal priorities
      });
      
      // Only add this piece if it has bonuses for this piece count
      if (bonusesWithPriority.length > 0) {
        pieceBonuses[pieceName] = bonusesWithPriority.map(b => b.text);
      }
    }
    
    return pieceBonuses;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Set Items</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .set-card {
            background: var(--card-background);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin: 1rem 0;
            padding: 1.5rem;
        }
        
        .set-header {
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .set-name {
            font-size: 1.8rem;
            font-weight: bold;
            color: var(--accent-color);
            margin-bottom: 0.5rem;
        }
        
        .set-info {
            color: var(--text-muted);
            font-size: 0.9rem;
        }
        
        .set-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        
        .set-pieces {
            border-right: 1px solid var(--border-color);
            padding-right: 2rem;
        }
        
        .set-bonuses {
            padding-left: 2rem;
        }
        
        .section-title {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--accent-color);
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .piece-item {
            background: var(--background-color);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 1rem;
            margin-bottom: 0.75rem;
        }
        
        .piece-name {
            font-weight: bold;
            color: var(--text-color);
            margin-bottom: 0.5rem;
        }
        
        .piece-properties {
            font-size: 0.9rem;
            margin-bottom: 0.75rem;
        }
        
        .property-item {
            padding: 0.1rem 0;
            color: var(--text-muted);
        }

        .piece-set-bonuses {
            border-top: 1px solid var(--border-color);
            padding-top: 0.75rem;
            margin-top: 0.75rem;
        }

        .piece-bonus-section {
            margin-bottom: 0.5rem;
        }

        .piece-bonus-count {
            font-weight: bold;
            color: ${theme === 'dark' ? '#90EE90' : '#228B22'};
            font-size: 0.85rem;
            margin-bottom: 0.25rem;
        }

        .piece-bonus-item {
            color: ${theme === 'dark' ? '#90EE90' : '#228B22'};
            font-size: 0.8rem;
            padding: 0.1rem 0;
            margin-left: 0.5rem;
        }
        
        .bonus-level {
            background: var(--background-color);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 1rem;
            margin-bottom: 0.75rem;
        }
        
        .bonus-header {
            font-weight: bold;
            color: ${theme === 'dark' ? '#90EE90' : '#228B22'};
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        
        .bonus-property {
            padding: 0.1rem 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .set-wide-bonus {
            background: ${theme === 'dark' ? '#1a2a1a' : '#f0f8f0'};
            border-left: 3px solid ${theme === 'dark' ? '#90EE90' : '#228B22'};
            padding: 0.25rem 0.5rem;
            margin: 0.1rem 0;
            border-radius: 2px;
        }
        
        @media (max-width: 768px) {
            .set-content {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .set-pieces {
                border-right: none;
                padding-right: 0;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 1rem;
            }
            
            .set-bonuses {
                padding-left: 0;
                padding-top: 1rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1><a href="../index.html">D2 Mod Wiki</a></h1>
            <nav>
                <a href="../index.html">Home</a>
                <a href="unique.html">Unique Items</a>
                <a href="sets.html">Set Items</a>
                <a href="../skills/index.html">Skills</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <h2>Set Items</h2>
        <p style="margin-bottom: 2rem; color: var(--text-muted);">Complete set collections with progressive bonuses</p>
        <div class="items-grid">
            ${Object.entries(groupedSetsData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([setName, setData]) => {
                const setDef = setData.definition;
                const pieces = setData.pieces;
                const pieceCount = pieces.length;
                
                return `
                <div class="set-card">
                    <div class="set-header">
                        <div class="set-name">${setName}</div>
                        <div class="set-info">${pieceCount} pieces</div>
                    </div>
                    
                    <div class="set-content">
                        <div class="set-pieces">
                            <div class="section-title">Set Pieces</div>
                            ${pieces.map(piece => {
                              const properties = formatItemProperties(piece, modData);
                              const pieceName = piece.name || piece.index;
                              
                              return `
                                <div class="piece-item">
                                    <div class="piece-name">${pieceName}</div>
                                    ${properties.individual.length > 0 ? `
                                        <div class="piece-properties">
                                            ${properties.individual.map(prop => 
                                              `<div class="property-item">${prop}</div>`
                                            ).join('')}
                                        </div>
                                    ` : ''}
                                    
                                    ${(() => {
                                      // Get piece-specific bonuses for each piece count
                                      let pieceBonusHtml = '';
                                      
                                      for (let count = 2; count <= Math.max(6, pieceCount); count++) {
                                        const individualPieceBonuses = getIndividualPieceBonuses([piece], count);
                                        const bonuses = individualPieceBonuses[pieceName];
                                        
                                        if (bonuses && bonuses.length > 0) {
                                          const label = count >= 6 ? 'Full Set' : `${count} pieces`;
                                          pieceBonusHtml += `
                                            <div class="piece-bonus-section">
                                              <div class="piece-bonus-count">${label}:</div>
                                              ${bonuses.map(bonus => 
                                                `<div class="piece-bonus-item">${bonus}</div>`
                                              ).join('')}
                                            </div>
                                          `;
                                        }
                                      }
                                      
                                      return pieceBonusHtml ? `<div class="piece-set-bonuses">${pieceBonusHtml}</div>` : '';
                                    })()}
                                </div>
                              `;
                            }).join('')}
                        </div>
                        
                        <div class="set-bonuses">
                            <div class="section-title">Set Bonuses</div>
                            ${(() => {
                              const bonusLevels = [];
                              
                              // Generate only set-wide bonuses (not individual piece bonuses)
                              for (let count = 2; count <= Math.max(6, pieceCount); count++) {
                                // Get only set-wide bonuses from sets.txt
                                const setWideBonuses = setDef ? formatSetBonusProperties(setDef, count) : [];
                                
                                // Only show this level if there are set-wide bonuses
                                if (setWideBonuses.length > 0) {
                                  const label = count >= 6 ? 'Full Set' : `${count} pieces`;
                                  
                                  bonusLevels.push(`
                                    <div class="bonus-level">
                                        <div class="bonus-header">${label}</div>
                                        ${setWideBonuses.map(bonus => 
                                          `<div class="set-wide-bonus">${bonus}</div>`
                                        ).join('')}
                                    </div>
                                  `);
                                }
                              }
                              
                              return bonusLevels.length > 0 ? bonusLevels.join('') : 
                                '<div class="bonus-level"><div class="bonus-property">No general set bonuses available</div></div>';
                            })()}
                        </div>
                    </div>
                </div>
                `;
              }).join('')}
        </div>
    </main>

    <script src="../assets/js/app.js"></script>
</body>
</html>
  `.trim();
}



