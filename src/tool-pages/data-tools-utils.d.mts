export interface CsvTable {headers:string[];rows:string[][]}
export function cleanCsvTable(table:CsvTable,options?:{trim?:boolean;removeBlankRows?:boolean;removeDuplicates?:boolean}):CsvTable & {removedBlankRows:number;removedDuplicateRows:number};
export function mapCsvColumns(table:CsvTable,mappings:{source:string;target:string}[]):CsvTable;
export function formatCsvTable(table:CsvTable,options?:{order?:number[]|null;caseMode?:"none"|"upper"|"lower"|"title"}):CsvTable;
export function serializeCsv(headers:string[],rows:string[][]):string;
export function formatTextLines(input:string,options?:{unique?:boolean;sort?:"none"|"ascending"|"descending";caseMode?:"none"|"upper"|"lower"|"title";removeBlank?:boolean}):string;
