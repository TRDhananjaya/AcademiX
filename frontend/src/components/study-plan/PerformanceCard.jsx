import React from 'react';
import { FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

const PerformanceCard = ({ score, summaryText }) => {
  const numericScore = parseFloat(score) || 0;
  
  let performanceLevel = "Excellent";
  let bgClass = "bg-emerald-50";
  let textClass = "text-emerald-700";
  let icon = <FiTrendingUp className="text-emerald-500 w-6 h-6" />;
  
  if (numericScore < 50) {
    performanceLevel = "Needs Improvement";
    bgClass = "bg-rose-50";
    textClass = "text-rose-700";
    icon = <FiAlertCircle className="text-rose-500 w-6 h-6" />;
  } else if (numericScore < 75) {
    performanceLevel = "Good";
    bgClass = "bg-amber-50";
    textClass = "text-amber-700";
    icon = <FiTrendingUp className="text-amber-500 w-6 h-6" />;
  }

  // Parse lines to display as proper paragraphs
  const paragraphs = summaryText.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${bgClass}`}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Performance Summary</h2>
          <div className={`text-sm font-semibold ${textClass}`}>{performanceLevel}</div>
        </div>
      </div>
      
      <div className="flex-1 text-slate-600 text-[15px] leading-relaxed space-y-3">
        {paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    </div>
  );
};

export default PerformanceCard;
