/**
 * TSV Parser for Diablo 2 Data Files
 * 
 * Parses tab-separated value files commonly used in D2 mod data
 */

import { ParseError } from '../types/d2-data';

export interface TSVParseOptions {
  /** Skip empty lines */
  skipEmptyLines?: boolean;
  /** Skip lines starting with these characters */
  skipLinesStartingWith?: string[];
  /** Convert string values to appropriate types */
  autoConvert?: boolean;
  /** Custom field delimiter (default: \t) */
  delimiter?: string;
  /** Include line numbers in errors */
  includeLineNumbers?: boolean;
  /** Custom type conversions */
  typeConverters?: Record<string, (value: string) => any>;
}

export interface TSVParseResult<T = any> {
  /** Parsed data rows */
  data: T[];
  /** Column headers */
  headers: string[];
  /** Parse errors encountered */
  errors: ParseError[];
  /** Total rows processed */
  totalRows: number;
  /** Successful rows parsed */
  successfulRows: number;
}

/**
 * Parses TSV content into structured data
 */
export function parseTSV<T = any>(
  content: string,
  filename: string,
  options: TSVParseOptions = {}
): TSVParseResult<T> {
  const {
    skipEmptyLines = true,
    skipLinesStartingWith = ['#', '//'],
    autoConvert = true,
    delimiter = '\t',
    includeLineNumbers = true,
    typeConverters = {},
  } = options;

  const errors: ParseError[] = [];
  const data: T[] = [];
  let headers: string[] = [];
  let totalRows = 0;
  let successfulRows = 0;

  try {
    // Split content into lines and normalize line endings
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    
    let headersParsed = false;
    let currentLineNumber = 0;

    for (const line of lines) {
      currentLineNumber++;
      const trimmedLine = line.trim();

      // Skip empty lines if requested
      if (skipEmptyLines && !trimmedLine) {
        continue;
      }

      // Skip comment lines
      if (skipLinesStartingWith.some(prefix => trimmedLine.startsWith(prefix))) {
        continue;
      }

      totalRows++;

      try {
        // Split by delimiter
        const fields = line.split(delimiter);

        if (!headersParsed) {
          // First data line becomes headers
          headers = fields.map(header => header.trim());
          headersParsed = true;
          continue;
        }

        // Parse data row
        const rowData: any = {};
        
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          const rawValue = i < fields.length ? fields[i].trim() : '';
          
          try {
            // Apply custom type converter if available
            if (typeConverters[header]) {
              rowData[header] = typeConverters[header](rawValue);
            } else if (autoConvert) {
              rowData[header] = convertValue(rawValue);
            } else {
              rowData[header] = rawValue;
            }
          } catch (conversionError) {
            // If conversion fails, keep as string and log warning
            rowData[header] = rawValue;
            errors.push({
              file: filename,
              line: includeLineNumbers ? currentLineNumber : undefined,
              column: i + 1,
              message: `Type conversion failed for field '${header}': ${conversionError}`,
              type: 'warning',
            });
          }
        }

        data.push(rowData as T);
        successfulRows++;

      } catch (lineError) {
        errors.push({
          file: filename,
          line: includeLineNumbers ? currentLineNumber : undefined,
          message: `Failed to parse line: ${lineError}`,
          type: 'error',
        });
      }
    }

    // Validate that we have headers
    if (!headersParsed || headers.length === 0) {
      errors.push({
        file: filename,
        message: 'No valid headers found in file',
        type: 'fatal',
      });
    }

  } catch (globalError) {
    errors.push({
      file: filename,
      message: `Failed to parse file: ${globalError}`,
      type: 'fatal',
    });
  }

  return {
    data,
    headers,
    errors,
    totalRows,
    successfulRows,
  };
}

/**
 * Automatically converts string values to appropriate types
 */
