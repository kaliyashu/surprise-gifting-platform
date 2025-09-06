
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Registry for custom scene/effect renderers (extensible)
const sceneRegistry = {};
const effectRegistry = {};

// Register a custom scene renderer
export function registerScene(type, Component) {
  sceneRegistry[type] = Component;
}
// Register a custom effect renderer
export function registerEffect(type, Component) {
  effectRegistry[type] = Component;
}

// Professional, performant dynamic step renderer
const DynamicStep = React.memo(function DynamicStep({ step, onInteraction }) {
  const [interacted, setInteracted] = useState(false);
  const audioRef = useRef(null);

  // Play audio if present (only once per step)
  React.useEffect(() => {
    if (step.audio && audioRef.current) {
      audioRef.current.src = `/sounds/${step.audio}`;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [step.audio]);

  // Auto-advance for 'auto' action
  React.useEffect(() => {
    if (step.action === 'auto' && step.duration && !interacted) {
      const timer = setTimeout(() => {
        setInteracted(true);
        onInteraction && onInteraction(step.id, { auto: true });
      }, step.duration);
      return () => clearTimeout(timer);
    }
  }, [step.action, step.duration, step.id, onInteraction, interacted]);

  // Handle click or interaction
  const handleInteract = useCallback(() => {
    if (!interacted) {
      setInteracted(true);
      onInteraction && onInteraction(step.id, { clicked: true });
    }
  }, [interacted, onInteraction, step.id]);

  // Render reveals if present
  const renderReveals = useMemo(() => {
    if (!step.reveals) return null;
    return (
      <div className="mt-4">
        {Array.isArray(step.reveals)
          ? step.reveals.map((reveal, idx) => (
              <div key={idx} className="p-2 bg-white bg-opacity-80 rounded mb-2 text-center text-gray-800">
                {typeof reveal === 'string' ? reveal : JSON.stringify(reveal)}
              </div>
            ))
          : <div className="p-2 bg-white bg-opacity-80 rounded text-center text-gray-800">{JSON.stringify(step.reveals)}</div>}
      </div>
    );
  }, [step.reveals]);

  // Render effects if present
  const renderEffects = useMemo(() => {
    if (!step.effects) return null;
    return (
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {step.effects.map((effect, idx) => {
          const EffectComponent = effectRegistry[effect];
          return EffectComponent ? <EffectComponent key={idx} /> : (
            <span key={idx} className="px-3 py-1 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-full text-sm font-semibold text-gray-700 shadow">
              {effect}
            </span>
          );
        })}
      </div>
    );
  }, [step.effects]);

  // Try to use a custom scene renderer if registered
  const SceneComponent = step.scene && sceneRegistry[step.scene];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8">
      <audio ref={audioRef} />
      <motion.div
        className="w-full max-w-xl bg-white bg-opacity-80 rounded-xl shadow-xl p-8 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-2 text-purple-700">{step.scene || 'Scene'}</h2>
        <div className="text-lg mb-4 text-gray-700">{step.effect || step.action || 'Effect'}</div>
        {step.content && <div className="text-xl mb-4 text-pink-600">{step.content}</div>}
        {SceneComponent
          ? <SceneComponent step={step} interacted={interacted} onInteract={handleInteract} />
          : null}
        {!SceneComponent && (step.action === 'click' || step.action === 'clickMultiple') && !interacted && (
          <button
            className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 text-white rounded-lg shadow hover:from-yellow-500 hover:to-pink-500 transition"
            onClick={handleInteract}
          >
            {step.buttonText || (step.action === 'click' ? 'Continue' : 'Interact')}
          </button>
        )}
        {renderReveals}
        {renderEffects}
        {interacted && <div className="mt-4 text-green-600 font-semibold">Step completed!</div>}
      </motion.div>
    </div>
  );
});

const InteractiveTemplate = ({ template, surprise, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = useMemo(() => template?.config?.steps || [], [template]);

  const handleStepInteraction = useCallback((stepId, data) => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    if (currentStep >= steps.length - 1 && onComplete) {
      onComplete();
    }
  }, [steps.length, onComplete, currentStep]);

  if (!steps.length) return <div>No steps found in template.</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 z-50">
        <div className="bg-gray-800 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-white text-sm mt-2 text-center">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <DynamicStep step={steps[currentStep]} onInteraction={handleStepInteraction} />
        </motion.div>
      </AnimatePresence>

      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute bottom-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Skip to End
      </button>
    </div>
  );
};

export default InteractiveTemplate;
