import React, { useState } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';

const DownloadButtons = ({ elementId, filename, planData, user }) => {
  const [downloadState, setDownloadState] = useState({ active: false, text: '' });

  const fetchPdfBlob = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/study-plans/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planData, user })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to generate PDF on server');
    }

    return await response.blob();
  };

  const handleDownloadPdf = async () => {
    if (!planData) return;
    
    setDownloadState({ active: true, text: 'Generating PDF on server...' });
    
    try {
      const blob = await fetchPdfBlob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'AI_Study_Plan.pdf';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert(`Failed to generate PDF report: ${error.message}`);
    } finally {
      setDownloadState({ active: false, text: '' });
    }
  };

  const handlePrint = async () => {
    if (!planData) return;
    
    setDownloadState({ active: true, text: 'Preparing Print View...' });
    
    try {
      const blob = await fetchPdfBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // We don't revoke here immediately because the new tab needs time to load the blob
    } catch (error) {
      console.error('Failed to prepare print view:', error);
      alert(`Failed to prepare print view: ${error.message}`);
    } finally {
      setDownloadState({ active: false, text: '' });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 no-print">
      <button 
        onClick={handleDownloadPdf}
        disabled={downloadState.active}
        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed border-none cursor-pointer"
      >
        {downloadState.active ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FiDownload className="w-4 h-4" />
        )}
        {downloadState.active ? downloadState.text : 'Download PDF'}
      </button>
      
      <button 
        onClick={handlePrint}
        disabled={downloadState.active}
        className="flex items-center gap-2 bg-white text-slate-700 border-2 border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <FiPrinter className="w-4 h-4" />
        Print Report
      </button>
    </div>
  );
};

export default DownloadButtons;