function convertValue(value: string): any {
  if (!value || value === '') {
    return '';
  }

  // Handle quoted strings
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  // Handle boolean values
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true' || lowerValue === '1') {
    return true;
  }
  if (lowerValue === 'false' || lowerValue === '0') {
    return false;
  }

  // Handle numeric values
  if (/^-?\d+$/.test(value)) {
    const num = parseInt(value, 10);
    return isNaN(num) ? value : num;
  }

  if (/^-?\d+\.\d+$/.test(value)) {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }

  // Return as string if no conversion applies
  return value;
}

/**
 * Creates type-specific converters for common D2 data types
 */
export function createD2TypeConverters(): Record<string, (value: string) => any> {
  return {
    // Boolean converters
    enabled: (value: string) => value === '1' || value.toLowerCase() === 'true',
    spawnable: (value: string) => value === '1' || value.toLowerCase() === 'true',
    rare: (value: string) => value === '1' || value.toLowerCase() === 'true',
    carries: (value: string) => value === '1' || value.toLowerCase() === 'true',
    chrtransform: (value: string) => value === '1' || value.toLowerCase() === 'true',
    invtransform: (value: string) => value === '1' || value.toLowerCase() === 'true',
    nodurability: (value: string) => value === '1' || value.toLowerCase() === 'true',
    compactsave: (value: string) => value === '1' || value.toLowerCase() === 'true',
    hasinv: (value: string) => value === '1' || value.toLowerCase() === 'true',
    useable: (value: string) => value === '1' || value.toLowerCase() === 'true',
    throwable: (value: string) => value === '1' || value.toLowerCase() === 'true',
    stackable: (value: string) => value === '1' || value.toLowerCase() === 'true',
    unique: (value: string) => value === '1' || value.toLowerCase() === 'true',

    // Numeric converters with defaults
    lvl: (value: string) => parseInt(value, 10) || 0,
    lvlreq: (value: string) => parseInt(value, 10) || 0,
    rarity: (value: string) => parseInt(value, 10) || 0,
    costmult: (value: string) => parseInt(value, 10) || 1,
    costdiv: (value: string) => parseInt(value, 10) || 1,
    minac: (value: string) => parseInt(value, 10) || 0,
    maxac: (value: string) => parseInt(value, 10) || 0,
    durability: (value: string) => parseInt(value, 10) || 0,
    cost: (value: string) => parseInt(value, 10) || 0,
    reqstr: (value: string) => parseInt(value, 10) || 0,
    reqdex: (value: string) => parseInt(value, 10) || 0,
    mindam: (value: string) => parseInt(value, 10) || 0,
    maxdam: (value: string) => parseInt(value, 10) || 0,
    speed: (value: string) => parseInt(value, 10) || 0,

    // Property value converters (can be empty)
    min1: (value: string) => value === '' ? undefined : parseInt(value, 10),
    max1: (value: string) => value === '' ? undefined : parseInt(value, 10),
    min2: (value: string) => value === '' ? undefined : parseInt(value, 10),
    max2: (value: string) => value === '' ? undefined : parseInt(value, 10),
    min3: (value: string) => value === '' ? undefined : parseInt(value, 10),
    max3: (value: string) => value === '' ? undefined : parseInt(value, 10),
    min4: (value: string) => value === '' ? undefined : parseInt(value, 10),
    max4: (value: string) => value === '' ? undefined : parseInt(value, 10),
    min5: (value: string) => value === '' ? undefined : parseInt(value, 10),
    max5: (value: string) => value === '' ? undefined : parseInt(value, 10),
    min6: (value: string) => value === '' ? undefined : parseInt(value, 10),
    max6: (value: string) => value === '' ? undefined : parseInt(value, 10),
  };
}

/**
 * Validates that required fields are present in parsed data
 */
export function validateRequiredFields<T>(
  data: T[],
  requiredFields: (keyof T)[],
  filename: string
): ParseError[] {
  const errors: ParseError[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (const field of requiredFields) {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        errors.push({
          file: filename,
          line: i + 2, // +2 because first line is headers and arrays are 0-indexed
          message: `Required field '${String(field)}' is missing or empty`,
          type: 'error',
        });
      }
    }
  }

  return errors;
} 