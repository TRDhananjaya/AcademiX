import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  FaBookOpen, 
  FaSpellCheck, 
  FaLayerGroup, 
  FaTags, 
  FaFileAlt, 
  FaFolderOpen,
  FaFilePdf,
  FaDownload,
  FaSpinner
} from 'react-icons/fa';

const StudyNotesPage = ({ 
  notesText, 
  definitionsText, 
  definitions = [], 
  modules = [], 
  resources = [], 
  moduleBreakdown = [] 
}) => {
  const [downloadingId, setDownloadingId] = useState(null);

  const cleanNotes = notesText 
    ? notesText.replace(/^[#\s]*\d*\.?\s*PERSONALIZED STUDY NOTES\s*/i, '').trim() 
    : '';

  const cleanDefinitions = definitionsText 
    ? definitionsText.replace(/^[#\s]*\d*\.?\s*KEY DEFINITIONS\s*/i, '').trim() 
    : '';

  const hasModules = modules && modules.length > 0;
  const hasResources = resources && resources.length > 0;

  const handleDownloadResource = async (resItem) => {
    const resId = resItem._id || resItem.id;
    if (!resId) return;
    try {
      setDownloadingId(resId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/${resId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch resource file');
      }
      const data = await response.json();
      if (data && data.url) {
        const fileUrl = data.url;
        if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
          const link = document.createElement('a');
          link.href = fileUrl;
          let filename = resItem.title || 'document';
          if (!filename.toLowerCase().endsWith('.pdf') && (resItem.type === 'PDF' || fileUrl.includes('pdf'))) {
            filename += '.pdf';
          }
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (fileUrl !== '#') {
          window.open(fileUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (err) {
      console.error('Error downloading resource document:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in font-sans">
      
      {/* Chapter Title */}
      <div className="pb-4 border-b border-slate-100">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
          Chapter 3 of 6 · Knowledge Review
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Study Notes & Key Definitions
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-normal">
          High-yield concept summaries and official module short notes curated from database resources.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs overflow-y-auto space-y-6">
        
        {/* Module-Wise Short Notes Section (Fetched from Database Modules & Resources) */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-sm sm:text-base border-b border-slate-100 pb-2">
            <FaLayerGroup className="text-indigo-600 text-base" />
            <span>Module-Wise Short Notes (Database Resources & Modules)</span>
          </div>

          {hasModules ? (
            <div className="space-y-4">
              {modules.map((mod, idx) => {
                // Find matching resources for this specific module
                const modIdStr = mod._id?.toString() || '';
                const modResources = (resources || []).filter(r => {
                  if (!r) return false;
                  const rModId = typeof r.moduleId === 'object' ? r.moduleId?._id?.toString() : r.moduleId?.toString();
                  return rModId === modIdStr;
                });

                // Match with moduleBreakdown score if available
                const mbMatch = moduleBreakdown.find(mb => 
                  mb.moduleTitle?.toLowerCase().includes(mod.title?.toLowerCase()) ||
                  mod.title?.toLowerCase().includes(mb.moduleTitle?.toLowerCase())
                );

                return (
                  <div 
                    key={mod._id || idx}
                    className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs border-l-4 border-l-indigo-600 space-y-3 transition-all hover:border-slate-300"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md">
                          Module {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                          {mod.title}
                        </h4>
                      </div>

                      {mbMatch && typeof mbMatch.score === 'number' && (
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          mbMatch.score >= 70
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : mbMatch.score >= 50
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          Quiz Performance: {mbMatch.score}%
                        </span>
                      )}
                    </div>

                    {/* Topics Pills */}
                    {mod.topics && mod.topics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <FaTags className="text-[10px]" /> Topics:
                        </span>
                        {mod.topics.map((t, tIdx) => (
                          <span 
                            key={tIdx} 
                            className="bg-white border border-slate-200 text-indigo-900 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Module Description / Notes from DB */}
                    <div className="text-slate-700 text-xs sm:text-sm leading-relaxed font-normal">
                      {mod.description ? (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-slate-700 space-y-1">
                          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FaFileAlt className="text-indigo-600" /> MODULE NOTES SUMMARY
                          </div>
                          <p className="whitespace-pre-line m-0 font-medium text-slate-700 text-xs sm:text-sm leading-relaxed">
                            {mod.description}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-indigo-900 text-xs">
                          <span className="font-semibold">Key Focus Notes:</span> Review core mechanics of {mod.title}. Master fundamental concepts and practical application.
                        </div>
                      )}
                    </div>

                    {/* Module PDF Resources from Database */}
                    {modResources.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FaFilePdf className="text-rose-600 text-sm" /> 
                            Database Module PDF Documents & Resources ({modResources.length})
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {modResources.map((resItem, rIdx) => {
                            const isPdf = resItem.type === 'PDF' || (resItem.title && resItem.title.toLowerCase().endsWith('.pdf'));
                            const isDownloading = downloadingId === (resItem._id || resItem.id);

                            return (
                              <div 
                                key={resItem._id || rIdx}
                                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2.5 transition-all hover:border-slate-300"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-start gap-2.5">
                                    {isPdf ? (
                                      <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex-shrink-0">
                                        <FaFilePdf className="text-lg" />
                                      </div>
                                    ) : (
                                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex-shrink-0">
                                        <FaFolderOpen className="text-lg" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <h5 className="font-bold text-slate-800 text-xs sm:text-sm truncate" title={resItem.title}>
                                        {resItem.title}
                                      </h5>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                                          isPdf ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        }`}>
                                          {resItem.type || 'PDF'}
                                        </span>
                                        {resItem.size && (
                                          <span className="text-[10px] text-slate-400 font-medium">
                                            {resItem.size}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {resItem.description && (
                                    <p className="text-slate-600 text-[11px] leading-relaxed m-0 font-normal line-clamp-2">
                                      {resItem.description}
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleDownloadResource(resItem)}
                                  disabled={isDownloading}
                                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                                    isPdf
                                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-xs'
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-xs'
                                  }`}
                                >
                                  {isDownloading ? (
                                    <>
                                      <FaSpinner className="animate-spin text-xs" />
                                      <span>Loading PDF...</span>
                                    </>
                                  ) : (
                                    <>
                                      {isPdf ? <FaFilePdf className="text-xs" /> : <FaDownload className="text-xs" />}
                                      <span>View / Download {isPdf ? 'PDF Document' : 'Resource'}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs sm:text-sm font-normal">
              Loading module-wise short notes from database resources...
            </div>
          )}
        </div>

        {/* Database General Resources & PDF Documents Section */}
        {hasResources && (
          <div className="pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <FaFilePdf className="text-rose-600 text-base" />
              <span>Official Database PDF Documents & Learning Resources</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {resources.map((resItem, rIdx) => {
                const isPdf = resItem.type === 'PDF' || (resItem.title && resItem.title.toLowerCase().endsWith('.pdf'));
                const isDownloading = downloadingId === (resItem._id || resItem.id);

                return (
                  <div 
                    key={resItem._id || rIdx}
                    className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-2xs hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        {isPdf ? (
                          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex-shrink-0">
                            <FaFilePdf className="text-lg" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex-shrink-0">
                            <FaFolderOpen className="text-lg" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-slate-800 text-xs sm:text-sm truncate" title={resItem.title}>
                            {resItem.title}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isPdf ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            }`}>
                              {resItem.type || 'PDF'}
                            </span>
                            {resItem.size && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                {resItem.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {resItem.description && (
                        <p className="text-slate-600 text-xs leading-relaxed font-normal m-0 pt-1">
                          {resItem.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDownloadResource(resItem)}
                      disabled={isDownloading}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        isPdf
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-xs'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-xs'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <FaSpinner className="animate-spin text-xs" />
                          <span>Loading PDF...</span>
                        </>
                      ) : (
                        <>
                          {isPdf ? <FaFilePdf className="text-xs" /> : <FaDownload className="text-xs" />}
                          <span>View / Download {isPdf ? 'PDF Document' : 'Resource'}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Diagnostic AI Notes & Principles */}
        {cleanNotes && (
          <div className="pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <FaBookOpen className="text-indigo-500" />
              <span>Personalized Diagnostic Study Notes</span>
            </div>

            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 font-normal leading-relaxed space-y-3">
              <ReactMarkdown
                components={{
                  h2: ({ node, ...props }) => (
                    <div className="mt-4 mb-2 pb-1 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800" {...props} />
                    </div>
                  ),
                  h3: ({ node, ...props }) => (
                    <h4 className="text-xs font-semibold text-indigo-900 mt-3 mb-1" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-slate-800" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="my-1.5 leading-relaxed font-normal text-slate-600" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 my-2 space-y-1 text-slate-600" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="my-0.5 leading-relaxed font-normal text-slate-600" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <div className="bg-indigo-50/50 border-l-3 border-indigo-500 p-3 rounded-r-xl my-2.5 text-slate-700 font-normal text-xs">
                      <blockquote {...props} />
                    </div>
                  )
                }}
              >
                {cleanNotes}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Official Terminology Flashcards */}
        {(definitions.length > 0 || cleanDefinitions) && (
          <div className="pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <FaSpellCheck className="text-purple-500" />
              <span>Essential Definitions to Memorize</span>
            </div>

            {definitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {definitions.map((item, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 shadow-2xs border-l-4 border-l-purple-500 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        {item.term}
                      </h4>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                        Term #{idx + 1}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed font-normal m-0">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="prose prose-slate max-w-none text-xs text-slate-600 font-normal">
                <ReactMarkdown>{cleanDefinitions}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default StudyNotesPage;
