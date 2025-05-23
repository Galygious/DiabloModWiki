/**
 * Main Mod Data Parser
 * 
 * Orchestrates all individual parsers to create complete mod data structure
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';

import { 
  ParsedModData, 
  D2ModInfo, 
  UniqueItem, 
  SetItem, 
  SetDefinition,
  ArmorItem, 
  WeaponItem, 
  Skill, 
  Monster, 
  Gem,
  ItemNames,
  SkillNames,
  MonsterNames,
  ParseError,
  ValidationResult
} from '@/types';

import { parseUniqueItems } from './unique-items-parser.js';
import { parseLocalizationJSON } from './json-parser.js';
import { parseTSV, createD2TypeConverters } from './tsv-parser.js';

export interface ModParseOptions {
  /** Validate all parsed data */
  validateData?: boolean;
  /** Include detailed error information */
  includeDetailedErrors?: boolean;
  /** Skip missing files without error */
  skipMissingFiles?: boolean;
  /** Custom file patterns to look for */
  customFilePatterns?: Record<string, string>;
  /** Enable verbose logging */
  verbose?: boolean;
}

export interface ModParseResult {
  /** Parsed mod data */
  data: ParsedModData;
  /** Parse errors from all files */
  errors: ParseError[];
  /** Validation result */
  validation: ValidationResult;
  /** Statistics */
  stats: {
    filesProcessed: number;
    totalErrors: number;
    totalWarnings: number;
    parseTime: number;
  };
}

// Parser function type for consistent interface
type ParserFunction<T> = (content: string, filename: string) => { 
  data: T[]; 
  errors: ParseError[]; 
};

/**
 * Parses a complete D2 mod directory structure
 */
