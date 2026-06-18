import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import logoBlack from '../assets/logo_black.png';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdff] select-none">
      <Header />

      <main className="flex-grow pt-28 pb-20 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl animate-drift"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl animate-float"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          {/* Headline */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-normal py-1">
              About <span className="inline-block text-gradient px-1 py-1">AcademiX</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Empowering educators and students with personalized, AI-driven learning pathways.
            </p>
          </div>

          {/* Main Info Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-slate-100 shadow-md-custom mb-10">
            <div className="prose prose-lg text-slate-600 max-w-none space-y-6 leading-relaxed">
              <p className="text-[17px] text-slate-600 leading-relaxed">
                AcademiX is a next-generation AI-powered educational platform designed to transform the way we learn.
                By combining advanced machine learning, predictive analytics, and adaptive cognitive mapping, we create
                a learning environment that uniquely scales to every individual's needs.
              </p>

              <div className="h-[1px] bg-slate-100 my-8"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    Our Mission
                  </h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed">
                    Our mission is to democratize high-quality, personalized education worldwide. We believe that
                    technology can close the learning gap, providing students and educators with the insights they need
                    to achieve unprecedented academic success.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    What We Do
                  </h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed">
                    From intelligent study paths to real-time analytics, AcademiX empowers educators with robust tools
                    to track progress and identify areas of improvement early on. For students, our platform guarantees
                    an interactive, tailored experience that adjusts seamlessly to their unique learning pace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">99%</div>
              <div className="text-sm font-medium text-slate-500">Accuracy Score</div>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">240+</div>
              <div className="text-sm font-medium text-slate-500">Active Online Peers</div>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">100%</div>
              <div className="text-sm font-medium text-slate-500">Personalized Analytics</div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}