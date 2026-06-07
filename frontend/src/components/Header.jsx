import { navigate } from '../App';

export default function Header() {
  const handleClick = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" onClick={handleClick('/')} className="flex items-center">
            <img src="/logo.png" alt="AcademiX" className="h-16 w-auto" />
          </a>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <a
              href="/"
              onClick={handleClick('/')}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Home
            </a>

            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Features
            </a>

            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              About
            </a>

            {/* Sign In Button */}
            <a
              href="/login"
              onClick={handleClick('/login')}
              className="bg-primary text-white px-5 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              Sign In
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}