export async function parseModData(
  modPath: string,
  options: ModParseOptions = {}
): Promise<ModParseResult> {
  const startTime = Date.now();
  const {
    validateData = true,
    includeDetailedErrors = true,
    skipMissingFiles = true,
    customFilePatterns = {},
    verbose = false,
  } = options;

  const errors: ParseError[] = [];
  let filesProcessed = 0;

  // Default file patterns
  const filePatterns = {
    modInfo: 'modinfo.json',
    uniqueItems: '**/uniqueitems.txt',
    setItems: '**/setitems.txt',
    setDefinitions: '**/sets.txt',
    armor: '**/armor.txt',
    weapons: '**/weapons.txt',
    skills: '**/skills.txt',
    monsters: '**/monstats.txt',
    monstersHD: '**/monsters.json',
    gems: '**/gems.txt',
    itemNames: '**/item-names.json',
    skillNames: '**/skill-names.json',
    monsterNames: '**/monster-names.json',
    ...customFilePatterns,
  };

  // Initialize data structure
  const data: ParsedModData = {
    modInfo: {
      name: '',
      version: '',
      author: '',
      description: '',
      generatedBy: '',
      generatedAt: '',
    },
    uniqueItems: [],
    setItems: [],
    setDefinitions: [],
    armor: [],
    weapons: [],
    skills: [],
    monsters: [],
    gems: [],
    itemNames: {},
    skillNames: {},
    monsterNames: {},
    skillLookup: {},
    skillTabLookup: {},
    skillDescLookup: {},
    itemTypeLookup: {},
    itemModifierLookup: {},
    propertiesLookup: {},
    itemStatCostLookup: {},
  };

  try {
    // Ensure mod path exists
    if (!(await fs.pathExists(modPath))) {
      errors.push({
        file: modPath,
        message: `Mod directory does not exist: ${modPath}`,
        type: 'fatal',
      });
      
      return {
        data,
        errors,
        validation: { valid: false, errors, warnings: [] },
        stats: {
          filesProcessed: 0,
          totalErrors: 1,
          totalWarnings: 0,
          parseTime: Date.now() - startTime,
        },
      };
    }

    if (verbose) {
      console.log(`Parsing mod data from: ${modPath}`);
    }

    // Parse mod info
    const modInfoResult = await parseModInfo(modPath, filePatterns.modInfo, skipMissingFiles);
    if (modInfoResult.data) {
      data.modInfo = modInfoResult.data;
    }
    errors.push(...modInfoResult.errors);
    if (modInfoResult.processed) filesProcessed++;

    // Create wrapper for unique items parser
    const uniqueItemsParser: ParserFunction<UniqueItem> = (content, filename) => {
      const result = parseUniqueItems(content, filename, {
        validateData,
        includeDetailedErrors
      });
      return {
        data: result.items,
        errors: result.errors,
      };
    };

    // Parse unique items
    const uniqueItemsResult = await parseFileType<UniqueItem>(
      modPath,
      filePatterns.uniqueItems,
      uniqueItemsParser,
      skipMissingFiles,
      verbose
    );
    data.uniqueItems = uniqueItemsResult.data;
    errors.push(...uniqueItemsResult.errors);
    if (uniqueItemsResult.processed) filesProcessed++;

    // Parse set items
    const setItemsResult = await parseFileType<SetItem>(
      modPath,
      filePatterns.setItems,
      (content, filename) => parseTSV<SetItem>(content, filename, {
        typeConverters: createD2TypeConverters(),
        skipLinesStartingWith: ['#', '//', 'Expansion'],
      }),
      skipMissingFiles,
      verbose
    );
    data.setItems = setItemsResult.data;
    errors.push(...setItemsResult.errors);
    if (setItemsResult.processed) filesProcessed++;

    // Parse set definitions
    const setDefinitionsResult = await parseFileType<SetDefinition>(
      modPath,
      filePatterns.setDefinitions,
      (content, filename) => parseTSV<SetDefinition>(content, filename, {
        typeConverters: createD2TypeConverters(),
        skipLinesStartingWith: ['#', '//', 'Expansion'],
      }),
      skipMissingFiles,
      verbose
    );
    data.setDefinitions = setDefinitionsResult.data;
    errors.push(...setDefinitionsResult.errors);
    if (setDefinitionsResult.processed) filesProcessed++;

    // Parse armor
    const armorResult = await parseFileType<ArmorItem>(
      modPath,
      filePatterns.armor,
      (content, filename) => parseTSV<ArmorItem>(content, filename, {
        typeConverters: createD2TypeConverters(),
        skipLinesStartingWith: ['#', '//', 'Expansion'],
      }),
      skipMissingFiles,
      verbose
    );
    data.armor = armorResult.data;
    errors.push(...armorResult.errors);
    if (armorResult.processed) filesProcessed++;

    // Parse weapons
    const weaponsResult = await parseFileType<WeaponItem>(
      modPath,
      filePatterns.weapons,
      (content, filename) => parseTSV<WeaponItem>(content, filename, {
        typeConverters: createD2TypeConverters(),
        skipLinesStartingWith: ['#', '//', 'Expansion'],
      }),
      skipMissingFiles,
      verbose
    );
    data.weapons = weaponsResult.data;
    errors.push(...weaponsResult.errors);
    if (weaponsResult.processed) filesProcessed++;

    // Parse skills
    const skillsResult = await parseFileType<Skill>(
      modPath,
      filePatterns.skills,
      (content, filename) => parseTSV<Skill>(content, filename, {
        typeConverters: createD2TypeConverters(),
        skipLinesStartingWith: ['#', '//', 'Expansion'],
      }),
      skipMissingFiles,
      verbose
    );
    data.skills = skillsResult.data;
    errors.push(...skillsResult.errors);
    if (skillsResult.processed) filesProcessed++;

    // Parse monsters (TSV format)
    const monstersResult = await parseFileType<Monster>(
      modPath,
      filePatterns.monsters,
      (content, filename) => parseTSV<Monster>(content, filename, {
        typeConverters: createD2TypeConverters(),
        skipLinesStartingWith: ['#', '//', 'Expansion'],
      }),
      skipMissingFiles,
      verbose
    );
    
    // Note: Skip monstersHD for now since it would require different handling
    // The JSON monsters format would need a different parser interface
    
    data.monsters = monstersResult.data;
    errors.push(...monstersResult.errors);
    if (monstersResult.processed) filesProcessed++;

    // Parse gems
    const gemsResult = await parseFileType<Gem>(
      modPath,
      filePatterns.gems,
      (content, filename) => parseTSV<Gem>(content, filename, {
        typeConverters: createD2TypeConverters(),
        skipLinesStartingWith: ['#', '//', 'Expansion'],
      }),
      skipMissingFiles,
      verbose
    );
    data.gems = gemsResult.data;
    errors.push(...gemsResult.errors);
    if (gemsResult.processed) filesProcessed++;

    // Parse localization files
    const itemNamesResult = await parseLocalizationFile(
      modPath,
      filePatterns.itemNames,
      skipMissingFiles,
      verbose
    );
    data.itemNames = itemNamesResult.data;
    errors.push(...itemNamesResult.errors);
    if (itemNamesResult.processed) filesProcessed++;

    const skillNamesResult = await parseLocalizationFile(
      modPath,
      filePatterns.skillNames,
      skipMissingFiles,
      verbose
    );
    data.skillNames = skillNamesResult.data;
    errors.push(...skillNamesResult.errors);
    if (skillNamesResult.processed) filesProcessed++;

    const monsterNamesResult = await parseLocalizationFile(
      modPath,
      filePatterns.monsterNames,
      skipMissingFiles,
      verbose
    );
    data.monsterNames = monsterNamesResult.data;
    errors.push(...monsterNamesResult.errors);
    if (monsterNamesResult.processed) filesProcessed++;

    // Build skill lookups
    try {
      // Build skill ID -> skill name lookup from parsed skills
      data.skillLookup = buildSkillLookup(data.skills);
      
      // Load skill tab lookup from reference file
      data.skillTabLookup = await loadSkillTabLookup();
      
      // Load skill description lookup from reference file
      data.skillDescLookup = await loadSkillDescLookup();
      
      // Load item type lookup from reference file
      data.itemTypeLookup = await loadItemTypeLookup();
      
      // Load item modifier lookup from reference file
      data.itemModifierLookup = await loadItemModifierLookup();
      
      // Load properties lookup from reference file
      data.propertiesLookup = await loadPropertiesLookup();
      
      // Load item stat cost lookup from reference file  
      data.itemStatCostLookup = await loadItemStatCostLookup();
    } catch (lookupError) {
      errors.push({
        file: 'lookup-data',
        message: `Failed to build lookup data: ${lookupError}`,
        type: 'warning',
      });
    }

  } catch (globalError) {
    errors.push({
      file: modPath,
      message: `Global parsing error: ${globalError}`,
      type: 'fatal',
    });
  }

  // Validate parsed data
  let validation: ValidationResult = { valid: true, errors: [], warnings: [] };
  if (validateData) {
    validation = validateParsedData(data);
    errors.push(...validation.errors, ...validation.warnings);
  }

  // Calculate statistics
  const totalErrors = errors.filter(e => e.type === 'error' || e.type === 'fatal').length;
  const totalWarnings = errors.filter(e => e.type === 'warning').length;

  const result: ModParseResult = {
    data,
    errors: includeDetailedErrors ? errors : errors.filter(e => e.type !== 'warning'),
    validation,
    stats: {
      filesProcessed,
      totalErrors,
      totalWarnings,
      parseTime: Date.now() - startTime,
    },
  };

  if (verbose) {
    console.log(`Parsing completed in ${result.stats.parseTime}ms`);
    console.log(`Files processed: ${filesProcessed}, Errors: ${totalErrors}, Warnings: ${totalWarnings}`);
  }

  return result;
}

