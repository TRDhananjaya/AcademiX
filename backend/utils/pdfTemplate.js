const { marked } = require('marked');

const generatePdfTemplate = (planData, user) => {
  const markdown = planData.generatedStudyPlan || '';
  const htmlContent = marked.parse(markdown);
  
  const studentName = user?.name || user?.username || 'Student';
  const lessonTitle = planData.lessonId?.title || planData.lessonTitle || 'Unknown Module';
  const dateStr = planData.createdAt ? new Date(planData.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Study Plan</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #334155;
          line-height: 1.6;
          font-size: 14px;
        }
        h1, h2, h3, h4 {
          color: #0f172a;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        h1 { font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        h2 { font-size: 20px; color: #4338ca; }
        h3 { font-size: 16px; }
        
        /* Header */
        .header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header-title {
          font-size: 28px;
          font-weight: 800;
          color: #1e1b4b;
          margin: 0 0 10px 0;
        }
        .header-meta {
          display: flex;
          justify-content: space-between;
          color: #64748b;
          font-size: 12px;
        }

        /* Content spacing */
        p { margin: 0 0 1em 0; }
        ul, ol { margin: 0 0 1em 0; padding-left: 20px; }
        li { margin-bottom: 0.25em; }
        
        strong { color: #1e293b; }
        
        /* Page break controls */
        .page-break {
          page-break-after: always;
        }
        h1, h2 {
          page-break-after: avoid;
        }
        p, li {
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="header-title">AI Personalized Study Plan</h1>
        <div class="header-meta">
          <div><strong>Student:</strong> ${studentName}</div>
          <div><strong>Module:</strong> ${lessonTitle}</div>
          <div><strong>Date:</strong> ${dateStr}</div>
        </div>
      </div>
      
      <div class="content">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  generatePdfTemplate
};
