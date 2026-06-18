import FeatureCard from './FeatureCard';
import { FiBook, FiTarget, FiBarChart2, FiSmartphone, FiUsers, FiBell } from 'react-icons/fi';

const features = [
  {
    icon: <FiBook className="w-6 h-6 text-indigo-600" />,
    title: 'AI Study Plans',
    description: 'Dynamically generated learning paths that adapt in real-time based on individual student performance, pacing, and cognitive load capacity.',
    tags: ['Personalized', 'Adaptive']
  },
  {
    icon: <FiTarget className="w-6 h-6 text-indigo-600" />,
    title: 'Adaptive Quizzes',
    description: 'Questions automatically scale in difficulty, ensuring students remain in their optimal zone of proximal development.',
    tags: ['Smart', 'Engaging']
  },
  {
    icon: <FiBarChart2 className="w-6 h-6 text-indigo-600" />,
    title: 'ML Exam Prediction',
    description: 'Predictive models forecast exam readiness with 94% accuracy based on historical interaction data.',
    tags: ['Predictive', 'Accurate']
  },
  {
    icon: <FiSmartphone className="w-6 h-6 text-indigo-600" />,
    title: 'QR Attendance',
    description: 'Frictionless check-ins utilizing secure, rotating QR codes for instant physical and virtual roster management.',
    tags: ['Seamless', 'Secure']
  },
  {
    icon: <FiUsers className="w-6 h-6 text-indigo-600" />,
    title: 'Community Hub',
    description: 'Peer-to-peer learning forums moderated by AI assistants fostering collaborative knowledge sharing.',
    tags: ['Social', 'Collaborative']
  },
  {
    icon: <FiBell className="w-6 h-6 text-indigo-600" />,
    title: 'Real-Time Alerts',
    description: 'Instant push notifications for interventions and milestones keeping educators informed on student progress.',
    tags: ['Instant', 'Alerts']
  }
];

export default function EcosystemSection() {
  return (
    <section className="py-24 lg:py-36 bg-[#f8f9fb]" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 py-2 mb-4 leading-normal">
            Intelligent Ecosystem
          </h2>
          <p className="text-base md:text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Everything you need to manage classrooms, analyze performance, and foster engagement in one unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
