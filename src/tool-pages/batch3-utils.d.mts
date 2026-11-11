export function parseCalendarDate(value: string): number;
export interface FineInput { issueDate: string; dueDate: string; returnDate: string; dailyRate: number; graceDays?: number; maximumFine?: number | string | null }
export interface FineResult { overdueDays: number; chargeableDays: number; dailyRate: number; uncappedFine: number; fine: number; maximumFine: number | null }
export function calculateFine(input: FineInput): FineResult;
export function normalizeHeader(value: string): string;
export function mapCsvRows(table: {headers: string[]; rows: string[][]}, aliases: Record<string, string[]>): Record<string, string>[];
export function deriveReportStats(data: Record<string, string | number | null | undefined>): {closingCollection: number | null; circulation: number | null; netMembership: number | null};
