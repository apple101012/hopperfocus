import React, { useState } from 'react';
import { useDemo } from '../../contexts/DemoContext';
import { useStats } from '../../contexts/StatsContext';
import { AutoTyper } from '../AutoTyper';

export const Pitch: React.FC = () => {
  const {
    demoMode,
    setDemoMode,
    isDemoActive,
    setIsDemoActive,
    currentStep,
    demoSteps,
    nextStep,
    prevStep,
    resetDemo,
  } = useDemo();
  const { addXP, refreshStats, stats } = useStats();
  const [simulationNotification, setSimulationNotification] = useState<string | null>(null);

  const currentDemoStep = demoSteps[currentStep];

  const handleStartDemo = () => {
    setIsDemoActive(true);
  };

  const handleStopDemo = () => {
    resetDemo();
  };

  const handleSimulateXP = () => {
    const xpGain = 200; // Big XP boost for demo
    addXP(xpGain);
    setSimulationNotification(`🎉 Simulated +${xpGain} XP! Check Home tab.`);
    setTimeout(() => setSimulationNotification(null), 3000);
  };

  const handleResetDemo = () => {
    // Clear localStorage
    localStorage.clear();
    // Refresh stats from backend
    refreshStats();
    setSimulationNotification('🔄 Demo state reset! Reload to see fresh data.');
    setTimeout(() => setSimulationNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fantasy text-white mb-2">
            🎭 Demo Mode
          </h1>
          <p className="text-neutral-400">
            Walkthrough the app features for judges and stakeholders
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-black border border-neutral-800 rounded-lg p-6 mb-6">
          {/* Simulation Notification */}
          {simulationNotification && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg text-green-200 text-center font-medium">
              {simulationNotification}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-fantasy text-white mb-2">API Mode</h2>
              <p className="text-sm text-neutral-400">
                Live = Real API calls | Fast = Instant mock responses
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDemoMode('live')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  demoMode === 'live'
                    ? 'bg-house-primary text-white shadow-lg'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                🌐 Live
              </button>
              <button
                onClick={() => setDemoMode('fast')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  demoMode === 'fast'
                    ? 'bg-house-primary text-white shadow-lg'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                ⚡ Fast
              </button>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="mb-6 pb-6 border-b border-neutral-800">
            <h3 className="text-lg font-medium text-white mb-3">
              🎬 Demo Simulation Controls
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSimulateXP}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <span>⚡</span>
                <span>Simulate XP Gain</span>
              </button>
              <button
                onClick={handleResetDemo}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>Reset Demo State</span>
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2 text-center">
              Use these to quickly show features during live demos
            </p>
          </div>

          {/* Start/Stop Demo */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">
                Demo Walkthrough
              </h3>
              <p className="text-sm text-neutral-400">
                {isDemoActive
                  ? `Step ${currentStep + 1} of ${demoSteps.length}`
                  : 'Not running'}
              </p>
            </div>
            {!isDemoActive ? (
              <button
                onClick={handleStartDemo}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-lg"
              >
                ▶️ Start Demo
              </button>
            ) : (
              <button
                onClick={handleStopDemo}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-lg"
              >
                ⏹️ Stop Demo
              </button>
            )}
          </div>
        </div>

        {/* Current Demo Step */}
        {isDemoActive && (
          <div className="bg-black border-2 border-house-primary rounded-lg p-8 mb-6 shadow-2xl relative" style={{ zIndex: 60 }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-house-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {currentStep + 1}
                </div>
                <h2 className="text-2xl font-fantasy text-white">
                  {currentDemoStep.title}
                </h2>
              </div>
              <p className="text-lg text-neutral-300 leading-relaxed">
                <AutoTyper text={currentDemoStep.description} speed={30} />
              </p>
            </div>

            {/* Demo Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 0
                    ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {demoSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-house-primary w-8'
                        : index < currentStep
                        ? 'bg-house-secondary'
                        : 'bg-neutral-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextStep}
                className="px-6 py-3 bg-house-primary hover:bg-house-secondary text-white rounded-lg font-medium transition-all shadow-lg"
              >
                {currentStep === demoSteps.length - 1 ? 'Finish' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* Demo Features Overview */}
        <div className="bg-black border border-neutral-800 rounded-lg p-6">
          <h3 className="text-xl font-fantasy text-white mb-4">
            What This Demo Shows
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border transition-all ${
                  isDemoActive && index === currentStep
                    ? 'bg-house-primary border-house-secondary'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDemoActive && index === currentStep
                        ? 'bg-white text-house-primary'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h4
                    className={`font-medium ${
                      isDemoActive && index === currentStep
                        ? 'text-white'
                        : 'text-neutral-300'
                    }`}
                  >
                    {step.title}
                  </h4>
                </div>
                <p
                  className={`text-sm ${
                    isDemoActive && index === currentStep
                      ? 'text-neutral-200'
                      : 'text-neutral-500'
                  }`}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <div className="mt-6 bg-house-primary bg-opacity-10 border border-house-primary rounded-lg p-6">
          <h3 className="text-lg font-fantasy text-white mb-3 flex items-center gap-2">
            💡 Pro Tips for Judges
          </h3>
          <ul className="space-y-2 text-neutral-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>
                <strong>Fast Mode:</strong> Perfect for time-constrained presentations - no
                network latency!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>
                <strong>Live Mode:</strong> Shows the real AI integration with Gemini 2.5 Flash
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>
                <strong>Spotlight Effect:</strong> Each step highlights relevant UI elements
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>
                <strong>Happy Path Only:</strong> Demo follows ideal user flow - no error cases
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
