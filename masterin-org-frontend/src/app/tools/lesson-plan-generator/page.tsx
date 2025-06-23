"use client";

import React, { useState } from 'react';
import AIToolTemplate from '@/components/AIToolTemplate';
import ReactMarkdown from 'react-markdown';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import apiClient from '@/lib/apiClient'; // Import apiClient

const LessonPlanGeneratorPage = () => {
  const { isAuthenticated } = useAuth(); // Use token from useAuth for API calls
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [objectives, setObjectives] = useState(''); // Store as a single string, newlines for separation

  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPlan(null);
    setError(null);

    if (!isAuthenticated) {
      setError("You must be logged in to generate a lesson plan.");
      setIsGenerating(false);
      return;
    }

    const objectivesArray = objectives.split('\n').map(obj => obj.trim()).filter(obj => obj.length > 0);
    if (objectivesArray.length === 0 && objectives.trim().length > 0) {
        objectivesArray.push(objectives.trim());
    }

    if (objectivesArray.length === 0) {
        setError("Please provide at least one learning objective.");
        setIsGenerating(false);
        return;
    }

    try {
      // Use apiClient - it automatically includes the token
      const response = await apiClient.post<{ success: boolean; lessonPlanText?: string; message?: string }>(
        '/ai/generate-lesson-plan',
        {
          topic,
          gradeLevel,
          objectives: objectivesArray,
        }
      );

      if (response.success && response.lessonPlanText) {
        setGeneratedPlan(response.lessonPlanText);
      } else {
        throw new Error(response.message || 'Failed to generate lesson plan from API.');
      }
    } catch (err: any) {
      console.error("API Call error:", err);
      setError(err.message || 'An unknown error occurred while generating the lesson plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const inputSection = (
    <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-4">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Topic / Subject: <span className="text-red-500">*</span>
        </label>
        <input
          type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 dark:text-white"
          placeholder="e.g., Photosynthesis, World War II" required />
      </div>
      <div>
        <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Grade Level: <span className="text-red-500">*</span>
        </label>
        <input
          type="text" id="gradeLevel" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 dark:text-white"
          placeholder="e.g., Grade 9, High School" required />
      </div>
      <div>
        <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Learning Objectives (one per line): <span className="text-red-500">*</span>
        </label>
        <textarea id="objectives" value={objectives} onChange={(e) => setObjectives(e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 dark:text-white"
          placeholder="e.g., Understand the process of photosynthesis&#10;Identify key figures of WWII" required />
         <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Ensure each objective is on a new line if multiple.</p>
      </div>
    </form>
  );

  const outputPreview = (
    <div>
      {isGenerating && (
        <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
          <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-sky-500"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-3">Generating your lesson plan...this may take a moment.</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <p><span className="font-semibold">Error:</span> {error}</p>
        </div>
      )}
      {generatedPlan && !isGenerating && !error && (
        <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md dark:text-slate-200">
          <ReactMarkdown>{generatedPlan}</ReactMarkdown>
        </article>
      )}
      {!isGenerating && !generatedPlan && !error && (
        <p className="text-gray-400 dark:text-gray-500 text-center py-10">Generated lesson plan will appear here.</p>
      )}
    </div>
  );

  return (
    <AIToolTemplate
      toolTitle="AI Lesson Plan Generator"
      heroAnimationPlaceholder="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
      inputSection={inputSection}
      onSubmit={handleGenerate}
      outputPreview={outputPreview}
      isGenerating={isGenerating}
    />
  );
};

export default LessonPlanGeneratorPage;
