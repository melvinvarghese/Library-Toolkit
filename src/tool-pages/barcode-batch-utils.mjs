const normalize=value=>String(value??"").toLowerCase().replace(/[^a-z0-9]/g,"");
const bounded=(value,min,max,fallback)=>{const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;};

export function suggestBarcodeColumns(headers,{member=false}={}) {
  const normalized=headers.map(normalize);
  const valueIndex=normalized.findIndex(value=>member?/^(member|membership)?(id|number|no)$/.test(value):/(barcode|accession|value|code|id|number)/.test(value));
  const captionIndex=normalized.findIndex(value=>/^(member)?name$|fullname/.test(value));
  return {valueIndex:valueIndex<0?0:valueIndex,captionIndex};
}

export function prepareBarcodeRecords(table,{valueIndex=null,captionIndex=-1,maxRecords=500}={}) {
  if(!table.headers.length||!table.rows.length)throw new RangeError("Add a CSV header row and at least one record.");
  if(!Number.isInteger(maxRecords)||maxRecords<1)throw new RangeError("The batch limit must be a positive whole number.");
  if(table.rows.length>maxRecords)throw new RangeError(`Create barcode sheets in batches of ${maxRecords} records or fewer.`);
  const selected=valueIndex===null?suggestBarcodeColumns(table.headers).valueIndex:Number(valueIndex);
  const caption=captionIndex===null?-1:Number(captionIndex);
  if(!Number.isInteger(selected)||selected<0||selected>=table.headers.length)throw new RangeError("Choose a valid barcode column.");
  if(caption!==-1&&(!Number.isInteger(caption)||caption<0||caption>=table.headers.length))throw new RangeError("Choose a valid caption column.");
  let skippedEmpty=0;
  const records=table.rows.map(row=>({value:String(row[selected]??"").trim(),caption:caption<0?"":String(row[caption]??"").trim()})).filter(row=>{if(row.value)return true;skippedEmpty+=1;return false;});
  return {records,skippedEmpty};
}

export function clampBarcodeSheet({pageWidth=210,pageHeight=297,margin=12,gap=8,columns=2}={}) {
  return {
    pageWidth:bounded(pageWidth,100,420,210),
    pageHeight:bounded(pageHeight,100,594,297),
    margin:bounded(margin,0,30,12),
    gap:bounded(gap,0,30,8),
    columns:Math.round(bounded(columns,1,6,2)),
  };
}
