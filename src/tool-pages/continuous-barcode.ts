import "../styles.css";
import "./continuous-barcode.css";
import {mountContinuousBarcode} from "../barcode";

const container=document.querySelector<HTMLDivElement>("#barcode-generator");
if(!container) throw new Error("Barcode generator container was not found.");

mountContinuousBarcode(container,()=>{
  window.location.href="/Library-Toolkit/#tools";
});
