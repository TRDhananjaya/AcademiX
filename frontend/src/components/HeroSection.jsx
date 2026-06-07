export default function HeroSection() {
  return (
    <section className="bg-gradient-hero py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 mb-6">
          <span className="text-xl">🚀</span>
          <span className="text-sm font-semibold text-text-primary">Next-Gen EdTech Platform</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
          Transform Learning with<br />
          AI-Powered Personalized Education
        </h1>
        
        <p className="text-lg text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
          Elevate student success with dynamic adaptive quizzes, predictive ML<br />
          analytics, and intelligent study paths tailored to individual cognitive profiles.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="btn btn-primary">
            Get Started <span>→</span>
          </button>
          <button className="btn btn-secondary">
            <span>🔍</span> Explore Features
          </button>
        </div>
      </div>
    </section>
  );
}
