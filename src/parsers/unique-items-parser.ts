/**
 * Unique Items Parser
 * 
 * Parses uniqueitems.txt files from D2 mods
 */

import { UniqueItem, ParseError } from '../types/d2-data';
import { parseTSV, createD2TypeConverters, validateRequiredFields, TSVParseResult } from './tsv-parser';

export interface UniqueItemsParseOptions {
  /** Whether to perform strict validation */
  validateData?: boolean;
  /** Include detailed error information */
  includeDetailedErrors?: boolean;
}

export interface UniqueItemsParseResult {
  /** Parsed unique items */
  items: UniqueItem[];
  /** Parse errors */
  errors: ParseError[];
  /** Success statistics */
  stats: {
    totalRows: number;
    successfulRows: number;
    errorCount: number;
    warningCount: number;
  };
}

/**
 * Maps TSV field names to our UniqueItem interface field names
 */
function mapTSVFieldsToUniqueItem(tsvItem: any): UniqueItem {
  return {
    // Map TSV fields to correct UniqueItem fields
    index: tsvItem.index || '',
    name: tsvItem.index || '', // In D2, 'index' contains the unique item name
    type: tsvItem['*ItemName'] || '', // '*ItemName' contains the base item type name
    code: tsvItem.code || '', // Base item code - can be empty in mod data
    enabled: tsvItem.enabled === true || tsvItem.enabled === 1 || tsvItem.enabled === '1',
    spawnable: tsvItem.spawnable === true || tsvItem.spawnable === 1 || tsvItem.spawnable === '1',
    rare: tsvItem.rare === true || tsvItem.rare === 1 || tsvItem.rare === '1',
    carries: tsvItem.carries === true || tsvItem.carries === 1 || tsvItem.carries === '1',
    costmult: parseInt(tsvItem['cost mult']) || 1,
    costdiv: parseInt(tsvItem['cost add']) || 1,
    chrtransform: tsvItem.chrtransform === true || tsvItem.chrtransform === 1 || tsvItem.chrtransform === '1',
    invtransform: tsvItem.invtransform === true || tsvItem.invtransform === 1 || tsvItem.invtransform === '1',
    flippyfile: tsvItem.flippyfile || '',
    invfile: tsvItem.invfile || '',
    dropsound: tsvItem.dropsound || '',
    dropsfxframe: parseInt(tsvItem.dropsfxframe) || 0,
    usesound: tsvItem.usesound || '',
    lvl: parseInt(tsvItem.lvl) || 0,
    lvlreq: parseInt(tsvItem['lvl req']) || 0,
    rarity: parseInt(tsvItem.rarity) || 0,
    spawnstack: parseInt(tsvItem.spawnstack) || 0,
    minstack: parseInt(tsvItem.minstack) || 0,
    maxstack: parseInt(tsvItem.maxstack) || 0,

    // Map all the property fields (prop1-12, par1-12, min1-12, max1-12)
    prop1: tsvItem.prop1 || '',
    par1: tsvItem.par1 || '',
    min1: tsvItem.min1 !== undefined && tsvItem.min1 !== '' ? parseInt(tsvItem.min1) : undefined,
    max1: tsvItem.max1 !== undefined && tsvItem.max1 !== '' ? parseInt(tsvItem.max1) : undefined,
    prop2: tsvItem.prop2 || '',
    par2: tsvItem.par2 || '',
    min2: tsvItem.min2 !== undefined && tsvItem.min2 !== '' ? parseInt(tsvItem.min2) : undefined,
    max2: tsvItem.max2 !== undefined && tsvItem.max2 !== '' ? parseInt(tsvItem.max2) : undefined,
    prop3: tsvItem.prop3 || '',
    par3: tsvItem.par3 || '',
    min3: tsvItem.min3 !== undefined && tsvItem.min3 !== '' ? parseInt(tsvItem.min3) : undefined,
    max3: tsvItem.max3 !== undefined && tsvItem.max3 !== '' ? parseInt(tsvItem.max3) : undefined,
    prop4: tsvItem.prop4 || '',
    par4: tsvItem.par4 || '',
    min4: tsvItem.min4 !== undefined && tsvItem.min4 !== '' ? parseInt(tsvItem.min4) : undefined,
    max4: tsvItem.max4 !== undefined && tsvItem.max4 !== '' ? parseInt(tsvItem.max4) : undefined,
    prop5: tsvItem.prop5 || '',
    par5: tsvItem.par5 || '',
    min5: tsvItem.min5 !== undefined && tsvItem.min5 !== '' ? parseInt(tsvItem.min5) : undefined,
    max5: tsvItem.max5 !== undefined && tsvItem.max5 !== '' ? parseInt(tsvItem.max5) : undefined,
    prop6: tsvItem.prop6 || '',
    par6: tsvItem.par6 || '',
    min6: tsvItem.min6 !== undefined && tsvItem.min6 !== '' ? parseInt(tsvItem.min6) : undefined,
    max6: tsvItem.max6 !== undefined && tsvItem.max6 !== '' ? parseInt(tsvItem.max6) : undefined,
    prop7: tsvItem.prop7 || '',
    par7: tsvItem.par7 || '',
    min7: tsvItem.min7 !== undefined && tsvItem.min7 !== '' ? parseInt(tsvItem.min7) : undefined,
    max7: tsvItem.max7 !== undefined && tsvItem.max7 !== '' ? parseInt(tsvItem.max7) : undefined,
    prop8: tsvItem.prop8 || '',
    par8: tsvItem.par8 || '',
    min8: tsvItem.min8 !== undefined && tsvItem.min8 !== '' ? parseInt(tsvItem.min8) : undefined,
    max8: tsvItem.max8 !== undefined && tsvItem.max8 !== '' ? parseInt(tsvItem.max8) : undefined,
    prop9: tsvItem.prop9 || '',
    par9: tsvItem.par9 || '',
    min9: tsvItem.min9 !== undefined && tsvItem.min9 !== '' ? parseInt(tsvItem.min9) : undefined,
    max9: tsvItem.max9 !== undefined && tsvItem.max9 !== '' ? parseInt(tsvItem.max9) : undefined,
    prop10: tsvItem.prop10 || '',
    par10: tsvItem.par10 || '',
    min10: tsvItem.min10 !== undefined && tsvItem.min10 !== '' ? parseInt(tsvItem.min10) : undefined,
    max10: tsvItem.max10 !== undefined && tsvItem.max10 !== '' ? parseInt(tsvItem.max10) : undefined,
    prop11: tsvItem.prop11 || '',
    par11: tsvItem.par11 || '',
    min11: tsvItem.min11 !== undefined && tsvItem.min11 !== '' ? parseInt(tsvItem.min11) : undefined,
    max11: tsvItem.max11 !== undefined && tsvItem.max11 !== '' ? parseInt(tsvItem.max11) : undefined,
    prop12: tsvItem.prop12 || '',
    par12: tsvItem.par12 || '',
    min12: tsvItem.min12 !== undefined && tsvItem.min12 !== '' ? parseInt(tsvItem.min12) : undefined,
    max12: tsvItem.max12 !== undefined && tsvItem.max12 !== '' ? parseInt(tsvItem.max12) : undefined,
  };
}

