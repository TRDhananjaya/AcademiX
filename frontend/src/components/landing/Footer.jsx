import { navigate } from '../../App';
import logoWhite from '../../assets/logo_white.png';

export default function Footer() {
  const handleClick = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <footer className="bg-[#1a1a2e] text-white py-16 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/10">

          {/* Logo Section */}
          <div>
            <a
              href="/"
              onClick={handleClick('/')}
              className="inline-block mb-4 hover:opacity-80 transition-opacity"
            >
              <img
                src={logoWhite}
                alt="AcademiX"
                className="h-10 w-auto object-contain"
              />
            </a>

            <p className="text-gray-400 text-sm leading-relaxed">
              Transforming education through AI and personalization.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Product
            </h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="/features"
                  onClick={handleClick('/features')}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="/pricing"
                  onClick={handleClick('/pricing')}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Pricing
                </a>
              </li>

              <li>
                <a
                  href="/docs"
                  onClick={handleClick('/docs')}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Company
            </h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="/about"
                  onClick={handleClick('/about')}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  About Us
                </a>
              </li>

              <li>
                <a
                  href="/blog"
                  onClick={handleClick('/blog')}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Blog
                </a>
              </li>

              <li>
                <a
                  href="/careers"
                  onClick={handleClick('/careers')}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Legal
            </h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="/privacy"
                  onClick={handleClick('/privacy')}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Privacy
                </a>
              </li>

              <li>
                <a
                  href="/terms"
                  onClick={handleClick('/terms')}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Terms
                </a>
              </li>

              <li>
                <a
                  href="/contact"
                  onClick={handleClick('/contact')}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <p>&copy; 2026 AcademiX. All rights reserved.</p>

          <div className="flex gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Twitter
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              LinkedIn
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}