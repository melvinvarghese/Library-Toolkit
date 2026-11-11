const text=value=>String(value??"").trim();
const bounded=(value,min,max,fallback)=>{const number=Number(value);return Number.isFinite(number)?Math.max(min,Math.min(max,number)):fallback;};

export function parseArrivalBooks(input,{maxBooks=40}={}){
  const books=text(input).split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    const [title="",author="",callNumber=""]=line.split("|").map(text);
    if(!title)throw new RangeError("Each poster line needs a book title.");
    return {title,author,callNumber};
  });
  if(!books.length)throw new RangeError("Add at least one book to the poster.");
  if(books.length>maxBooks)throw new RangeError(`Posters support up to ${maxBooks} books.`);
  return books;
}

export function validateDueDateSlip(values){
  const slip={bookTitle:text(values.bookTitle),borrower:text(values.borrower),memberId:text(values.memberId),issueDate:text(values.issueDate),dueDate:text(values.dueDate)};
  if(Object.values(slip).some(value=>!value))throw new RangeError("Enter the book, borrower, member ID, issue date, and due date.");
  const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
  if(!validDate(slip.issueDate)||!validDate(slip.dueDate))throw new RangeError("Enter valid issue and due dates.");
  if(slip.dueDate<slip.issueDate)throw new RangeError("The due date cannot be before the issue date.");
  return slip;
}

export function clampOwnershipStamp({width=65,height=35,copies=8,fontSize=12}={}){
  return {width:Math.round(bounded(width,20,100,65)),height:Math.round(bounded(height,20,100,35)),copies:Math.round(bounded(copies,1,60,8)),fontSize:Math.round(bounded(fontSize,6,30,12))};
}