/**
 * Parses uniqueitems.txt file content
 */
export function parseUniqueItems(
  content: string, 
  filename: string = 'uniqueitems.txt',
  options: UniqueItemsParseOptions = {}
): UniqueItemsParseResult {
  const { validateData = true, includeDetailedErrors = true } = options;
  
  // Create D2-specific type converters
  const typeConverters = createD2TypeConverters();

  // Parse the TSV content
  const tsvResult: TSVParseResult<any> = parseTSV<any>(content, filename, {
    typeConverters,
    skipEmptyLines: true,
    skipLinesStartingWith: ['#', '//', 'Expansion'],
    autoConvert: true,
    includeLineNumbers: true,
  });

  let { data: rawItems, errors } = tsvResult;

  // Transform the raw TSV data to match our UniqueItem interface
  const items: UniqueItem[] = rawItems.map(mapTSVFieldsToUniqueItem);

  // Only do strict validation if requested
  if (validateData) {
    // For mod data, only require essential fields
    const requiredFields: (keyof UniqueItem)[] = ['index', 'name'];
    const validationErrors = validateRequiredFields(items, requiredFields, filename);
    errors = [...errors, ...validationErrors];

    // Additional D2-specific validations - more lenient for mod data
    const additionalErrors = validateUniqueItemsData(items, filename, { allowDuplicates: true });
    errors = [...errors, ...additionalErrors];
  } else {
    // When validation is disabled, convert serious issues to warnings
    const filteredItems = items.filter(item => {
      const hasBasicData = item.index && item.name && item.index.trim() !== '' && item.name.trim() !== '';
      if (!hasBasicData && includeDetailedErrors) {
        errors.push({
          file: filename,
          message: `Skipping item with insufficient data: ${item.index || 'unknown'}`,
          type: 'warning'
        });
      }
      return hasBasicData;
    });
    
    // Update items list with filtered results
    items.splice(0, items.length, ...filteredItems);
    
    // Add lenient validation for mod data
    const modValidationErrors = validateUniqueItemsData(items, filename, { allowDuplicates: true });
    errors = [...errors, ...modValidationErrors];
  }

  // Filter out items that are clearly invalid
  const validItems = items.filter(item => {
    // Must have at least index and name
    return item.index && item.name && item.index.trim() !== '' && item.name.trim() !== '';
  });

  // Calculate statistics
  const errorCount = errors.filter(e => e.type === 'error' || e.type === 'fatal').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;

  return {
    items: validItems,
    errors,
    stats: {
      totalRows: tsvResult.totalRows,
      successfulRows: validItems.length,
      errorCount,
      warningCount,
    },
  };
}

