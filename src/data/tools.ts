export type ToolStatus = "planned" | "in-progress" | "available";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: "barcode" | "labels" | "library" | "data";
  status: ToolStatus;
  tags: string[];
  featured?: boolean;
}

export const categories = [
  {id: "barcode", name: "Barcode tools", description: "Create clear, scanner-friendly barcodes for books and library members.", icon: "▥"},
  {id: "labels", name: "Label tools", description: "Prepare spine, shelf and identification labels for printing.", icon: "▤"},
  {id: "library", name: "Library utilities", description: "Useful calculators, registers and forms for everyday library work.", icon: "▦"},
  {id: "data", name: "Data utilities", description: "Inspect, clean and format CSV files and library records.", icon: "▧"},
] as const;

export const tools: Tool[] = [
  {id: "continuous-barcode", name: "Continuous barcode generator", description: "Generate a numbered sequence of barcodes from a starting and ending value.", category: "barcode", status: "available", tags: ["Sequential", "Code 128"], featured: true},
  {id: "custom-barcode", name: "Custom barcode generator", description: "Create barcodes from a list of values entered manually.", category: "barcode", status: "available", tags: ["Manual entry", "Custom values"], featured: true},
  {id: "csv-barcode", name: "Barcode labels from CSV", description: "Import barcode numbers from a CSV file and arrange them for printing.", category: "barcode", status: "available", tags: ["CSV", "Bulk"], featured: true},
  {id: "member-barcode", name: "Member barcodes from CSV", description: "Turn library member IDs into a clean, printable barcode list.", category: "barcode", status: "available", tags: ["Members", "CSV"], featured: true},
  {id: "isbn-barcode", name: "ISBN barcode generator", description: "Prepare ISBN values as barcodes for library workflows.", category: "barcode", status: "available", tags: ["ISBN", "EAN-13"]},
  {id: "barcode-sheet", name: "Barcode sheet designer", description: "Customize barcode dimensions, columns, margins and page layout.", category: "barcode", status: "available", tags: ["Layout", "A4"]},
  {id: "spine-label-maker", name: "Library spine label generator", description: "Create printable book spine labels from call numbers and library details.", category: "labels", status: "available", tags: ["Call numbers", "Print"], featured: true},
  {id: "spine-label", name: "Spine labels from CSV", description: "Create book spine labels from classification and accession data.", category: "labels", status: "available", tags: ["CSV", "Books"], featured: true},
  {id: "four-line-label", name: "Four-line labels from CSV", description: "Generate consistent four-line labels using spreadsheet data.", category: "labels", status: "available", tags: ["CSV", "Print"], featured: true},
  {id: "book-label", name: "Book identification labels", description: "Make simple custom labels for book ownership and identification.", category: "labels", status: "available", tags: ["Custom"]},
  {id: "shelf-label", name: "Shelf label maker", description: "Create customizable shelf location labels from manual details or CSV.", category: "labels", status: "available", tags: ["Shelving", "Call numbers", "CSV"]},
  {id: "qr-label", name: "QR code label generator", description: "Generate, verify and print QR labels for library resources.", category: "labels", status: "available", tags: ["QR", "CSV", "Print"]},
  {id: "accession-label", name: "Accession number labels", description: "Prepare sequential or custom accession number labels.", category: "labels", status: "available", tags: ["Accession"]},
  {id: "label-designer", name: "Custom label designer", description: "Set label size, spacing, typography and page dimensions.", category: "labels", status: "available", tags: ["Design"]},
  {id: "accession-register", name: "Accession register formatter", description: "Organize book acquisition details into a printable register.", category: "library", status: "available", tags: ["Register", "CSV"], featured: true},
  {id: "purchase-list", name: "Book purchase list formatter", description: "Prepare clean book recommendation and purchase lists.", category: "library", status: "available", tags: ["Acquisitions", "CSV"]},
  {id: "price-calculator", name: "Book price calculator", description: "Calculate discounts, totals and configurable tax amounts.", category: "library", status: "available", tags: ["Calculator"]},
  {id: "stock-verification", name: "Stock verification sheet", description: "Create working sheets for physical stock verification.", category: "library", status: "available", tags: ["Inventory", "CSV"]},
  {id: "member-card", name: "Library member card maker", description: "Prepare printable membership cards from simple records.", category: "library", status: "available", tags: ["Members", "CSV"]},
  {id: "fine-calculator", name: "Overdue fine calculator and receipt", description: "Calculate late return fines and print a clear library receipt.", category: "library", status: "available", tags: ["Calculator", "Receipt"]},
  {id: "annual-report", name: "Library annual report generator", description: "Prepare a professional annual report with statistics and activities.", category: "library", status: "available", tags: ["Annual report", "Statistics", "Print"]},
  {id: "ddc-helper", name: "DDC spine label helper", description: "Format classification details for consistent spine labels.", category: "library", status: "available", tags: ["Classification"]},
  {id: "csv-viewer", name: "CSV viewer", description: "Open and inspect tabular CSV data directly in your browser.", category: "data", status: "available", tags: ["CSV"], featured: true},
  {id: "csv-mapper", name: "CSV column mapper", description: "Match columns from different exports to a consistent format.", category: "data", status: "available", tags: ["CSV", "Mapping"]},
  {id: "csv-cleaner", name: "CSV cleaner", description: "Find blank rows, trim extra spaces and remove duplicates.", category: "data", status: "available", tags: ["CSV", "Cleaning"]},
  {id: "csv-formatter", name: "CSV column formatter", description: "Reorder, rename and format columns in a spreadsheet export.", category: "data", status: "available", tags: ["CSV"]},
  {id: "csv-to-pdf", name: "CSV to PDF", description: "Turn tabular data into a clean, printable PDF document.", category: "data", status: "available", tags: ["PDF", "CSV"]},
  {id: "text-formatter", name: "Bulk text formatter", description: "Clean and format long lists of accession numbers and text.", category: "data", status: "available", tags: ["Text"]},
];
