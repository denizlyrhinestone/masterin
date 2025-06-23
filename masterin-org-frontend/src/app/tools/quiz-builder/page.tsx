"use client";

import React, { useState, useEffect } from 'react'; // Added useEffect
import AIToolTemplate from '@/components/AIToolTemplate';
import { GeneratedQuiz } from '@/types/courseTypes'; // Removed QuizQuestion as it's part of GeneratedQuiz
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import apiClient from '@/lib/apiClient'; // Import apiClient

// Mock API to save quiz metadata (can be removed if not used or if using apiClient directly)
// const saveQuizMetadataApi = async (title: string, description: string): Promise<{ success: boolean, course_quiz_id?: number, message?: string }> => {
//   console.log("API Call (mock): Save Quiz Metadata", { title, description });
//   return new Promise(resolve => setTimeout(() => {
//     resolve({ success: true, course_quiz_id: Date.now() % 10000 });
//   }, 500));
// };

// Mock API to save a single question to a quiz (can be removed if not used or if using apiClient directly)
// const saveQuestionToQuizApi = async (courseQuizId: number, question: QuizQuestion): Promise<{ success: boolean, question_id?: number, message?: string }> => {
//   console.log(`API Call (mock): Save Question to Quiz ID ${courseQuizId}`, question);
//   return new Promise(resolve => setTimeout(() => {
//     resolve({ success: true, question_id: Date.now() % 10000 + Math.random()*100 });
//   }, 200));
// };