/**
 * Helper function to parse specific file types
 */
async function parseFileType<T>(
  modPath: string,
  pattern: string,
  parser: ParserFunction<T>,
  skipMissingFiles: boolean,
  verbose: boolean
): Promise<{ data: T[]; errors: ParseError[]; processed: boolean }> {
  try {
    const files = glob.sync(pattern, { cwd: modPath });
    const absoluteFiles = files.map(file => path.resolve(modPath, file));
    
    if (files.length === 0) {
      if (skipMissingFiles) {
        return { data: [], errors: [], processed: false };
      } else {
        return {
          data: [],
          errors: [{
            file: pattern,
            message: `No files found matching pattern: ${pattern}`,
            type: 'warning',
          }],
          processed: false,
        };
      }
    }

    const allData: T[] = [];
    const allErrors: ParseError[] = [];

    for (const file of absoluteFiles) {
      if (verbose) {
        console.log(`  Parsing: ${path.relative(modPath, file)}`);
      }

      try {
        const content = await fs.readFile(file, 'utf-8');
        const filename = path.relative(modPath, file);
        const result = parser(content, filename);
        
        allData.push(...result.data);
        allErrors.push(...result.errors);
      } catch (fileError) {
        allErrors.push({
          file: path.relative(modPath, file),
          message: `Failed to read file: ${fileError}`,
          type: 'error',
        });
      }
    }

    return { data: allData, errors: allErrors, processed: true };

  } catch (globError) {
    return {
      data: [],
      errors: [{
        file: pattern,
        message: `Failed to search for files: ${globError}`,
        type: 'error',
      }],
      processed: false,
    };
  }
}

