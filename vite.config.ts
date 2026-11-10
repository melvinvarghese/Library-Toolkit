import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {defineConfig} from "vite";

const root=fileURLToPath(new URL(".",import.meta.url));

export default defineConfig({
  base:"/Library-Toolkit/",
  build:{
    sourcemap:false,
    target:"es2020",
    rollupOptions:{
      input:{
        main:resolve(root,"index.html"),
        continuousBarcode:resolve(root,"barcode/continuous/index.html"),\n        isbnBarcode:resolve(root,"barcode/isbn/index.html"),\n        customBarcode:resolve(root,"barcode/custom/index.html"),\n        spineLabels:resolve(root,"labels/spine/index.html")
      }
    }
  }
});
