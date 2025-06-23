"use client";

import React, { useState } from 'react';
import { CourseQuizData, QuizQuestion, QuizQuestionOption, QuizResultsType, QuestionResult } from '@/types/courseTypes';
import apiClient from '@/lib/apiClient';
import { CheckCircleIcon, XCircleIcon, PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface QuizPlayerProps {
  quizData: CourseQuizData; // This data comes from GET /.../content-block/:blockId/details
  courseId: string | number; // Needed for submission URL
  onQuizComplete: (results: QuizResultsType) => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quizData, courseId, onQuizComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({}); // Store selected_option_id
  const [quizResults, setQuizResults] = useState<QuizResultsType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleOptionSelect = (questionId: string | number, optionId: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [String(questionId)]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const answersPayload = quizData.questions.map(q => ({
      question_id: q.id,
      selected_option_id: selectedAnswers[String(q.id)] || null, // Send null if no answer for a question
    }));

    try {
      const results = await apiClient.post<QuizResultsType>(
        `/courses/${courseId}/quizzes/${quizData.id}/submit`,
        { answers: answersPayload }
      );
      setQuizResults(results);
      onQuizComplete(results);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizResults(null);
    setIsSubmitting(false);
    setSubmitError(null);
    // Potentially call a prop to notify parent if retake needs more handling (e.g. resetting progress)
  };

  if (quizResults) {
    // Display Results
    return (
      <div className="p-4 sm:p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-sky-700 mb-4">Quiz Results: {quizData.title}</h2>
        <div className="mb-6 p-4 bg-sky-50 rounded-md text-center">
          <p className="text-xl font-semibold text-sky-800">
            Your Score: {quizResults.score}%
            <span className="text-lg font-medium"> ({quizResults.correct_answers_count} / {quizResults.total_questions})</span>
          </p>
        </div>

        {quizResults.results.map((result, index) => {
          const question = quizData.questions.find(q => q.id === result.question_id);
          if (!question) return null;
          const selectedOption = question.options.find(opt => opt.id === result.selected_option_id);
          const correctOption = question.options.find(opt => opt.id === result.correct_option_id); // Backend should provide correct_option_id

          return (
            <div key={result.question_id} className={`p-3 my-3 border rounded-md ${result.is_correct ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <p className="text-sm font-medium text-slate-800 mb-1">Q{index + 1}: {question.question_text}</p>
              <p className={`text-xs ${result.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                Your answer: {selectedOption ? `${selectedOption.label ? selectedOption.label + '. ' : ''}${selectedOption.text}` : <span className="italic">Not answered</span>}
                {result.is_correct ? <CheckCircleIcon className="h-4 w-4 inline ml-1" /> : <XCircleIcon className="h-4 w-4 inline ml-1" />}
              </p>
              {!result.is_correct && correctOption && (
                <p className="text-xs text-slate-600 mt-1">Correct answer: {correctOption.label ? correctOption.label + '. ' : ''}{correctOption.text}</p>
              )}
            </div>
          );
        })}
        <div className="mt-8 text-center">
            <button
                onClick={handleRetakeQuiz}
                className="py-2 px-6 rounded-md text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center transition-colors"
            >
                <ArrowPathIcon className="h-4 w-4 mr-2"/> Retake Quiz
            </button>
        </div>
      </div>
    );
  }

  // Display Quiz Questions
  return (
    <div className="p-4 sm:p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-1">{quizData.title}</h2>
      {quizData.description && <p className="text-sm text-slate-600 mb-6">{quizData.description}</p>}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmitQuiz(); }} className="space-y-6">
        {quizData.questions.map((question, index) => (
          <fieldset key={question.id} className="p-4 border border-slate-200 rounded-md hover:shadow-sm transition-shadow">
            <legend className="text-md font-semibold text-slate-800 mb-2">Question {index + 1}:</legend>
            <p className="text-sm text-slate-700 mb-3">{question.question_text}</p>
            <div className="space-y-2">
              {question.options.map(option => (
                <label
                  key={option.id}
                  className={`flex items-center p-2.5 rounded-md border transition-all duration-150 cursor-pointer text-sm
                    ${selectedAnswers[String(question.id)] === option.id ? 'bg-sky-100 border-sky-400 ring-2 ring-sky-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}
                  `}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={selectedAnswers[String(question.id)] === option.id}
                    onChange={() => handleOptionSelect(String(question.id), option.id!)} // Assume option.id is always present when fetched
                    className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500 mr-3"
                  />
                  <span>{option.label ? `${option.label}. ` : ''}{option.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="mt-8 pt-6 border-t border-slate-200">
          {submitError && (
            <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded-md flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0"/> {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(selectedAnswers).length !== quizData.questions.length} // Disable if not all questions answered
            className="w-full py-2.5 px-4 rounded-md text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center transition-colors"
          >
            {isSubmitting ? (
              <><ArrowPathIcon className="h-5 w-5 mr-2 animate-spin"/> Submitting...</>
            ) : (
              <><PaperAirplaneIcon className="h-5 w-5 mr-2 -rotate-45"/> Submit Quiz</>
            )}
          </button>
           {Object.keys(selectedAnswers).length !== quizData.questions.length && !isSubmitting &&
             <p className="text-xs text-slate-500 mt-2 text-center">Please answer all questions before submitting.</p>
           }
        </div>
      </form>
    </div>
  );
};

export default QuizPlayer;
