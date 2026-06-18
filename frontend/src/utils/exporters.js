/**
 * Chuyển đổi mã HTML sang định dạng Markdown cơ bản
 */
export const htmlToMarkdown = (html) => {
  if (!html) return '';
  let md = html;
  
  // Thay thế tiêu đề (H1, H2, H3)
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
  
  // Thay thế danh sách
  md = md.replace(/<li>(.*?)<\/li>/gi, '* $1\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<ul>/gi, '');
  md = md.replace(/<ol>/gi, '');
  
  // Thay thế định dạng chữ (In đậm, in nghiêng, gạch chân, gạch ngang)
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<u>(.*?)<\/u>/gi, '_$1_');
  md = md.replace(/<s>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<strike>(.*?)<\/strike>/gi, '~~$1~~');
  
  // Thay thế thẻ liên kết (a href)
  md = md.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Thay thế thẻ đoạn văn (p) và xuống dòng (br)
  md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  
  // Loại bỏ các thẻ HTML còn sót lại
  md = md.replace(/<[^>]*>/g, '');
  
  // Giải mã một số ký tự HTML entities phổ biến
  const entities = {
    '&nbsp;': ' ',
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"'
  };
  Object.keys(entities).forEach(entity => {
    md = md.replace(new RegExp(entity, 'g'), entities[entity]);
  });
  
  return md.trim();
};

/**
 * Trình tải file Helper chung trong trình duyệt
 */
const downloadFile = (content, filename, contentType) => {
  const blob = new Blob(['\ufeff' + content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Tải bài viết dưới dạng file Microsoft Word (.doc)
 * Word có khả năng đọc mã HTML trực tiếp nếu được định danh XML namespace.
 */
export const downloadAsWord = (title, htmlContent) => {
  const cleanTitle = title || 'Bai_viet';
  const filename = `${cleanTitle.trim().replace(/[\s/\\:*?"<>|]+/g, '_')}.doc`;
  
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${cleanTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
        }
        h1, h2, h3 { color: #1e3a8a; }
        a { color: #2563eb; text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>${cleanTitle}</h1>
      <hr/>
      ${htmlContent}
    </body>
    </html>
  `;
  
  downloadFile(header, filename, 'application/msword;charset=utf-8');
};

/**
 * Tải bài viết dưới dạng file Markdown (.md)
 */
export const downloadAsMarkdown = (title, htmlContent) => {
  const cleanTitle = title || 'Bai_viet';
  const filename = `${cleanTitle.trim().replace(/[\s/\\:*?"<>|]+/g, '_')}.md`;
  const markdown = htmlToMarkdown(htmlContent);
  
  downloadFile(markdown, filename, 'text/markdown;charset=utf-8');
};

/**
 * Tải bài viết dưới dạng file HTML (.html)
 */
export const downloadAsHtml = (title, htmlContent) => {
  const cleanTitle = title || 'Bai_viet';
  const filename = `${cleanTitle.trim().replace(/[\s/\\:*?"<>|]+/g, '_')}.html`;
  
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${cleanTitle}</title>
      <style>
        body {
          max-width: 800px;
          margin: 40px auto;
          padding: 0 20px;
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.7;
          color: #1f2937;
          background-color: #f9fafb;
        }
        .container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        h1 { font-size: 2.25rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem; }
        h2 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-top: 2rem; }
        h3 { font-size: 1.25rem; font-weight: 600; color: #374151; margin-top: 1.5rem; }
        hr { border: 0; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
        a { color: #2563eb; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${cleanTitle}</h1>
        <hr/>
        <div class="content">
          ${htmlContent}
        </div>
      </div>
    </body>
    </html>
  `;
  
  downloadFile(fullHtml, filename, 'text/html;charset=utf-8');
};
