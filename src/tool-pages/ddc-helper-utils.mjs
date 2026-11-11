export function formatDdcLabel({classNumber,cutter="",year=""}) {
  const values=[classNumber,cutter,year].map(value=>String(value??"").trim());
  if(!values[0])throw new RangeError("Enter the class number assigned by your library.");
  if(values.some(value=>value.length>160))throw new RangeError("Each label line must be 160 characters or fewer.");
  const lines=values.filter(Boolean);
  return {lines,callNumber:lines.join(" ")};
}
