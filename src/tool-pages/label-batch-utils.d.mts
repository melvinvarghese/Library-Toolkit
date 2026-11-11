export function mapLabelRows(table: {headers: string[]; rows: string[][]}, fields: {key: string; aliases: string[]}[]): Record<string, string>[];
export function makeSequentialAccessionLabels(options: {start: string; count: number; prefix?: string}): string[];
export function clampLabelSheet(options?: {width?: number; height?: number; columns?: number; fontSize?: number}): {width: number; height: number; columns: number; fontSize: number};
