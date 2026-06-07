import home_pic from '../../assets/home_pic.png';

export default function FeaturedImage() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative inline-block w-full">
          <div className="absolute top-8 right-8 bg-white rounded-xl p-4 shadow-lg-custom flex items-center gap-3 z-10">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-sm font-bold text-text-primary">+24% Score</p>
              <p className="text-xs text-text-tertiary">ML Prediction</p>
            </div>
          </div>
          
          <img 
            src={home_pic} 
            alt="AcademiX Dashboard" 
            className="w-full rounded-2xl shadow-lg-custom"
          />
        </div>
      </div>
    </section>
  );
}
