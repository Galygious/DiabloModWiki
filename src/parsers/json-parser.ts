/**
 * JSON Parser for D2 Localization Files
 * 
 * Parses JSON files used for localization (item-names.json, skill-names.json, etc.)
 */

import { ParseError, LocalizedStrings } from '../types/d2-data';

export interface JSONParseResult<T = any> {
  /** Parsed JSON data */
  data: T | null;
  /** Parse errors */
  errors: ParseError[];
  /** Success status */
  success: boolean;
}

/**
 * Parses JSON content with comprehensive error handling
 */
export function parseJSON<T = any>(
  content: string,
  filename: string,
  options: {
    /** Validate that result is an object */
    expectObject?: boolean;
    /** Required keys for validation */
    requiredKeys?: string[];
    /** Allow empty objects */
    allowEmpty?: boolean;
  } = {}
): JSONParseResult<T> {
  const { expectObject = false, requiredKeys = [], allowEmpty = true } = options;
  const errors: ParseError[] = [];
  let data: T | null = null;
  let success = false;

  try {
    // Parse JSON
    data = JSON.parse(content) as T;
    success = true;

    // Validate structure if requested
    if (expectObject && (typeof data !== 'object' || data === null || Array.isArray(data))) {
      errors.push({
        file: filename,
        message: 'Expected JSON object but got ' + (Array.isArray(data) ? 'array' : typeof data),
        type: 'error',
      });
      success = false;
    }

    // Check for required keys
    if (success && expectObject && requiredKeys.length > 0) {
      const obj = data as Record<string, any>;
      for (const key of requiredKeys) {
        if (!(key in obj)) {
          errors.push({
            file: filename,
            message: `Required key '${key}' is missing`,
            type: 'error',
          });
          success = false;
        }
      }
    }

    // Check if empty when not allowed
    if (success && !allowEmpty && expectObject) {
      const obj = data as Record<string, any>;
      if (Object.keys(obj).length === 0) {
        errors.push({
          file: filename,
          message: 'JSON object is empty but empty objects are not allowed',
          type: 'error',
        });
        success = false;
      }
    }

  } catch (parseError) {
    success = false;
    data = null;

    // Try to extract line/column info from error
    const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
    const lineMatch = errorMessage.match(/line (\d+)/i);
    const columnMatch = errorMessage.match(/column (\d+)/i);

    errors.push({
      file: filename,
      line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
      column: columnMatch ? parseInt(columnMatch[1], 10) : undefined,
      message: `JSON parse error: ${errorMessage}`,
      type: 'fatal',
    });
  }

  return {
    data,
    errors,
    success,
  };
}

/**
 * Parses localization JSON files specifically
 */
export function parseLocalizationJSON(
  content: string,
  filename: string
): JSONParseResult<LocalizedStrings> {
  // First try to parse as general JSON
  const result = parseJSON<any>(content, filename, {
    expectObject: false, // D2 files can be arrays
    allowEmpty: true,
  });

  if (!result.success || !result.data) {
    return {
      data: null,
      errors: result.errors,
      success: false,
    };
  }

  // Convert D2 localization format to simple key-value pairs
  let localizedStrings: LocalizedStrings = {};
  const errors: ParseError[] = [...result.errors];

  try {
    if (Array.isArray(result.data)) {
      // D2 format: array of objects with language codes
      for (const entry of result.data) {
        if (typeof entry === 'object' && entry !== null && 'Key' in entry) {
          const key = entry.Key;
          // Prefer English (enUS), fall back to any available language
          const value = entry.enUS || entry.deDE || entry.esES || entry.frFR || entry.itIT || entry.jaJP || entry.koKR || entry.plPL || entry.ptBR || entry.ruRU || entry.zhCN || entry.zhTW || '';
          
          if (typeof key === 'string' && key !== '') {
            localizedStrings[key] = String(value);
          } else {
            errors.push({
              file: filename,
              message: `Localization entry missing or invalid 'Key' field: ${JSON.stringify(entry)}`,
              type: 'warning',
            });
          }
        } else {
          errors.push({
            file: filename,
            message: `Invalid localization entry format: ${JSON.stringify(entry)}`,
            type: 'warning',
          });
        }
      }
    } else if (typeof result.data === 'object' && result.data !== null) {
      // Simple key-value format (already correct)
      localizedStrings = result.data as LocalizedStrings;
    } else {
      errors.push({
        file: filename,
        message: `Expected JSON object or array but got ${typeof result.data}`,
        type: 'error',
      });
      return {
        data: null,
        errors,
        success: false,
      };
    }

    // Additional validation for localization files
    const additionalErrors = validateLocalizationData(localizedStrings, filename);
    errors.push(...additionalErrors);

    // Success if we have some data and no fatal errors
    const success = Object.keys(localizedStrings).length > 0 && !errors.some(e => e.type === 'fatal' || e.type === 'error');

    return {
      data: localizedStrings,
      errors,
      success,
    };

  } catch (conversionError) {
    errors.push({
      file: filename,
      message: `Failed to convert localization data: ${conversionError}`,
      type: 'error',
    });

    return {
      data: null,
      errors,
      success: false,
    };
  }
}