const AIQuizBuilderPage: React.FC = () => {
  const { isAuthenticated, clearError: clearAuthError } = useAuth(); // Get isAuthenticated and clearError from AuthContext
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questionType, setQuestionType] = useState<'multiple-choice'>('multiple-choice');

  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearAuthError?.(); // Clear any global auth errors
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setGeneratedQuiz(null);
    setGenerateError(null);
    setSaveError(null);
    setSaveSuccessMessage(null);
    clearAuthError?.(); // Clear previous auth errors

    if (!isAuthenticated) {
      setGenerateError("You must be logged in to generate a quiz.");
      setIsGenerating(false);
      return;
    }

    try {
      const response = await apiClient.post<{ success: boolean; quiz?: GeneratedQuiz; message?: string; rawOutput?: string }>(
        '/ai/generate-quiz',
        { topic, numQuestions, questionType }
      );

      if (response.success && response.quiz) {
        setGeneratedQuiz(response.quiz);
      } else {
        throw new Error(response.message || response.rawOutput || 'Failed to generate quiz from API.');
      }
    } catch (err: any) {
      console.error("API Call error (generate quiz):", err);
      setGenerateError(err.message || 'An unknown error occurred while generating the quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!generatedQuiz) {
      setSaveError("No quiz generated to save.");
      return;
    }
    if (!isAuthenticated) {
      setSaveError("You must be logged in to save a quiz.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccessMessage(null);
    clearAuthError?.();

    try {
      // Step 1: Save Quiz Metadata using apiClient
      const metadataPayload = {
        title: generatedQuiz.title,
        description: `AI-generated quiz on: ${topic}`,
        // course_id: null, // Or pass if available from context
        // module_id: null, // Or pass if available from context
      };
      const metadataResponse = await apiClient.post<{ id: number; title: string; description?: string }>(
        '/courses/course-quizzes', // This will be /api/courses/course-quizzes
        metadataPayload
      );

      if (!metadataResponse || !metadataResponse.id) { // Basic check on response
        throw new Error("Failed to save quiz metadata or received invalid response.");
      }
      const courseQuizId = metadataResponse.id;

      // Step 2: Save Each Question
      const savedQuestions = [];
      for (const question of generatedQuiz.questions) {
        const questionPayloadOptions = question.options.map(opt => ({
          text: opt.text,
          label: opt.label, // Keep label for backend reference if needed
          is_correct: opt.label === question.correct_answer_label
        }));

        const questionPayload = {
          question_text: question.question_text,
          options: questionPayloadOptions,
          question_type: question.question_type || 'multiple-choice'
        };

        try {
          // Assuming backend endpoint /api/courses/course-quizzes/:courseQuizId/questions
          const savedQuestion = await apiClient.post<QuizQuestion>(
            `/courses/course-quizzes/${courseQuizId}/questions`,
            questionPayload
          );
          savedQuestions.push(savedQuestion);
        } catch (qError: any) {
          console.error(`Failed to save question: "${question.question_text}"`, qError);
          // Decide on error handling: stop all, or save partial and report?
          // For now, let's throw to stop and report the first question error.
          throw new Error(`Failed to save question: "${question.question_text.substring(0,30)}...". ${qError.message || 'Unknown error'}`);
        }
      }

      setGeneratedQuiz(prev => prev ? ({ ...prev, course_quiz_id: courseQuizId, questions: savedQuestions }) : null);
      setSaveSuccessMessage(`Quiz "${generatedQuiz.title}" (ID: ${courseQuizId}) and ${savedQuestions.length} questions saved successfully!`);
      // Optionally clear the form or redirect:
      // setTopic(''); setNumQuestions(5); setGeneratedQuiz(null);

    } catch (err: any) {
      console.error("Error during quiz saving process:", err);
      setSaveError(err.message || 'An unknown error occurred while saving the quiz.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputSection = (
    <form onSubmit={(e) => { e.preventDefault(); handleGenerateQuiz(); }} className="space-y-4">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic / Subject: <span className="text-red-500">*</span></label>
        <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 dark:text-white"
          placeholder="e.g., The American Civil War, Basic Algebra" required />
      </div>
      <div>
        <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Questions: <span className="text-red-500">*</span></label>
        <select id="numQuestions" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-700 dark:text-white focus:ring-sky-500 focus:border-sky-500">
          {[1, 3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Type: <span className="text-red-500">*</span></label>
        <select id="questionType" value={questionType} onChange={(e) => setQuestionType(e.target.value as 'multiple-choice')}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-700 dark:text-white focus:ring-sky-500 focus:border-sky-500">
          <option value="multiple-choice">Multiple Choice (4 options)</option>
        </select>
      </div>
    </form>
  );

  const outputPreview = (
    <div className="space-y-6">
      {isGenerating && (
        <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
          <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-sky-500"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-3">Generating your quiz... this may take a moment.</p>
        </div>
      )}
      {generateError && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <p><span className="font-semibold">Generation Error:</span> {generateError}</p>
        </div>
      )}
      {generatedQuiz && !isGenerating && !generateError && (
        <div className="p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{generatedQuiz.title}</h3>
          {generatedQuiz.questions.map((q, index) => (
            <div key={q.id || index} className="mb-4 p-3 border-b border-gray-200 dark:border-slate-600 last:border-b-0">
              <p className="font-medium text-gray-700 dark:text-slate-200">Q{index + 1}: {q.question_text}</p>
              <ul className="list-none mt-2 space-y-1">
                {q.options.map(opt => (
                  <li key={opt.label} className={`text-sm p-1 rounded ${
                    opt.label === q.correct_answer_label ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 font-semibold' : 'text-gray-600 dark:text-slate-300'
                  }`}>
                    {opt.label}. {opt.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-6 text-center">
            <button
              onClick={handleSaveQuiz}
              disabled={isSaving || !isAuthenticated} // Also disable if not authenticated
              title={!isAuthenticated ? "Please log in to save quizzes" : "Save this quiz"}
              className="py-2 px-6 rounded-md text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center transition-colors"
            >
              {isSaving ? 'Saving Quiz...' : 'Save This Quiz'}
            </button>
            {saveError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1"/>{saveError}
              </p>
            )}
            {saveSuccessMessage && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center justify-center">
                <CheckCircleIcon className="h-4 w-4 mr-1"/>{saveSuccessMessage}
              </p>
            )}
          </div>
        </div>
      )}
      {!isGenerating && !generatedQuiz && !generateError && (
        <p className="text-gray-400 dark:text-gray-500 text-center py-10">Generated quiz will appear here.</p>
      )}
    </div>
  );

  return (
    <AIToolTemplate
      toolTitle="AI Quiz Builder"
      heroAnimationPlaceholder="bg-gradient-to-br from-teal-400 via-cyan-500 to-sky-600"
      inputSection={inputSection}
      onSubmit={handleGenerateQuiz}
      outputPreview={outputPreview}
      isGenerating={isGenerating}
    />
  );
};

export default AIQuizBuilderPage;
