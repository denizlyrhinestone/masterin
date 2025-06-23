"use client";

import React, { useState } from 'react';
import AIToolTemplate from '@/components/AIToolTemplate';
import apiClient from '@/lib/apiClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Though main button is in template
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { MathProblem, GeneratedMathProblems } from '@/types/aiToolTypes'; // Correct path

const MathProblemCreatorPage = () => {
  const [topic, setTopic] = useState('');
  const [numProblems, setNumProblems] = useState<number>(3);
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [problemType, setProblemType] = useState(''); // Optional

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GeneratedMathProblems | null>(null);

  const difficultyLevels = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
    "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
    "Easy", "Medium", "Hard", "College Prep", "University Level"
  ];

  const problemTypes = [
    "Word Problem", "Algebraic Equation", "Geometry Problem", "Calculus Problem",
    "Statistics Problem", "Number Theory", "Logic Puzzle", "Arithmetic"
  ];


  const handleGenerateMathProblems = async () => {
    if (!topic || !numProblems || !difficultyLevel) {
      setError("Topic, Number of Problems, and Difficulty Level are required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedData(null);

    try {
      const payload = {
        topic,
        numProblems,
        difficultyLevel,
        problemType: problemType || undefined,
      };
      // The backend is expected to return a structure like:
      // { success: true, problems: MathProblem[] } or
      // { success: false, error: string, rawOutput?: string }
      const response = await apiClient.post<GeneratedMathProblems & { success: boolean; message?: string; error?: string }>('/ai/generate-math-problems', payload);

      if (response.data.success && response.data.problems) {
        setGeneratedData({ problems: response.data.problems });
      } else if (!response.data.success && response.data.rawOutput) {
        setGeneratedData({ rawOutput: response.data.rawOutput });
        setError(response.data.message || response.data.error || "AI returned data in an unexpected format. Raw output shown below.");
      } else if (!response.data.success) {
        setError(response.data.message || response.data.error || "Failed to generate math problems.");
      } else { // Should not happen if backend conforms, but as a fallback
        setError("Received an unexpected response structure from the server.");
      }
    } catch (err: any) {
      console.error("Error generating math problems:", err);
      const apiError = err.response?.data?.message || err.response?.data?.error || err.message || "An unknown error occurred.";
      setError(apiError);
      if (err.response?.data?.rawOutput) {
        setGeneratedData({ rawOutput: err.response.data.rawOutput });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputSectionContent = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="topic" className="font-semibold">Topic <span className="text-red-500">*</span></Label>
        <Input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Quadratic Equations, Probability, Fractions"
          required
        />
      </div>
      <div>
        <Label htmlFor="numProblems" className="font-semibold">Number of Problems <span className="text-red-500">*</span></Label>
        <Select
            value={String(numProblems)}
            onValueChange={(value) => setNumProblems(Number(value))}
        >
            <SelectTrigger><SelectValue placeholder="Select number" /></SelectTrigger>
            <SelectContent>
                {[1, 2, 3, 4, 5, 10].map(num => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="difficultyLevel" className="font-semibold">Difficulty Level <span className="text-red-500">*</span></Label>
        <Select
            value={difficultyLevel}
            onValueChange={setDifficultyLevel}
        >
            <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
                {difficultyLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="problemType" className="font-semibold">Problem Type (Optional)</Label>
         <Select
            value={problemType}
            onValueChange={setProblemType}
        >
            <SelectTrigger><SelectValue placeholder="Select type (e.g., Word Problem)" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="">Any (Let AI Decide)</SelectItem>
                {problemTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
    </div>
  );

  const outputPreviewContent = (
    <>
      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-sky-600"></div>
          <p className="ml-3 text-slate-600">Generating math problems...</p>
        </div>
      )}
      {error && !generatedData?.rawOutput && ( // Only show general error if no raw output is being shown
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {generatedData?.problems && generatedData.problems.length > 0 && !isLoading && (
        <div className="space-y-6">
          {generatedData.problems.map((problem, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white shadow">
              <h3 className="font-semibold text-lg mb-2 text-sky-700">Problem {index + 1}</h3>
              {problem.problem_type && <p className="text-xs text-slate-500 mb-1"><strong>Type:</strong> {problem.problem_type}</p>}
              {problem.difficulty_level_generated && <p className="text-xs text-slate-500 mb-2"><strong>Difficulty:</strong> {problem.difficulty_level_generated}</p>}

              <div className="prose prose-sm max-w-none mb-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{problem.problem_text}</ReactMarkdown>
              </div>

              {problem.hints && problem.hints.length > 0 && (
                <details className="mb-3 text-sm">
                  <summary className="cursor-pointer font-medium text-sky-600 hover:text-sky-700">View Hints ({problem.hints.length})</summary>
                  <ul className="list-disc list-inside pl-4 mt-1 text-slate-600 prose prose-sm max-w-none">
                    {problem.hints.map((hint, hIndex) => <li key={hIndex}><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{hint}</ReactMarkdown></li>)}
                  </ul>
                </details>
              )}

              <details className="mb-3 text-sm">
                <summary className="cursor-pointer font-semibold text-green-600 hover:text-green-700">View Solution</summary>
                <div className="mt-2 p-3 bg-green-50 rounded prose prose-sm max-w-none text-slate-700">
                  <h4 className="font-medium text-md mb-1">Solution Steps:</h4>
                  {Array.isArray(problem.solution_steps) ? (
                    <ol className="list-decimal list-inside space-y-1">
                      {problem.solution_steps.map((step, sIndex) => <li key={sIndex}><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{step}</ReactMarkdown></li>)}
                    </ol>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{problem.solution_steps}</ReactMarkdown>
                  )}
                  <h4 className="font-medium text-md mt-2 mb-1">Final Answer:</h4>
                  <p className="font-bold"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{problem.final_answer}</ReactMarkdown></p>
                </div>
              </details>

              {problem.visual_elements_description && (
                <p className="text-xs text-slate-500 mt-2 italic"><strong>Visual Suggestion:</strong> {problem.visual_elements_description}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {generatedData?.rawOutput && (
        <div className="mt-4">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <AlertTitle>AI Output Parsing Error</AlertTitle>
            <AlertDescription>
              The AI returned data in an unexpected format. The raw output is shown below for debugging.
              Our team has been notified. You can try generating again or modifying your inputs.
              {error && <span className="block mt-2">Details: {error}</span>}
            </AlertDescription>
          </Alert>
          <pre className="mt-2 p-3 bg-slate-100 text-slate-700 text-xs rounded-md overflow-x-auto whitespace-pre-wrap">
            <code>{generatedData.rawOutput}</code>
          </pre>
        </div>
      )}
      {!isLoading && !error && !generatedData?.problems && !generatedData?.rawOutput && (
        <p className="text-slate-500 text-center">Your generated math problems will appear here.</p>
      )}
    </>
  );

  return (
    <AIToolTemplate
      toolTitle="AI Math Problem Creator"
      heroAnimationPlaceholder="bg-gradient-to-r from-purple-200 to-indigo-300"
      inputSection={inputSectionContent}
      onSubmit={handleGenerateMathProblems}
      outputPreview={outputPreviewContent}
      isGenerating={isLoading}
    />
  );
};

export default MathProblemCreatorPage;