/**
 * Validates unique item specific business rules
 */
function validateUniqueItemsData(items: UniqueItem[], filename: string, options: { allowDuplicates: boolean }): ParseError[] {
  const errors: ParseError[] = [];
  const seenIndexes = new Set<string>();
  const seenNames = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const lineNumber = i + 2; // +2 for header and 0-based index

    // Check for duplicate indexes
    if (item.index) {
      const index = item.index.toLowerCase();
      if (seenIndexes.has(index)) {
        if (!options.allowDuplicates) {
          errors.push({
            file: filename,
            line: lineNumber,
            message: `Duplicate unique item index: ${item.index}`,
            type: 'error',
          });
        }
      } else {
        seenIndexes.add(index);
      }
    }

    // Check for duplicate names (warning only)
    if (item.name) {
      const name = item.name.toLowerCase();
      if (seenNames.has(name)) {
        errors.push({
          file: filename,
          line: lineNumber,
          message: `Duplicate unique item name: ${item.name}`,
          type: options.allowDuplicates ? 'warning' : 'warning', // Always warn for name duplicates
        });
      } else {
        seenNames.add(name);
      }
    }

    // Validate level requirements
    if (item.lvl && item.lvlreq && item.lvl < item.lvlreq) {
      errors.push({
        file: filename,
        line: lineNumber,
        message: `Item level (${item.lvl}) is less than level requirement (${item.lvlreq}) for ${item.name}`,
        type: 'warning',
      });
    }

    // Validate cost multipliers
    if (item.costmult <= 0) {
      errors.push({
        file: filename,
        line: lineNumber,
        message: `Invalid cost multiplier (${item.costmult}) for ${item.name}`,
        type: 'warning',
      });
    }

    if (item.costdiv <= 0) {
      errors.push({
        file: filename,
        line: lineNumber,
        message: `Invalid cost divisor (${item.costdiv}) for ${item.name}`,
        type: 'warning',
      });
    }

    // Validate properties - check that if prop is set, corresponding par/min/max might be too
    for (let propNum = 1; propNum <= 12; propNum++) {
      const propKey = `prop${propNum}` as keyof UniqueItem;
      const parKey = `par${propNum}` as keyof UniqueItem;
      const minKey = `min${propNum}` as keyof UniqueItem;
      const maxKey = `max${propNum}` as keyof UniqueItem;

      const prop = item[propKey];
      const min = item[minKey];
      const max = item[maxKey];

      // If we have a property but no min/max values, that might be intentional in mod data
      if (prop && prop !== '' && (!min && min !== 0) && (!max && max !== 0)) {
        // Only warn if we have detailed errors enabled
        if (options.allowDuplicates) {
          // In lenient mode, don't complain about missing property values
        } else {
          errors.push({
            file: filename,
            line: lineNumber,
            message: `Property ${propNum} (${prop}) has no min/max values for ${item.name}`,
            type: 'warning',
          });
        }
      }

      // If max < min, that's potentially wrong but could be intentional in mod data
      if (min !== undefined && max !== undefined && max < min) {
        errors.push({
          file: filename,
          line: lineNumber,
          message: `Property ${propNum} max value (${max}) is less than min value (${min}) for ${item.name}`,
          type: options.allowDuplicates ? 'warning' : 'error',
        });
      }
    }
  }

  return errors;
}

