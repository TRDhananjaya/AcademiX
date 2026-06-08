import logoBlack from '../../assets/logo_black.png';
import { FiArrowRight, FiSearch } from 'react-icons/fi';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 py-24 lg:py-36 relative overflow-hidden">
      {/* Drifting premium blurred glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px] animate-drift"></div>
        <div className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] rounded-full bg-purple-200/40 blur-[120px] animate-drift-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Animated Logo Container */}
        <div className="flex items-center justify-center mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <img src={logoBlack} alt="AcademiX Logo" className="h-28 w-auto object-contain hover:scale-105 transition-transform duration-500 cursor-pointer" />
        </div> 
        
        {/* Animated Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mb-8 leading-tight tracking-tight opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
          Transform Learning with<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI-Powered Education</span>
        </h1>
        
        {/* Animated Subtitle */}
        <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          Elevate student success with dynamic adaptive quizzes, predictive ML analytics, and intelligent study paths tailored to individual cognitive profiles.
        </p>

        {/* Animated Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
          <button 
            onClick={() => {
              window.history.pushState({}, '', '/login');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-md hover:shadow-indigo-600/20 hover:-translate-y-0.5 cursor-pointer"
          >
            Get Started <FiArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          >
            <FiSearch className="w-5 h-5 text-slate-400" /> Explore Features
          </button>
        </div>

      </div>
    </section>
  );
}
