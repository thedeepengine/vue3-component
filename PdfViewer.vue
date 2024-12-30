<template>
    <div>
      <!-- Container for the PDF viewer -->
      <div ref="viewerContainer" class="pdf-viewer-container">
        <div class="pdfViewer"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import * as pdfjsLib from 'pdfjs-dist';
  import { PDFViewer, EventBus } from 'pdfjs-dist/web/pdf_viewer';
  
  import 'pdfjs-dist/web/pdf_viewer.css';
  
  const viewerContainer = ref(null);
  
  onMounted(async () => {
    // Set the worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs';
  
    const eventBus = new EventBus();
  
    const pdfViewer = new PDFViewer({
      container: viewerContainer.value,
      eventBus,
    });
  
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument('http://localhost:5173/2412.18601v1.pdf');
    const pdfDocument = await loadingTask.promise;
  
    pdfViewer.setDocument(pdfDocument);
  
    // Wait for the first page to be rendered
    const firstPage = await pdfViewer.firstPagePromise;
  
    // Adjust the scale dynamically
    const adjustScale = () => {
      const container = viewerContainer.value;
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
  
    // Adjust scale initially and on resize
    adjustScale();
    window.addEventListener('resize', adjustScale);
  });
  </script>
  


<style>
.pdf-viewer-container {
  position: absolute; /* Ensure absolute positioning */
  top: 0; /* Adjust as necessary */
  left: 0; /* Adjust as necessary */
  right: 0;
  width: 100%; /* Or a fixed width like 400px */
  height: auto; /* Let height be determined by content */
  overflow: hidden; /* Prevent overflow */
  display: flex; /* Flex layout to help center the content */
  justify-content: center; /* Center the PDF horizontally */
  align-items: center; /* Center the PDF vertically */
}

.pdfViewer {
  width: 100%; /* Fit the container width */
  height: auto; /* Maintain aspect ratio */
}

.pdfViewer .page {
  margin: 0 auto; /* Center the page */
  border: none !important; /* Remove borders */
}

</style>