/**
 * Parse mod info file
 */
async function parseModInfo(
  modPath: string,
  pattern: string,
  skipMissingFiles: boolean
): Promise<{ data: D2ModInfo | null; errors: ParseError[]; processed: boolean }> {
  try {
    const files = glob.sync(pattern, { cwd: modPath });
    const absoluteFiles = files.map(file => path.resolve(modPath, file));
    
    if (files.length === 0) {
      const error = {
        file: pattern,
        message: `Mod info file not found: ${pattern}`,
        type: skipMissingFiles ? 'warning' as const : 'error' as const,
      };
      return { data: null, errors: [error], processed: false };
    }

    const file = absoluteFiles[0]; // Use first match
    const content = await fs.readFile(file, 'utf-8');
    const filename = path.relative(modPath, file);
    
    const result = parseLocalizationJSON(content, filename);
    
    if (result.success && result.data) {
      const modInfo: D2ModInfo = {
        name: result.data.name || '',
        version: result.data.version || '',
        author: result.data.author,
        description: result.data.description,
        generatedBy: result.data.generatedBy,
        generatedAt: result.data.generatedAt,
      };
      return { data: modInfo, errors: result.errors, processed: true };
    } else {
      return { data: null, errors: result.errors, processed: true };
    }

  } catch (error) {
    return {
      data: null,
      errors: [{
        file: pattern,
        message: `Failed to parse mod info: ${error}`,
        type: 'error',
      }],
      processed: false,
    };
  }
}

/**
 * Parse localization file
 */
