"use client"; // Required for components with event handlers like onClick

import React, { useState } from 'react';
import AIToolTemplate from '@/components/AIToolTemplate'; // Using alias @

const LessonPlanGeneratorPage = () => {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [objectives, setObjectives] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPlan(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGeneratedPlan(`Lesson Plan for ${topic} (Grade ${gradeLevel}):\n\nLearning Objectives:\n- ${objectives.split('\\n').join('\n- ')}\n\nActivity 1: ...\nActivity 2: ...\nAssessment: ...\n\n(This is a placeholder generated plan)`);
    setIsGenerating(false);
  };

  const inputSection = (
    <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-4">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
          Topic / Subject:
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Photosynthesis, World War II"
          required
        />
      </div>
      <div>
        <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-1">
          Grade Level:
        </label>
        <input
          type="text"
          id="gradeLevel"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Grade 9, High School, University Level 100"
          required
        />
      </div>
      <div>
        <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 mb-1">
          Learning Objectives (one per line):
        </label>
        <textarea
          id="objectives"
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Understand the process of photosynthesis\nIdentify key figures of WWII"
          required
        />
      </div>
    </form>
  );

  const outputPreview = (
    <div>
      {isGenerating && <p className="text-gray-500">Generating your lesson plan...</p>}
      {generatedPlan && (
        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-100 p-4 rounded-md">
          {generatedPlan}
        </pre>
      )}
      {!isGenerating && !generatedPlan && (
        <p className="text-gray-400">Generated lesson plan will appear here.</p>
      )}
    </div>
  );

  return (
    <AIToolTemplate
      toolTitle="Lesson Plan Generator"
      heroAnimationPlaceholder="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" // Specific gradient for this tool
      inputSection={inputSection}
      onSubmit={handleGenerate}
      outputPreview={outputPreview}
      isGenerating={isGenerating}
    />
  );
};

export default LessonPlanGeneratorPage;