/**
 * Validates localization data structure
 */
function validateLocalizationData(data: LocalizedStrings, filename: string): ParseError[] {
  const errors: ParseError[] = [];

  // Check that all values are strings
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') {
      errors.push({
        file: filename,
        message: `Localization key '${key}' has non-string value: ${typeof value}`,
        type: 'warning',
      });
    }

    // Check for empty strings
    if (value === '') {
      errors.push({
        file: filename,
        message: `Localization key '${key}' has empty string value`,
        type: 'warning',
      });
    }

    // Check for very long keys (might indicate data issue)
    if (key.length > 100) {
      errors.push({
        file: filename,
        message: `Localization key '${key}' is unusually long (${key.length} characters)`,
        type: 'warning',
      });
    }
  }

  return errors;
}

/**
 * Merges multiple localization objects with conflict detection
 */
export function mergeLocalizedStrings(
  primary: LocalizedStrings,
  secondary: LocalizedStrings,
  filename: string = 'merged'
): {
  merged: LocalizedStrings;
  conflicts: ParseError[];
} {
  const merged: LocalizedStrings = { ...primary };
  const conflicts: ParseError[] = [];

  for (const [key, value] of Object.entries(secondary)) {
    if (key in merged && merged[key] !== value) {
      conflicts.push({
        file: filename,
        message: `Conflicting values for key '${key}': '${merged[key]}' vs '${value}'`,
        type: 'warning',
      });
    }
    merged[key] = value;
  }

  return { merged, conflicts };
}

/**
 * Validates that all referenced keys exist in localization
 */
export function validateLocalizationReferences(
  data: Record<string, any>,
  localization: LocalizedStrings,
  keyFields: string[],
  filename: string
): ParseError[] {
  const errors: ParseError[] = [];
  const availableKeys = new Set(Object.keys(localization));

  // Recursively check for localization key references
  function checkObject(obj: any, path: string[] = []): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => checkObject(item, [...path, `[${index}]`]));
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      
      // Check if this is a localization key field
      if (keyFields.includes(key) && typeof value === 'string' && value !== '') {
        if (!availableKeys.has(value)) {
          errors.push({
            file: filename,
            message: `Referenced localization key '${value}' not found in localization data (${currentPath.join('.')})`,
            type: 'warning',
          });
        }
      }

      // Recursively check nested objects
      checkObject(value, currentPath);
    }
  }

  checkObject(data);
  return errors;
}

/**
 * Gets statistics about localization coverage
 */
export function getLocalizationStats(localization: LocalizedStrings): {
  totalKeys: number;
  emptyValues: number;
  averageLength: number;
  longestKey: string;
  longestValue: string;
} {
  const keys = Object.keys(localization);
  const values = Object.values(localization);
  
  const emptyValues = values.filter(v => v === '').length;
  const totalLength = values.reduce((sum, v) => sum + v.length, 0);
  const averageLength = keys.length > 0 ? totalLength / keys.length : 0;

  const longestKey = keys.reduce((longest, key) => 
    key.length > longest.length ? key : longest, '');
  
  const longestValue = values.reduce((longest, value) => 
    value.length > longest.length ? value : longest, '');

  return {
    totalKeys: keys.length,
    emptyValues,
    averageLength: Math.round(averageLength * 100) / 100,
    longestKey,
    longestValue,
  };
} 