async function parseLocalizationFile(
  modPath: string,
  pattern: string,
  skipMissingFiles: boolean,
  verbose: boolean
): Promise<{ data: Record<string, string>; errors: ParseError[]; processed: boolean }> {
  try {
    const files = glob.sync(pattern, { cwd: modPath });
    const absoluteFiles = files.map(file => path.resolve(modPath, file));
    
    if (files.length === 0) {
      if (skipMissingFiles) {
        return { data: {}, errors: [], processed: false };
      } else {
        return {
          data: {},
          errors: [{
            file: pattern,
            message: `No localization files found: ${pattern}`,
            type: 'warning',
          }],
          processed: false,
        };
      }
    }

    const allData: Record<string, string> = {};
    const allErrors: ParseError[] = [];

    for (const file of absoluteFiles) {
      if (verbose) {
        console.log(`  Parsing: ${path.relative(modPath, file)}`);
      }

      try {
        const content = await fs.readFile(file, 'utf-8');
        const filename = path.relative(modPath, file);
        const result = parseLocalizationJSON(content, filename);
        
        if (result.success && result.data) {
          Object.assign(allData, result.data);
        }
        
        allErrors.push(...result.errors);
      } catch (fileError) {
        allErrors.push({
          file: path.relative(modPath, file),
          message: `Failed to read localization file: ${fileError}`,
          type: 'error',
        });
      }
    }

    return { data: allData, errors: allErrors, processed: true };

  } catch (globError) {
    return {
      data: {},
      errors: [{
        file: pattern,
        message: `Failed to search for localization files: ${globError}`,
        type: 'error',
      }],
      processed: false,
    };
  }
}

/**
 * Validates parsed mod data for consistency and completeness
 */
function validateParsedData(data: ParsedModData): ValidationResult {
  const errors: ParseError[] = [];
  const warnings: ParseError[] = [];

  // Basic data presence checks
  if (data.uniqueItems.length === 0) {
    warnings.push({
      file: 'validation',
      message: 'No unique items found',
      type: 'warning',
    });
  }

  if (data.skills.length === 0) {
    warnings.push({
      file: 'validation',
      message: 'No skills found',
      type: 'warning',
    });
  }

  // Check for localization coverage
  const itemsWithoutNames = data.uniqueItems.filter(item => 
    item.name && !data.itemNames[item.name]);
  
  if (itemsWithoutNames.length > 0) {
    warnings.push({
      file: 'validation',
      message: `${itemsWithoutNames.length} unique items have no localization entries`,
      type: 'warning',
    });
  }

  // Cross-reference validation could go here
  // (e.g., check that item types exist in armor/weapons tables)

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
  };
}

/**
 * Builds skill ID to skill name lookup from parsed skills data
 */
function buildSkillLookup(skills: Skill[]): Record<string, string> {
  const lookup: Record<string, string> = {};
  
  for (const skill of skills) {
    // Use the skill ID and skill name from the skills data
    // The ID field is actually '*Id' in the parsed data
    const skillId = (skill as any)['*Id'] || skill.Id;
    const skillName = skill.skill;
    
    if (skillId !== undefined && skillName) {
      lookup[skillId.toString()] = skillName;
    }
  }
  
  return lookup;
}

/**
 * Loads skill tab lookup from reference skilltabs.json file
 */
async function loadSkillTabLookup(): Promise<Record<string, string>> {
  try {
    // Try multiple possible paths for the JSON files
    const possiblePaths = [
      path.resolve(__dirname, '..', 'data', 'skilltabs.json'),
      path.resolve(__dirname, '..', '..', 'src', 'data', 'skilltabs.json'),
      path.resolve(process.cwd(), 'src', 'data', 'skilltabs.json')
    ];
    
    for (const skillTabsPath of possiblePaths) {
      if (await fs.pathExists(skillTabsPath)) {
        const content = await fs.readFile(skillTabsPath, 'utf-8');
        const skillTabsData = JSON.parse(content);
        
        // Handle new array-based structure
        const lookup: Record<string, string> = {};
        
        if (skillTabsData.classes && skillTabsData.skills) {
          // New format: { classes: [...], skills: [[classIndex, skillName], ...] }
          skillTabsData.skills.forEach((skillEntry: [number, string], index: number) => {
            const [classIndex, skillTabName] = skillEntry;
            const className = skillTabsData.classes[classIndex] || `Class${classIndex}`;
            lookup[index.toString()] = `${skillTabName} (${className})`;
          });
        } else {
          // Fallback to old format if detected
          for (const className of Object.keys(skillTabsData)) {
            const classTabs = skillTabsData[className];
            for (const [tabId, tabName] of Object.entries(classTabs)) {
              lookup[tabId] = `${tabName} (${className})`;
            }
          }
        }
        
        return lookup;
      }
    }
  } catch (error) {
    // Fall back to empty lookup if file can't be loaded
    console.warn(`Could not load skill tabs reference: ${error}`);
  }
  
  return {};
}

