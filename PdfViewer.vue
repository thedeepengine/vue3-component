<template>
  <div>
    <!-- Container for the PDF viewer -->
    <div ref="viewerContainer" class="pdf-viewer-container">
      <div class="pdfViewer"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFViewer, EventBus } from 'pdfjs-dist/web/pdf_viewer';
import { dimStore } from '@/components_shared/dimStore.js'
import 'pdfjs-dist/web/pdf_viewer.css';

const dim_store = dimStore()
const viewerContainer = ref(null);
let pdfViewer;

onMounted(async () => {
  // Set the worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs';

  const eventBus = new EventBus();

  pdfViewer = new PDFViewer({
    container: viewerContainer.value,
    eventBus,
  });

  set_pdf_file(dim_store.pdf_path)
});

onUnmounted(() => {
    window.removeEventListener('resize', resizeListener);
    if (pdfViewer) {
      pdfViewer.cleanup();
    }
  });

async function set_pdf_file(pdf_path) {
  // let pdf_path = 'http://localhost:5173/2412.18601v1.pdf'
  const loadingTask = pdfjsLib.getDocument(pdf_path);
  const pdfDocument = await loadingTask.promise;

  console.log('pdfViewer.vaaaaaalue', pdfViewer)
  pdfViewer.setDocument(pdfDocument);

  const firstPage = await pdfViewer.firstPagePromise;

  const adjustScale = () => {
    const container = viewerContainer;
    if (container && firstPage) {
      const pageView = firstPage.view;
      const widthScale = container.clientWidth / pageView[2];
      const heightScale = container.clientHeight / pageView[3];
      console.log('widthScale', widthScale)
      console.log('widthScale', heightScale)
      const scale = Math.min(widthScale, heightScale); // Fit both width and height
      console.log('scale', scale)
      pdfViewer.currentScale = 0.9;
    }
  };

  adjustScale();
  window.addEventListener('resize', adjustScale);

}

watch(()=> dim_store.pdf_path, () => {
  console.log('dim_store.------pdf_path', dim_store.pdf_path)
  set_pdf_file(dim_store.pdf_path)
})

</script>



<style>
.pdf-viewer-container {
  position: absolute;
  /* Ensure absolute positioning */
  top: 0;
  /* Adjust as necessary */
  left: 0;
  /* Adjust as necessary */
  right: 0;
  width: 100%;
  /* Or a fixed width like 400px */
  height: auto;
  /* Let height be determined by content */
  overflow: hidden;
  /* Prevent overflow */
  display: flex;
  /* Flex layout to help center the content */
  justify-content: center;
  /* Center the PDF horizontally */
  align-items: center;
  /* Center the PDF vertically */
}

.pdfViewer {
  width: 100%;
  /* Fit the container width */
  height: auto;
  /* Maintain aspect ratio */
}

.pdfViewer .page {
  margin: 0 auto;
  /* Center the page */
  border: none !important;
  /* Remove borders */
}
</style>
