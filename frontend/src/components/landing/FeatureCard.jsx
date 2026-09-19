export default function FeatureCard({ icon, title, description, tags = [] }) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-sm border border-indigo-100/70 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between h-full relative overflow-hidden">
      {/* Subtle top-right accent glow on hover matching hero */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div>
        {/* Gradient Icon Badge with bright white icon */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-md shadow-indigo-300/50 group-hover:scale-110 group-hover:shadow-indigo-400/70 transition-all duration-300 [&_svg]:!text-white [&_svg]:!stroke-white [&_svg]:!w-5 [&_svg]:!h-5">
          {icon}
        </div>
        
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-5">
          {description}
        </p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 border border-indigo-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