/**
 * Gets all unique item properties for a given item
 */
export function getUniqueItemProperties(item: UniqueItem): Array<{
  property: string;
  parameter?: string;
  min?: number;
  max?: number;
  displayValue?: string;
}> {
  const properties = [];

  for (let i = 1; i <= 12; i++) {
    const propKey = `prop${i}` as keyof UniqueItem;
    const parKey = `par${i}` as keyof UniqueItem;
    const minKey = `min${i}` as keyof UniqueItem;
    const maxKey = `max${i}` as keyof UniqueItem;

    const prop = item[propKey] as string;
    const par = item[parKey] as string;
    const min = item[minKey] as number;
    const max = item[maxKey] as number;

    if (prop && prop.trim() !== '') {
      let displayValue = '';
      
      if (min !== undefined && max !== undefined) {
        if (min === max) {
          displayValue = `${min}`;
        } else {
          displayValue = `${min}-${max}`;
        }
      } else if (min !== undefined) {
        displayValue = `${min}`;
      } else if (max !== undefined) {
        displayValue = `${max}`;
      }

      properties.push({
        property: prop,
        parameter: par && par.trim() !== '' ? par : undefined,
        min: min !== undefined ? min : undefined,
        max: max !== undefined ? max : undefined,
        displayValue: displayValue || undefined,
      });
    }
  }

  return properties;
}

/**
 * Filters unique items by various criteria
 */
export function filterUniqueItems(
  items: UniqueItem[],
  filters: {
    enabled?: boolean;
    spawnable?: boolean;
    type?: string;
    minLevel?: number;
    maxLevel?: number;
    nameContains?: string;
  }
): UniqueItem[] {
  return items.filter(item => {
    if (filters.enabled !== undefined && item.enabled !== filters.enabled) {
      return false;
    }
    
    if (filters.spawnable !== undefined && item.spawnable !== filters.spawnable) {
      return false;
    }
    
    if (filters.type && item.type !== filters.type) {
      return false;
    }
    
    if (filters.minLevel !== undefined && item.lvl < filters.minLevel) {
      return false;
    }
    
    if (filters.maxLevel !== undefined && item.lvl > filters.maxLevel) {
      return false;
    }
    
    if (filters.nameContains && !item.name.toLowerCase().includes(filters.nameContains.toLowerCase())) {
      return false;
    }
    
    return true;
  });
}

/**
 * Groups unique items by type
 */
export function groupUniqueItemsByType(items: UniqueItem[]): Record<string, UniqueItem[]> {
  const groups: Record<string, UniqueItem[]> = {};
  
  for (const item of items) {
    const type = item.type || 'Unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
  }
  
  return groups;
}

/**
 * Sorts unique items by level, then by name
 */
export function sortUniqueItems(items: UniqueItem[]): UniqueItem[] {
  return [...items].sort((a, b) => {
    // Sort by level first
    if (a.lvl !== b.lvl) {
      return a.lvl - b.lvl;
    }
    
    // Then by name
    return a.name.localeCompare(b.name);
  });
} 