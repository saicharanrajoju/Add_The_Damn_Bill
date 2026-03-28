import { useState } from 'react';
import { Camera, Users, CheckCircle, PieChart } from 'lucide-react';
import './App.css';

import UploadStep from './components/UploadStep';
import PeopleStep from './components/PeopleStep';
import AssignStep from './components/AssignStep';
import SummaryStep from './components/SummaryStep';
import DiningTableBackground from './components/ui/dining-table-background';

const STEPS = [
  { id: 'upload', icon: Camera, label: 'Upload' },
  { id: 'people', icon: Users, label: 'People' },
  { id: 'assign', icon: CheckCircle, label: 'Assign' },
  { id: 'summary', icon: PieChart, label: 'Summary' }
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [bills,       setBills]       = useState([]); // lifted so Back preserves them
  const [items,       setItems]       = useState([]);
  const [people,      setPeople]      = useState([]);
  const [assignments, setAssignments] = useState({});

  const handleDataExtracted = (data) => {
    setItems(data.items || []);
    setCurrentStep(1);
  };

  const handleReset = () => {
    // Revoke blob URLs before clearing
    bills.forEach(b => { try { URL.revokeObjectURL(b.preview); } catch {} });
    setBills([]);
    setCurrentStep(0);
    setItems([]);
    setPeople([]);
    setAssignments({});
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start sm:justify-center py-6 sm:py-10 px-3 sm:px-6 font-sans overflow-x-hidden">

      {/* Dining table background */}
      <DiningTableBackground />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-[560px] bg-black/75 backdrop-blur-2xl rounded-3xl sm:rounded-[40px] border border-white/20 overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Add the Damn Bill</h1>
              {/* Removing the math anxiety line */}
            </div>
            {/* Step label */}
            <span className="text-xs text-white/40 font-medium hidden sm:block">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 sm:mt-5">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <div key={step.id} className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-300
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-white text-black' : ''}
                    ${!isActive && !isCompleted ? 'bg-white/10 text-white/40' : ''}
                  `}>
                    <Icon size={13} />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-px w-4 sm:w-6 rounded-full transition-all duration-300 ${index < currentStep ? 'bg-green-500' : 'bg-white/15'}`} />
                  )}
                </div>
              );
            })}
            <span className="text-xs text-white/40 font-medium ml-2 sm:hidden">
              {currentStep + 1} / {STEPS.length}
            </span>
          </div>
        </div>

        {/* Step content — scrollable on mobile if needed */}
        <div className="p-5 sm:p-8 overflow-y-auto max-h-[calc(100svh-180px)] sm:max-h-none custom-scrollbar">
          {currentStep === 0 && <UploadStep bills={bills} setBills={setBills} onDataExtracted={handleDataExtracted} />}
          {currentStep === 1 && (
            <PeopleStep people={people} setPeople={setPeople} onNext={() => setCurrentStep(2)} onBack={() => setCurrentStep(0)} />
          )}
          {currentStep === 2 && (
            <AssignStep
              items={items} setItems={setItems} people={people}
              assignments={assignments} setAssignments={setAssignments}
              onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <SummaryStep
              items={items} people={people} assignments={assignments}
              onBack={() => setCurrentStep(2)} onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
