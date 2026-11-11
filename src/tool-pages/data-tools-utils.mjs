const asText=value=>String(value??"");

function applyCase(value,mode="none") {
  const text=asText(value).trim();
  if(mode==="upper")return text.toLocaleUpperCase();
  if(mode==="lower")return text.toLocaleLowerCase();
  if(mode==="title")return text.toLocaleLowerCase().replace(/(^|[\s\-'])\p{L}/gu,letter=>letter.toLocaleUpperCase());
  return text;
}

export function cleanCsvTable(table,{trim=true,removeBlankRows=true,removeDuplicates=false}={}) {
  const headers=table.headers.map(header=>trim?asText(header).trim():asText(header));
  let removedBlankRows=0,removedDuplicateRows=0;
  const seen=new Set(),rows=[];
  for(const source of table.rows){
    const row=headers.map((_,index)=>{const value=asText(source[index]);return trim?value.trim():value;});
    if(removeBlankRows&&row.every(value=>value==="")){removedBlankRows+=1;continue;}
    const key=JSON.stringify(row);
    if(removeDuplicates&&seen.has(key)){removedDuplicateRows+=1;continue;}
    seen.add(key);rows.push(row);
  }
  return {headers,rows,removedBlankRows,removedDuplicateRows};
}

export function mapCsvColumns(table,mappings) {
  if(!Array.isArray(mappings)||!mappings.length)throw new RangeError("Choose at least one source column.");
  const usedSources=new Set(),usedTargets=new Set();
  const indexes=mappings.map(mapping=>{
    const source=asText(mapping.source).trim(),target=asText(mapping.target).trim();
    const index=table.headers.findIndex(header=>asText(header).trim()===source);
    if(index<0)throw new RangeError(`Source column “${source}” was not found.`);
    if(usedSources.has(index))throw new RangeError(`Source column “${source}” cannot be mapped more than once.`);
    if(!target)throw new RangeError("New column names cannot be blank.");
    if(usedTargets.has(target.toLocaleLowerCase()))throw new RangeError(`New column “${target}” is used more than once.`);
    usedSources.add(index);usedTargets.add(target.toLocaleLowerCase());
    return {index,target};
  });
  return {headers:indexes.map(item=>item.target),rows:table.rows.map(row=>indexes.map(item=>asText(row[item.index])))};
}

export function formatCsvTable(table,{order=null,caseMode="none"}={}) {
  const indexes=order===null?table.headers.map((_,index)=>index):order.map(Number);
  if(!indexes.length||indexes.some(index=>!Number.isInteger(index)||index<0||index>=table.headers.length))throw new RangeError("Choose valid columns for the output order.");
  if(new Set(indexes).size!==indexes.length)throw new RangeError("A column cannot appear more than once.");
  if(!["none","upper","lower","title"].includes(caseMode))throw new RangeError("Choose a supported text format.");
  return {headers:indexes.map(index=>applyCase(table.headers[index],caseMode)),rows:table.rows.map(row=>indexes.map(index=>applyCase(row[index],caseMode)))};
}

function csvCell(value) {
  let text=asText(value);
  if(/^[\s]*[=+@\-\t\r]/.test(text))text="'"+text;
  return /[",\r\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;
}

export function serializeCsv(headers,rows) {
  return [headers,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n");
}

export function formatTextLines(input,{unique=false,sort="none",caseMode="none",removeBlank=true}={}) {
  let lines=asText(input).split(/\r?\n/).map(line=>applyCase(line,caseMode));
  if(removeBlank)lines=lines.filter(Boolean);
  if(unique){const seen=new Set();lines=lines.filter(line=>{const key=line.toLocaleLowerCase();if(seen.has(key))return false;seen.add(key);return true;});}
  if(sort==="ascending")lines.sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:"base"}));
  else if(sort==="descending")lines.sort((a,b)=>b.localeCompare(a,undefined,{numeric:true,sensitivity:"base"}));
  else if(sort!=="none")throw new RangeError("Choose a supported sort order.");
  return lines.join("\n");
}
