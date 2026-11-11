export function suggestBarcodeColumns(headers: string[], options?: {member?: boolean}): {valueIndex: number; captionIndex: number};
export function prepareBarcodeRecords(table: {headers: string[]; rows: string[][]}, options?: {valueIndex?: number | null; captionIndex?: number; maxRecords?: number}): {records: {value: string; caption: string}[]; skippedEmpty: number};
export function clampBarcodeSheet(options?: {pageWidth?: number; pageHeight?: number; margin?: number; gap?: number; columns?: number}): {pageWidth: number; pageHeight: number; margin: number; gap: number; columns: number};
