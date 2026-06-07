import FeatureCard from './FeatureCard';

const features = [
  {
    icon: '📚',
    title: 'AI Study Plans',
    description: 'Dynamically generated learning paths that adapt in real-time based on individual student performance, pacing, and cognitive load capacity.',
    tags: ['Personalized', 'Adaptive']
  },
  {
    icon: '🎯',
    title: 'Adaptive Quizzes',
    description: 'Questions automatically scale in difficulty, ensuring students remain in their optimal zone of proximal development.',
    tags: ['Smart', 'Engaging']
  },
  {
    icon: '📊',
    title: 'ML Exam Prediction',
    description: 'Predictive models forecast exam readiness with 94% accuracy based on historical interaction data.',
    tags: ['Predictive', 'Accurate']
  },
  {
    icon: '📱',
    title: 'QR Attendance',
    description: 'Frictionless check-ins utilizing secure, rotating QR codes for instant physical and virtual roster management.',
    tags: ['Seamless', 'Secure']
  },
  {
    icon: '👥',
    title: 'Community Hub',
    description: 'Peer-to-peer learning forums moderated by AI assistants fostering collaborative knowledge sharing.',
    tags: ['Social', 'Collaborative']
  },
  {
    icon: '🔔',
    title: 'Real-Time Alerts',
    description: 'Instant push notifications for interventions and milestones keeping educators informed on student progress.',
    tags: ['Instant', 'Alerts']
  }
];

export default function EcosystemSection() {
  return (
    <section className="py-20 lg:py-32 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">Intelligent Ecosystem</h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Everything you need to manage classrooms, analyze performance, and foster<br className="hidden md:block" />
            engagement in one unified platform.
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
