import { Injectable } from '@angular/core';
import { IgxExcelExporterOptions, IgxExcelExporterService, IgxGridComponent } from '@infragistics/igniteui-angular';
import { DateService } from './dateService';

@Injectable({
  providedIn: 'root'
})
export class GridExportUtilsService {

  constructor(
    private excelExportService: IgxExcelExporterService,
    private dateService: DateService
  ) { }

  /**
   * Standardizes date field handling across components.
   * Ensures every date field is either a real JavaScript Date object (for valid values) 
   * or null (for missing or invalid ones).
   * 
   * This guarantees:
   * 1. Ignite UI grids can correctly sort, filter, and format date columns without errors
   * 2. Excel exporter will not throw "Invalid time value" when serializing dates
   * 3. Code remains resilient when APIs return empty strings, undefined, or invalid date formats
   * 
   * @param data - Array of objects from API/service
   * @param dateFields - Array of field names to treat as dates
   * @returns New array with normalized date values (does not mutate original)
   * 
   * Example:
   * Input:  [{ AccrualDate: '2025-10-22T00:00:00Z', SettlementDate: '' }]
   * Output: [{ AccrualDate: new Date('2025-10-22T00:00:00Z'), SettlementDate: null }]
   */
  formatDateFields(data: any[], dateFields: string[]): any[] {
    return data.map(item => {
      const newItem = { ...item };

      dateFields.forEach(field => {
        const value = newItem[field];

        // Handle null, undefined, empty string, whitespace, or "null"/"undefined"
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          (typeof value === 'string' && value.trim() === '') ||
          value === 'null' ||
          value === 'undefined'
        ) {
          newItem[field] = null;
          return;
        }

        // Already a Date → keep if valid
        if (value instanceof Date) {
          newItem[field] = isNaN(value.getTime()) ? null : value;
          return;
        }

        // Convert to Date object
        const parsed = new Date(value);
        newItem[field] = isNaN(parsed.getTime()) ? null : parsed;
      });

      return newItem;
    });
  }

  /**
   * Collects date-type columns from the grid configuration.
   * @param grid - The grid component instance
   * @returns Array of field names that are configured as date columns
   */
  collectDateFields(grid: IgxGridComponent): string[] {
    if (!grid || !grid.columns) {
      return [];
    }

    return grid.columns
      .filter((column: any) => {
        const dataType = column?.dataType;
        return dataType && String(dataType).toLowerCase() === 'date';
      })
      .map((column: any) => column.field)
      .filter((field: string) => field); // Remove any undefined/empty fields
  }

  /**
   * Exports grid data to Excel with proper date normalization and column handling.
   * Only exports visible columns and uses column headers when available.
   * Handles special characters in headers to ensure Excel compatibility.
   * 
   * @param grid - The grid component to export
   * @param fileName - The filename for the exported file (without extension)
   * @throws {Error} When grid is null or undefined
   * @example
   * this.gridExportUtils.exportLikeGrid(this.grid, 'collateral_movements');
   */
  exportLikeGrid(grid: IgxGridComponent, fileName: string): void {
    if (!grid) {
      throw new Error('Grid component is required for export');
    }

    if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
      throw new Error('File name is required for export');
    }

    // 1️⃣ Use the current grid view (sorted/filtered)
    const viewRows: any[] = this.getGridViewData(grid);

    // 2️⃣ Only visible columns, preserving UI order
    const visibleColumns = (grid.columns || []).filter(column => !column.hidden);

    if (visibleColumns.length === 0) {
      console.warn('No visible columns found for export');
      return;
    }

    // 3️⃣ Build a map: field → header text (sanitized for Excel compatibility)
    const headerByField: Record<string, string> = {};
    for (const column of visibleColumns) {
      const originalHeader = column.header ?? column.field;
      const sanitizedHeader = this.sanitizeExcelHeader(originalHeader);
      headerByField[column.field] = sanitizedHeader;
    }

    // 4️⃣ Identify date columns once
    const dateFields = this.collectDateFields(grid);
    const isDateField = new Set(dateFields);

    // 5️⃣ Build export rows using sanitized header text as keys
    const exportRows = viewRows.map(row => {
      const dataRow = this.extractRowData(row);
      const exportRow: Record<string, any> = {};

      for (const column of visibleColumns) {
        const field = column.field;
        const header = headerByField[field];

        let value = dataRow[field];
        if (isDateField.has(field)) {
          value = this.normalizeDateValue(value);
        }

        exportRow[header] = value;
      }

      return exportRow;
    });

    // 6️⃣ Export directly using exportData — keys will appear as Excel headers
    try {
      this.excelExportService.exportData(
        exportRows,
        new IgxExcelExporterOptions(fileName.trim())
      );
    } catch (error) {
      console.error('Error during Excel export:', error);
      throw new Error(`Failed to export grid data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  /**
   * Generates a timestamped filename for Excel exports.
   * Format: <prefix>_<YYYYMMDD>_<YYYYMMDD_HHMMSS>
   * @param prefix - The filename prefix (default: 'export')
   * @param selectedDate - The date to use for the filename (optional, defaults to current date)
   * @returns Formatted filename string
   * @throws {Error} When selectedDate is invalid
   * @example
   * buildFileName('daily_margin', new Date('2025-10-24'))
   * // Returns: 'daily_margin_20251024_20251024_143052'
   */
  buildFileName(prefix: string = 'export', selectedDate?: Date): string {
    // Validate and sanitize prefix
    const sanitizedPrefix = (prefix || 'export').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Validate selectedDate if provided
    const targetDate = selectedDate || new Date();
    if (selectedDate && (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime()))) {
      throw new Error('Invalid date provided for filename generation');
    }

    try {
      // Format date as YYYYMMDD (e.g., 20251024)
      const dateStr = this.dateService.FormatDateToISO(targetDate).replace(/-/g, '');

      // Format timestamp as YYYYMMDD_HHMMSS (e.g., 20251024_143052)
      const timestamp = new Date()
        .toISOString()
        .replace(/T/, '_')
        .slice(0, 19)
        .replace(/[-:]/g, '');

      return `${sanitizedPrefix}_${dateStr}_${timestamp}`;
    } catch (error) {
      console.error('Error generating filename:', error);
      throw new Error(`Failed to generate filename: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extracts the current view data from the grid, respecting filters and sorting.
   * Uses safe property access to avoid type casting issues.
   * @param grid - The grid component instance
   * @returns Array of row data from the current grid view
   */
  private getGridViewData(grid: IgxGridComponent): any[] {
    // Try to access filtered/sorted data using safe property access
    const gridWithData = grid as any;
    
    if (gridWithData?.filteredSortedData && Array.isArray(gridWithData.filteredSortedData)) {
      return gridWithData.filteredSortedData;
    }
    
    if (gridWithData?.dataView && Array.isArray(gridWithData.dataView)) {
      return gridWithData.dataView;
    }
    
    if (grid?.data && Array.isArray(grid.data)) {
      return grid.data;
    }
    
    return [];
  }

  /**
   * Safely unwrap grid view row records to plain data objects.
   * @param row - The row object that may be wrapped in additional properties
   * @returns Plain data object containing the actual row data
   */
  private extractRowData(row: any): any {
    if (row && typeof row === 'object') {
      if ('data' in row && row.data) return row.data;
      if ('rowData' in row && row.rowData) return row.rowData;
    }
    return row; // already a plain data object
  }

  /**
   * Normalizes a single date value to ensure Excel export compatibility.
   * Converts valid date strings/objects to Date instances, invalid values to null.
   * @param value - The value to normalize (can be string, Date, null, undefined, etc.)
   * @returns Date object for valid dates, null for invalid/empty values
   */
  private normalizeDateValue(value: any): Date | null {
    if (
      value == null ||
      value === '' ||
      (typeof value === 'string' && value.trim() === '') ||
      value === 'null' ||
      value === 'undefined'
    ) return null;

    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

    const parsed =
      typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(value + 'T00:00:00Z')
        : new Date(value);

    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Sanitizes header text to be Excel-compatible by replacing problematic characters.
   * Dots (.) and other special characters can cause Excel export issues where
   * column data may not display properly in the exported file.
   * 
   * @param header - The original header text from grid column
   * @returns Sanitized header text safe for Excel property names
   * @example
   * sanitizeExcelHeader('Tran. Type') // Returns 'Tran Type'
   * sanitizeExcelHeader('Price [USD]') // Returns 'Price USD'
   * sanitizeExcelHeader('HairCut %') // Returns 'HairCut %'
   */
  private sanitizeExcelHeader(header: string): string {
    if (!header || typeof header !== 'string') {
      return String(header || '');
    }

    return header
      .replace(/\./g, ' ') // Replace dots with spaces: "Tran. Type" -> "Tran Type"
      .replace(/[[\]{}()]/g, '') // Remove brackets and parentheses
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[&@#$^*+=|\\/:;?`~]/g, '') // Remove problematic characters (% excluded)
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim(); // Remove leading/trailing whitespace
  }

}