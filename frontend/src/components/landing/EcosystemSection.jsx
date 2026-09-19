import FeatureCard from './FeatureCard';
import { FiBook, FiTarget, FiBarChart2, FiSmartphone, FiUsers, FiBell } from 'react-icons/fi';

const features = [
  {
    icon: <FiBook className="w-5 h-5 text-white" />,
    title: 'AI Study Plans',
    description: 'Dynamically generated learning paths that adapt in real-time based on individual student performance, pacing, and cognitive load capacity.',
    tags: ['Personalized', 'Adaptive']
  },
  {
    icon: <FiTarget className="w-5 h-5 text-white" />,
    title: 'Adaptive Quizzes',
    description: 'Questions automatically scale in difficulty, ensuring students remain in their optimal zone of proximal development.',
    tags: ['Smart', 'Engaging']
  },
  {
    icon: <FiBarChart2 className="w-5 h-5 text-white" />,
    title: 'ML Exam Prediction',
    description: 'Predictive models forecast exam readiness with 94% accuracy based on historical interaction data.',
    tags: ['Predictive', 'Accurate']
  },
  {
    icon: <FiSmartphone className="w-5 h-5 text-white" />,
    title: 'QR Attendance',
    description: 'Frictionless check-ins utilizing secure, rotating QR codes for instant physical and virtual roster management.',
    tags: ['Seamless', 'Secure']
  },
  {
    icon: <FiUsers className="w-5 h-5 text-white" />,
    title: 'Community Hub',
    description: 'Peer-to-peer learning forums moderated by AI assistants fostering collaborative knowledge sharing.',
    tags: ['Social', 'Collaborative']
  },
  {
    icon: <FiBell className="w-5 h-5 text-white" />,
    title: 'Real-Time Alerts',
    description: 'Instant push notifications for interventions and milestones keeping educators informed on student progress.',
    tags: ['Instant', 'Alerts']
  }
];

export default function EcosystemSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-indigo-50/40 via-white to-purple-50/30 relative overflow-hidden select-none" id="features">
      {/* Background Ambient Glows matching Hero */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-indigo-200/25 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-200/25 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight mb-3">
            Intelligent{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600">
              Ecosystem
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to manage classrooms, analyze performance, and foster engagement in one unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              tags={feature.tags}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