/**
 * Loads skill description lookup from skilldesc.json file
 */
async function loadSkillDescLookup(): Promise<Record<string, any>> {
  try {
    const possiblePaths = [
      path.resolve(__dirname, '..', 'data', 'skilldesc.json'),
      path.resolve(__dirname, '..', '..', 'src', 'data', 'skilldesc.json'),
      path.resolve(process.cwd(), 'src', 'data', 'skilldesc.json')
    ];
    
    for (const skillDescPath of possiblePaths) {
      if (await fs.pathExists(skillDescPath)) {
        const content = await fs.readFile(skillDescPath, 'utf-8');
        const skillDescData = JSON.parse(content);
        
        // Create a lookup by skill ID (array index)
        const lookup: Record<string, any> = {};
        
        if (skillDescData.fields && skillDescData.rows) {
          // New array-based format: { fields: [...], rows: [[...], ...] }
          const fields = skillDescData.fields;
          const skillDescIndex = fields.indexOf('skilldesc');
          const strNameIndex = fields.indexOf('str name');
          const iconCelIndex = fields.indexOf('IconCel');
          const strShortIndex = fields.indexOf('str short');
          const strLongIndex = fields.indexOf('str long');
          
          skillDescData.rows.forEach((row: any[], index: number) => {
            const skilldesc = skillDescIndex >= 0 ? row[skillDescIndex] : '';
            if (skilldesc && skilldesc.trim() !== '') {
              lookup[index.toString()] = {
                name: skilldesc,
                stringName: strNameIndex >= 0 ? row[strNameIndex] || '' : '',
                iconCel: iconCelIndex >= 0 ? row[iconCelIndex] || 0 : 0,
                shortDesc: strShortIndex >= 0 ? row[strShortIndex] || '' : '',
                longDesc: strLongIndex >= 0 ? row[strLongIndex] || '' : ''
              };
            }
          });
        } else {
          // Fallback to old format if detected
          skillDescData.forEach((skill: any, index: number) => {
            if (skill.skilldesc && skill.skilldesc.trim() !== '') {
              lookup[index.toString()] = {
                name: skill.skilldesc,
                stringName: skill['str name'] || '',
                iconCel: skill.IconCel,
                shortDesc: skill['str short'] || '',
                longDesc: skill['str long'] || ''
              };
            }
          });
        }
        
        return lookup;
      }
    }
  } catch (error) {
    console.warn(`Could not load skill descriptions: ${error}`);
  }
  
  return {};
}

/**
 * Loads item type lookup from itemtypes.json file
 */
async function loadItemTypeLookup(): Promise<Record<string, string>> {
  try {
    const possiblePaths = [
      path.resolve(__dirname, '..', 'data', 'itemtypes.json'),
      path.resolve(__dirname, '..', '..', 'src', 'data', 'itemtypes.json'),
      path.resolve(process.cwd(), 'src', 'data', 'itemtypes.json')
    ];
    
    for (const itemTypesPath of possiblePaths) {
      if (await fs.pathExists(itemTypesPath)) {
        const content = await fs.readFile(itemTypesPath, 'utf-8');
        const itemTypesData = JSON.parse(content);
        
        // Create a lookup by item type code
        const lookup: Record<string, string> = {};
        
        if (itemTypesData.fields && itemTypesData.rows) {
          // New array-based format: { fields: [...], rows: [[...], ...] }
          const fields = itemTypesData.fields;
          const codeIndex = fields.indexOf('Code');
          const itemTypeIndex = fields.indexOf('ItemType');
          
          itemTypesData.rows.forEach((row: any[]) => {
            const code = codeIndex >= 0 ? row[codeIndex] : '';
            const itemType = itemTypeIndex >= 0 ? row[itemTypeIndex] : '';
            
            if (code && itemType) {
              lookup[code] = itemType;
            }
          });
        } else {
          // Fallback to old format if detected
          itemTypesData.forEach((itemType: any) => {
            if (itemType.Code && itemType.ItemType) {
              lookup[itemType.Code] = itemType.ItemType;
            }
          });
        }
        
        return lookup;
      }
    }
  } catch (error) {
    console.warn(`Could not load item types: ${error}`);
  }
  
  return {};
}

