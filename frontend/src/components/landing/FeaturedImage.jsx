import home_pic from '../../assets/home_pic.png';

export default function FeaturedImage() {
  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-white to-[#f8f9fb] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative inline-block w-full">
          
          {/* Subtle Backglow */}
          <div className="absolute inset-0 m-auto w-[80%] h-[70%] bg-indigo-500/10 blur-[100px] rounded-full -z-10"></div>
          
          {/* Floating Pill Card Left */}
          <div className="absolute top-8 left-[-10px] md:left-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100/80 flex items-center gap-3.5 z-10 animate-float">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg">
              ✨
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ML Prediction</p>
              <p className="text-sm font-extrabold text-slate-800">+24% Score</p>
            </div>
          </div>

          {/* Floating Pill Card Right */}
          <div className="absolute bottom-8 right-[-10px] md:right-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100/80 flex items-center gap-3.5 z-10 animate-float-delayed">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 text-lg">
              📊
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
              <p className="text-sm font-extrabold text-slate-800">98% Avg Roster</p>
            </div>
          </div>
          
          {/* Main Dashboard Image */}
          <div className="p-2 md:p-4 bg-slate-100/50 border border-slate-200/60 rounded-3xl shadow-xl max-w-5xl mx-auto hover:scale-[1.01] transition-transform duration-500">
            <img 
              src={home_pic} 
              alt="AcademiX Dashboard" 
              className="w-full rounded-2xl shadow-md"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
