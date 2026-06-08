import { navigate } from '../../App';
import logoBlack from '../../assets/logo_black.png';

export default function Header() {
  const handleClick = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100/80 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" onClick={handleClick('/')} className="flex items-center group">
            <img src={logoBlack} alt="AcademiX" className="h-16 w-auto object-contain py-2 group-hover:scale-105 transition-transform duration-300" />
          </a>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <a
              href="/"
              onClick={handleClick('/')}
              className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm"
            >
              Home
            </a>

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
              className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm"
            >
              Features
            </a>

            <a
              href="/about"
              onClick={handleClick('/about')}
              className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm cursor-pointer"
            >
              About
            </a>
            
            <a
              href="/contact"
              onClick={handleClick('/contact')}
              className="text-slate-600 hover:text-indigo-600 transition-colors font-semibold text-sm cursor-pointer"
            >
              Contact
            </a>

            {/* Sign In Button */}
            <a
              href="/login"
              onClick={handleClick('/login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-sm hover:shadow-indigo-600/25 hover:-translate-y-0.5"
            >
              Sign In
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}