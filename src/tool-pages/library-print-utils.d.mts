export interface ArrivalBook {title:string;author:string;callNumber:string}
export function parseArrivalBooks(input:string,options?:{maxBooks?:number}):ArrivalBook[];
export interface DueDateSlip {bookTitle:string;borrower:string;memberId:string;issueDate:string;dueDate:string}
export function validateDueDateSlip(values:DueDateSlip):DueDateSlip;
export function clampOwnershipStamp(options?:{width?:number;height?:number;copies?:number;fontSize?:number}):{width:number;height:number;copies:number;fontSize:number};
