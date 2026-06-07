import { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import CreateQuizContent from '../components/dashboard/CreateQuizContent';

export default function CreateQuiz() {
  const [activeNav, setActiveNav] = useState('quizzes');

  return (
    <div className="flex min-h-screen font-sans bg-[#f8f9fb]" id="dashboard-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[72px] lg:ml-[240px]">
        <TopBar />
        <main className="flex-1 p-[20px_16px] md:p-[32px_40px_40px] overflow-y-auto">
          <CreateQuizContent />
        </main>
      </div>
    </div>
  );
}
