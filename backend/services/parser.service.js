import mammoth from 'mammoth';

/**
 * Trích xuất văn bản từ buffer của tệp dựa trên định dạng của nó
 * @param {Buffer} buffer - Buffer nội dung tệp tin
 * @param {string} originalname - Tên gốc của tệp tin đính kèm
 * @returns {Promise<string>} Nội dung văn bản thô
 */
export const extractTextFromBuffer = async (buffer, originalname) => {
  const ext = originalname.split('.').pop().toLowerCase();

  switch (ext) {
    case 'txt':
      return buffer.toString('utf-8');
      
    case 'pdf': {
      // Polyfill DOMMatrix (pdfjs-dist cần API trình duyệt này)
      if (typeof global.DOMMatrix === 'undefined') {
        global.DOMMatrix = class DOMMatrix { constructor() {} };
      }

      // Sử dụng pdfjs-dist legacy build trực tiếp (tương thích Node.js)
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
      const doc = await loadingTask.promise;

      const textParts = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        textParts.push(pageText);
      }
      
      await doc.destroy();
      return textParts.join('\n');
    }
      
    case 'docx': {
      // mammoth trích xuất text thô từ tệp Word .docx
      const docxData = await mammoth.extractRawText({ buffer });
      return docxData.value || '';
    }
      
    default:
      throw new Error(`Định dạng tệp .${ext} không hỗ trợ trích xuất văn bản.`);
  }
};