/**
 * Loads item modifier lookup from item-modifiers.json file
 */
async function loadItemModifierLookup(): Promise<Record<string, any>> {
  try {
    const possiblePaths = [
      path.resolve(__dirname, '..', 'data', 'item-modifiers.json'),
      path.resolve(__dirname, '..', '..', 'src', 'data', 'item-modifiers.json'),
      path.resolve(process.cwd(), 'src', 'data', 'item-modifiers.json')
    ];
    
    for (const itemModifiersPath of possiblePaths) {
      if (await fs.pathExists(itemModifiersPath)) {
        const content = await fs.readFile(itemModifiersPath, 'utf-8');
        
        // Remove BOM if present and trim whitespace
        const cleanContent = content.replace(/^\uFEFF/, '').trim();
        
        try {
          const itemModifiersData = JSON.parse(cleanContent);
          
          // Create a lookup by Key field
          const lookup: Record<string, any> = {};
          
          if (Array.isArray(itemModifiersData)) {
            // The item-modifiers.json is an array of modifier objects
            itemModifiersData.forEach((modifier: any) => {
              if (modifier.Key) {
                lookup[modifier.Key] = {
                  id: modifier.id,
                  Key: modifier.Key,
                  enUS: modifier.enUS,
                  ...modifier // include all locale fields
                };
              }
            });
          }
          
          return lookup;
        } catch (parseError) {
          console.warn(`Failed to parse item modifiers JSON: ${parseError}`);
          console.warn(`Content preview: ${cleanContent.substring(0, 200)}...`);
          return {};
        }
      }
    }
  } catch (error) {
    console.warn(`Could not load item modifiers: ${error}`);
  }
  
  return {};
}

/**
 * Loads properties lookup from Properties.json file
 */
