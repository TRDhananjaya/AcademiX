export default function FeatureCard({ icon, title, description, tags = [] }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:border-slate-200/80 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between h-full relative overflow-hidden">
      {/* Subtle top-right accent glow on hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      <div>
        <div className="w-12 h-12 rounded-xl bg-indigo-50/50 flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300 text-indigo-600">
          {icon}
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {tags.map((tag, index) => (
            <span key={index} className="text-[10px] font-bold text-indigo-600 bg-indigo-50/60 px-2.5 py-1 rounded-md uppercase tracking-wider">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
