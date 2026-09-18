import { navigate } from '../../App';
import heroTeacherCutout from '../../assets/hero_teacher_card.png';
import logoBlack from '../../assets/logo_black.png';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

export default function HeroSection() {
  const handleClick = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <section className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/60 relative overflow-hidden min-h-screen lg:h-screen pt-16 pb-6 flex items-center select-none">



      {/* Drifting Ambient Gradient Glow Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-12 -left-12 w-[50%] h-[50%] rounded-full bg-indigo-200/35 blur-[120px] animate-drift"></div>
        <div className="absolute -bottom-12 -right-12 w-[50%] h-[50%] rounded-full bg-purple-200/35 blur-[120px] animate-drift-slow"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-indigo-100/40 blur-[90px]"></div>
      </div>

      {/* Flowing Curved Waves & Concentric Ring Vectors (matching Login & Landing aesthetic) */}
      <svg
        className="absolute -top-16 -left-16 w-[640px] h-[640px] text-indigo-300/35 pointer-events-none stroke-current -z-10"
        viewBox="0 0 600 600"
        fill="none"
      >
        <path d="M-80,60 C80,140 200,240 320,440 C400,580 520,600 620,620" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M-40,20 C120,100 240,200 360,400 C440,540 560,560 660,580" strokeWidth="2" opacity="0.7" />
        <path d="M0,-20 C160,60 280,160 400,360 C480,500 600,520 700,540" strokeWidth="2.5" opacity="0.9" />
        <circle cx="180" cy="180" r="180" strokeWidth="1" opacity="0.3" />
        <circle cx="180" cy="180" r="280" strokeWidth="1" strokeDasharray="6 6" opacity="0.2" />
      </svg>

      <svg
        className="absolute -bottom-20 -right-20 w-[580px] h-[580px] text-purple-300/30 pointer-events-none stroke-current -z-10"
        viewBox="0 0 550 550"
        fill="none"
      >
        <path d="M580,20 C460,120 340,240 220,380 C140,480 40,520 -20,540" strokeWidth="2" opacity="0.7" />
        <path d="M620,60 C500,160 380,280 260,420 C180,520 80,560 20,580" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.5" />
        <circle cx="400" cy="400" r="200" strokeWidth="1" opacity="0.25" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Stylized Cutout Educator without square box, larger with glowing aura & floating badges */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start items-center relative order-2 lg:order-1">
            <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[530px] xl:max-w-[570px] flex items-center justify-center group">

              {/* Soft Circular Gradient Aura */}
              <div className="absolute w-72 sm:w-88 lg:w-[440px] aspect-square rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-indigo-300/10 blur-3xl -z-10 pointer-events-none" />

              {/* Concentric Thin Accent Orbit Rings */}
              <div className="absolute w-80 sm:w-96 lg:w-[460px] aspect-square rounded-full border border-indigo-200/40 pointer-events-none -z-10" />
              <div className="absolute w-72 sm:w-84 lg:w-[390px] aspect-square rounded-full border border-dashed border-purple-200/50 pointer-events-none -z-10" />



              {/* Cutout Educator Standing Freely */}
              <img
                src={heroTeacherCutout}
                alt="Empowering Education with AcademiX"
                className="w-full h-auto max-h-[500px] sm:max-h-[560px] lg:max-h-[600px] object-contain drop-shadow-[0_20px_35px_rgba(79,70,229,0.16)] group-hover:scale-[1.02] transition-transform duration-500 relative z-10"
              />
            </div>
          </div>

          {/* Right Column: High-Impact Typography & Branding */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left order-1 lg:order-2 lg:pl-2">

            {/* AcademiX Logo */}
            <div className="mb-3 sm:mb-1 flex items-center">
              <img
                src={logoBlack}
                alt="AcademiX"
                className="h-16 sm:h-20 lg:h-32 w-auto object-contain cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-300"
                onClick={handleClick('/')}
              />
            </div>

            {/* Main Heading (scaled to match Ecosystem section impact) */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-black text-slate-900 leading-[1.15] tracking-tight mb-4">
              Transform Learning with<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600">
                AI-Powered Education
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed mb-6 font-normal">
              Elevate student success with dynamic adaptive quizzes, predictive ML analytics, and intelligent study paths tailored to individual cognitive profiles.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center flex-wrap gap-y-3">
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Learn More</span>
                <FiArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleClick('/login')}
                className="ml-3 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Get Started
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

