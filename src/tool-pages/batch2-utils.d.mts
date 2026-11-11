export interface CsvTable {
  headers: string[];
  rows: string[][];
}

export interface PurchaseLine {
  quantity: number;
  unitPrice: number;
}

export declare function addSequentialAccessionNumbers(table: CsvTable, startingValue: string): CsvTable;
export declare function parseCsv(input: string, separator?: string): CsvTable;
export declare function calculatePurchaseTotals(
  items: PurchaseLine[],
  discountPercent: number,
  taxPercent: number,
): {subtotal: number; discount: number; taxableAmount: number; tax: number; total: number};
export declare function clampLabelFontSize(value: number): number;
