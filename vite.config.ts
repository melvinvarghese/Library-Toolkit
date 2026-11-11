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
        shelfLabels: resolve(root, "labels/shelf/index.html"),
        qrLabels: resolve(root, "labels/qr-code/index.html"),
        accessionRegister: resolve(root, "library/accession-register/index.html"),
        purchaseList: resolve(root, "library/purchase-list/index.html"),
        priceCalculator: resolve(root, "library/price-calculator/index.html"),
        stockVerification: resolve(root, "library/stock-verification/index.html"),
        memberCard: resolve(root, "library/member-card/index.html"),
        fineCalculator: resolve(root, "library/fine-calculator/index.html"),
        annualReport: resolve(root, "library/annual-report/index.html"),
        csvToPdf: resolve(root, "data/csv-to-pdf/index.html"),
        csvBarcode: resolve(root, "barcode/csv/index.html"),
        memberBarcode: resolve(root, "barcode/member/index.html"),
        barcodeSheet: resolve(root, "barcode/sheet/index.html"),
        spineLabelsCsv: resolve(root, "labels/spine-csv/index.html"),
        fourLineLabels: resolve(root, "labels/four-line/index.html"),
        bookLabels: resolve(root, "labels/book/index.html"),
        accessionLabels: resolve(root, "labels/accession/index.html"),
        labelDesigner: resolve(root, "labels/designer/index.html"),
        ddcHelper: resolve(root, "library/ddc-helper/index.html"),
        csvViewer: resolve(root, "data/csv-viewer/index.html"),
        csvMapper: resolve(root, "data/csv-mapper/index.html"),
        csvCleaner: resolve(root, "data/csv-cleaner/index.html"),
        csvFormatter: resolve(root, "data/csv-formatter/index.html"),
        textFormatter: resolve(root, "data/text-formatter/index.html"),
      },
    },
  },
});
