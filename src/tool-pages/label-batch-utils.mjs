const normalize=value=>String(value??"").toLowerCase().replace(/[^a-z0-9]/g,"");
const bounded=(value,min,max,fallback)=>{const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;};

export function mapLabelRows(table,fields) {
  const indexes=fields.map(field=>table.headers.findIndex(header=>field.aliases.includes(normalize(header))));
  return table.rows.map(row=>Object.fromEntries(fields.map((field,index)=>[field.key,indexes[index]<0?"":String(row[indexes[index]]??"").trim()])));
}

export function makeSequentialAccessionLabels({start,count,prefix=""}) {
  const first=String(start??"").trim(),amount=Number(count);
  if(!/^\d+$/.test(first))throw new RangeError("Starting accession number must contain digits only.");
  if(!Number.isSafeInteger(amount)||amount<1||amount>500)throw new RangeError("Choose a batch of 1 to 500 accession labels.");
  const initial=Number(first);
  if(!Number.isSafeInteger(initial)||!Number.isSafeInteger(initial+amount-1))throw new RangeError("Accession numbers must stay within the safe integer range.");
  return Array.from({length:amount},(_,index)=>String(prefix)+String(initial+index).padStart(first.length,"0"));
}

export function clampLabelSheet({width=70,height=35,columns=3,fontSize=14}={}) {
  return {width:bounded(width,25,180,70),height:bounded(height,15,100,35),columns:Math.round(bounded(columns,1,5,3)),fontSize:bounded(fontSize,6,36,14)};
}
