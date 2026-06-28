import { navigate } from '../../App';
import logoWhite from '../../assets/logo_white.png';
import { FaTwitter, FaLinkedinIn, FaGithub, FaYoutube } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin, FiArrowUp } from 'react-icons/fi';

export default function Footer() {
  const handleClick = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-[#0f1123] to-[#070814] text-slate-300 pt-16 pb-12 mt-20 border-t border-slate-800/80 relative overflow-hidden select-none animate-fade-in">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 pb-12 border-b border-slate-800/70">

          {/* Logo & Description Column */}
          <div className="space-y-6">
            <a
              href="/"
              onClick={handleClick('/')}
              className="inline-block hover:opacity-85 transition-opacity"
            >
              <img
                src={logoWhite}
                alt="AcademiX"
                className="h-10 w-auto object-contain hover:scale-[1.02] transition-transform duration-300"
              />
            </a>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-sans">
              Personalized, AI-driven learning pathways helping Grade 11 students in Sri Lanka master O/L ICT.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-indigo-600 border border-slate-700/50 hover:border-indigo-500 flex items-center justify-center text-slate-400 hover:text-white hover:-translate-y-1 transition-all duration-300"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-indigo-600 border border-slate-700/50 hover:border-indigo-500 flex items-center justify-center text-slate-400 hover:text-white hover:-translate-y-1 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-indigo-600 border border-slate-700/50 hover:border-indigo-500 flex items-center justify-center text-slate-400 hover:text-white hover:-translate-y-1 transition-all duration-300"
                aria-label="GitHub"
              >
                <FaGithub className="w-4 h-4" />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-indigo-600 border border-slate-700/50 hover:border-indigo-500 flex items-center justify-center text-slate-400 hover:text-white hover:-translate-y-1 transition-all duration-300"
                aria-label="YouTube"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              LMS Portal
            </h4>

            <ul className="space-y-3.5">
              <li>
                <a
                  href="/"
                  onClick={handleClick('/')}
                  className="text-slate-400 hover:text-indigo-400 transition-colors text-sm flex items-center gap-1 hover:translate-x-0.5 transform duration-200"
                >
                  Home
                </a>
              </li>

              <li>
                <a
                  href="/#features"
                  onClick={(e) => {
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      handleClick('/')(e);
                      setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 500);
                    }
                  }}
                  className="text-slate-400 hover:text-indigo-400 transition-colors text-sm flex items-center gap-1 hover:translate-x-0.5 transform duration-200"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="/about"
                  onClick={handleClick('/about')}
                  className="text-slate-400 hover:text-indigo-400 transition-colors text-sm flex items-center gap-1 hover:translate-x-0.5 transform duration-200"
                >
                  About Us
                </a>
              </li>

              <li>
                <a
                  href="/login"
                  onClick={handleClick('/login')}
                  className="text-slate-400 hover:text-indigo-400 transition-colors text-sm flex items-center gap-1 hover:translate-x-0.5 transform duration-200 font-semibold"
                >
                  Sign In
                </a>
              </li>
            </ul>
          </div>

          {/* Academic Info Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Class Info
            </h4>

            <ul className="space-y-3.5 text-sm text-slate-400 font-sans">
              <li>
                <span className="font-semibold text-slate-200">Teacher:</span> Akila Savinda
              </li>
              <li>
                <span className="inline-block text-[11px] bg-indigo-950/80 text-indigo-400 border border-indigo-900/60 px-2 py-0.5 rounded font-semibold">
                  Undergraduate
                </span>
              </li>
              <li className="text-[13px] leading-relaxed">
                University of Ruhuna
              </li>
              <li>
                <span className="font-semibold text-slate-200">Target:</span> Grade 11 O/L ICT
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Contact Info
            </h4>

            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-indigo-400 w-4.5 h-4.5 mt-0.5 shrink-0" />
                <span className="leading-relaxed text-sm">102 Galle Road, Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-indigo-400 w-4.5 h-4.5 shrink-0" />
                <span className="text-sm">+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-indigo-400 w-4.5 h-4.5 shrink-0" />
                <a
                  href="mailto:support@academix.lk"
                  className="hover:text-indigo-400 transition-colors text-sm"
                >
                  support@academix.lk
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
          
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} AcademiX. All rights reserved.</p>
            
            <div className="flex items-center gap-4">
              <a
                href="/privacy"
                onClick={handleClick('/privacy')}
                className="hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-slate-800">|</span>
              <a
                href="/terms"
                onClick={handleClick('/terms')}
                className="hover:text-slate-300 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-xl bg-slate-800/40 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-700/50 hover:border-indigo-500 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md group"
            title="Back to Top"
          >
            <FiArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

        </div>
      </div>
    </footer>
  );
}