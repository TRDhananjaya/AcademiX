import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { FiTarget, FiCpu, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 select-none relative overflow-hidden">
      <Header />

      <main className="flex-grow pt-28 pb-20 sm:pt-32 sm:pb-24 relative overflow-hidden">
        {/* Ambient background glows matching Hero */}
        <div className="absolute top-10 -right-20 w-[450px] h-[450px] rounded-full bg-indigo-200/35 blur-[120px] animate-drift pointer-events-none -z-10"></div>
        <div className="absolute bottom-20 -left-20 w-[450px] h-[450px] rounded-full bg-purple-200/35 blur-[120px] animate-drift-slow pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-indigo-100/40 blur-[90px] pointer-events-none -z-10"></div>

        {/* Subtle Background Flowing Curves */}
        <svg
          className="absolute -top-16 -left-16 w-[560px] h-[560px] text-indigo-300/25 pointer-events-none stroke-current -z-10"
          viewBox="0 0 600 600"
          fill="none"
        >
          <path d="M-80,60 C80,140 200,240 320,440 C400,580 520,600 620,620" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="180" cy="180" r="180" strokeWidth="1" opacity="0.2" />
        </svg>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16">

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-slate-900 mb-4 tracking-tight">
              About{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600">
                AcademiX
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Empowering educators and students with personalized, AI-driven learning pathways for academic excellence.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-indigo-100/80 shadow-xl shadow-indigo-950/5 mb-12">
            <div className="space-y-8">
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                <span className="font-bold text-indigo-600">AcademiX</span> is a next-generation AI-powered educational platform designed to transform how students grasp complex subjects and how educators guide them. By combining advanced machine learning, predictive analytics, and adaptive cognitive mapping, we create a learning environment that uniquely scales to every individual's pace and potential.
              </p>

              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {/* Our Mission */}
                <div className="bg-slate-50/60 rounded-2xl p-6 border border-slate-100/80">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
                    <FiTarget className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Our Mission
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    To democratize high-quality, personalized education worldwide. We believe technology should close the learning gap, providing students and educators with actionable insights to achieve unprecedented academic success.
                  </p>
                </div>

                {/* What We Do */}
                <div className="bg-slate-50/60 rounded-2xl p-6 border border-slate-100/80">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
                    <FiCpu className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    What We Do
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    From dynamic adaptive quizzes and ML exam score forecasting to frictionless attendance tracking, AcademiX equips schools and educators with modern tools that simplify teaching and accelerate student mastery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100/60 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Predictive Insights</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Early intervention alerts and ML-driven forecasts that keep students on track for exams.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100/60 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3">
                <FiUsers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Collaborative Hub</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Peer learning forums and mentor assistance fostering an active, engaging community.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100/60 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                <FiAward className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Adaptive Quizzing</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Real-time question scaling matching each learner's optimal zone of development.</p>
            </div>
          </div>



        </div>
      </main>

      <Footer />
    </div>
  );
}