import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About AcademiX</h1>
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p className="mb-4">
                AcademiX is a next-generation AI-powered educational platform designed to transform the way we learn. 
                By combining advanced machine learning, predictive analytics, and adaptive cognitive mapping, we create 
                a learning environment that uniquely scales to every individual's needs.
              </p>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Mission</h2>
              <p className="mb-4">
                Our mission is to democratize high-quality, personalized education worldwide. We believe that 
                technology can close the learning gap, providing students and educators with the insights they need 
                to achieve unprecedented academic success.
              </p>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">What We Do</h2>
              <p className="mb-4">
                From intelligent study paths to real-time analytics, AcademiX empowers educators with robust tools 
                to track progress and identify areas of improvement early on. For students, our platform guarantees 
                an interactive, tailored experience that adjusts seamlessly to their unique learning pace.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}