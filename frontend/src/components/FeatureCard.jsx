export default function FeatureCard({ icon, title, description, tags = [] }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-md-custom hover:shadow-lg-custom transition-shadow hover:-translate-y-1 group">
      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-4">{description}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="text-xs font-semibold text-primary bg-indigo-50 px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
