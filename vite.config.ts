import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {defineConfig} from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "/Library-Toolkit/",
  build: {
    sourcemap: false,
    target: "es2020",
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        continuousBarcode: resolve(root, "barcode/continuous/index.html"),
        isbnBarcode: resolve(root, "barcode/isbn/index.html"),
        customBarcode: resolve(root, "barcode/custom/index.html"),
        spineLabels: resolve(root, "labels/spine/index.html"),
        accessionRegister: resolve(root, "library/accession-register/index.html"),
        purchaseList: resolve(root, "library/purchase-list/index.html"),
        priceCalculator: resolve(root, "library/price-calculator/index.html"),
        stockVerification: resolve(root, "library/stock-verification/index.html"),
        memberCard: resolve(root, "library/member-card/index.html"),
        csvToPdf: resolve(root, "data/csv-to-pdf/index.html"),
      },
    },
  },
});