async function loadPropertiesLookup(): Promise<Record<string, any>> {
  try {
    const possiblePaths = [
      path.resolve(__dirname, '..', 'data', 'Properties.json'),
      path.resolve(__dirname, '..', '..', 'src', 'data', 'Properties.json'),
      path.resolve(process.cwd(), 'src', 'data', 'Properties.json')
    ];
    
    for (const propertiesPath of possiblePaths) {
      if (await fs.pathExists(propertiesPath)) {
        const content = await fs.readFile(propertiesPath, 'utf-8');
        const propertiesData = JSON.parse(content);
        
        // Create a lookup by property code
        const lookup: Record<string, any> = {};
        
        console.log('Properties data structure:', {
          hasFields: !!propertiesData.fields,
          hasRows: !!propertiesData.rows,
          isArray: Array.isArray(propertiesData),
          fields: propertiesData.fields?.slice(0, 10),
          rowCount: propertiesData.rows?.length
        });
        
        if (propertiesData.fields && propertiesData.rows) {
          // Array-based format: { fields: [...], rows: [[...], ...] }
          const fields = propertiesData.fields;
          const codeIndex = fields.indexOf('code');
          const stat1Index = fields.indexOf('stat1');
          const func1Index = fields.indexOf('func1');
          
          console.log('Field indices:', { codeIndex, stat1Index, func1Index });
          
          let addedCount = 0;
          propertiesData.rows.forEach((row: any[], index: number) => {
            const code = codeIndex >= 0 ? row[codeIndex] : '';
            const stat1 = stat1Index >= 0 ? row[stat1Index] : '';
            const func1 = func1Index >= 0 ? row[func1Index] : '';
            
            // Include properties that have either stat1 or func1 (or both)
            if (code && (stat1 || func1)) {
              lookup[code] = {
                code: code,
                stat1: stat1,
                func1: func1
              };
              addedCount++;
              
              // Debug specific properties
              if (code === 'dmg%' || code === 'dmg-max') {
                console.log(`Added ${code}:`, { code, stat1, func1 });
              }
            }
          });
          
          console.log(`Added ${addedCount} properties to lookup`);
        } else {
          // Handle direct array format (fallback for Properties.json)
          if (Array.isArray(propertiesData)) {
            let addedCount = 0;
            propertiesData.forEach((row: any[]) => {
              if (Array.isArray(row) && row.length > 5) {
                const code = row[0];
                const func1 = row[4];
                const stat1 = row[5];
                
                // Include properties that have either stat1 or func1 (or both)
                if (code && (stat1 || func1)) {
                  lookup[code] = {
                    code: code,
                    stat1: stat1,
                    func1: func1
                  };
                  addedCount++;
                  
                  // Debug specific properties
                  if (code === 'dmg%' || code === 'dmg-max') {
                    console.log(`Added ${code}:`, { code, stat1, func1 });
                  }
                }
              }
            });
            
            console.log(`Added ${addedCount} properties to lookup (fallback format)`);
          }
        }
        
        return lookup;
      }
    }
  } catch (error) {
    console.warn(`Could not load properties: ${error}`);
  }
  
  return {};
}

/**
 * Loads item stat cost lookup from ItemStatCost.json file
 */
async function loadItemStatCostLookup(): Promise<Record<string, any>> {
  try {
    const possiblePaths = [
      path.resolve(__dirname, '..', 'data', 'ItemStatCost.json'),
      path.resolve(__dirname, '..', '..', 'src', 'data', 'ItemStatCost.json'),
      path.resolve(process.cwd(), 'src', 'data', 'ItemStatCost.json')
    ];
    
    for (const itemStatCostPath of possiblePaths) {
      if (await fs.pathExists(itemStatCostPath)) {
        const content = await fs.readFile(itemStatCostPath, 'utf-8');
        const itemStatCostData = JSON.parse(content);
        
        // Create a lookup by stat name
        const lookup: Record<string, any> = {};
        
        if (itemStatCostData.fields && itemStatCostData.rows) {
          // Array-based format: { fields: [...], rows: [[...], ...] }
          const fields = itemStatCostData.fields;
          const statIndex = fields.indexOf('Stat');
          const descpriorityIndex = fields.indexOf('descpriority');
          const descfuncIndex = fields.indexOf('descfunc');
          const descvalIndex = fields.indexOf('descval');
          const descstrposIndex = fields.indexOf('descstrpos');
          const descstrnegIndex = fields.indexOf('descstrneg');
          const descstr2Index = fields.indexOf('descstr2');
          
          itemStatCostData.rows.forEach((row: any[]) => {
            const stat = statIndex >= 0 ? row[statIndex] : '';
            
            if (stat && stat.trim() !== '') {
              lookup[stat] = {
                stat: stat,
                descpriority: descpriorityIndex >= 0 ? row[descpriorityIndex] : 0,
                descfunc: descfuncIndex >= 0 ? row[descfuncIndex] : 1,
                descval: descvalIndex >= 0 ? row[descvalIndex] : 1,
                descstrpos: descstrposIndex >= 0 ? row[descstrposIndex] : '',
                descstrneg: descstrnegIndex >= 0 ? row[descstrnegIndex] : '',
                descstr2: descstr2Index >= 0 ? row[descstr2Index] : ''
              };
            }
          });
        }
        
        return lookup;
      }
    }
  } catch (error) {
    console.warn(`Could not load item stat costs: ${error}`);
  }
  
  return {};
} 