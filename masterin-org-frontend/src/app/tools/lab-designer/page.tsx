"use client";

import React, { useState }_from_ 'react';
import AIToolTemplate from '@/components/AIToolTemplate';
import apiClient from '@/lib/apiClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Though main button is in template
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const LabDesignerPage = () => {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [learningObjectives, setLearningObjectives] = useState(''); // Newline-separated
  const [durationMinutes, setDurationMinutes] = useState<number | string>(''); // Allow string for input flexibility
  const [availableMaterials, setAvailableMaterials] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLabDesign, setGeneratedLabDesign] = useState('');

  const handleGenerateLabDesign = async () => {
    if (!topic || !gradeLevel || !learningObjectives) {
      setError("Topic, Grade Level, and Learning Objectives are required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedLabDesign('');

    try {
      const payload = {
        topic,
        gradeLevel,
        learningObjectives,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        availableMaterials: availableMaterials || undefined,
      };
      const response = await apiClient.post<{ labDesignText: string }>('/ai/generate-lab-design', payload);
      setGeneratedLabDesign(response.data.labDesignText);
    } catch (err: any) {
      console.error("Error generating lab design:", err);
      setError(err.response?.data?.message || err.message || "Failed to generate lab design.");
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
          placeholder="e.g., Photosynthesis, Titration, Ohm's Law"
          required
        />
      </div>
      <div>
        <Label htmlFor="gradeLevel" className="font-semibold">Grade Level <span className="text-red-500">*</span></Label>
        <Input
          id="gradeLevel"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          placeholder="e.g., Grade 10, AP Chemistry, Undergraduate Physics"
          required
        />
      </div>
      <div>
        <Label htmlFor="learningObjectives" className="font-semibold">Learning Objectives (one per line) <span className="text-red-500">*</span></Label>
        <Textarea
          id="learningObjectives"
          value={learningObjectives}
          onChange={(e) => setLearningObjectives(e.target.value)}
          placeholder="e.g., Understand the process of osmosis\nObserve the effect of temperature on enzyme activity"
          rows={4}
          required
        />
      </div>
      <div>
        <Label htmlFor="durationMinutes" className="font-semibold">Estimated Duration (minutes, optional)</Label>
        <Input
          id="durationMinutes"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="e.g., 90 (for 1.5 hours)"
        />
      </div>
      <div>
        <Label htmlFor="availableMaterials" className="font-semibold">Available Materials (optional, one per line)</Label>
        <Textarea
          id="availableMaterials"
          value={availableMaterials}
          onChange={(e) => setAvailableMaterials(e.target.value)}
          placeholder="e.g., Beakers, Bunsen burner, Specific chemicals (list them)"
          rows={4}
        />
      </div>
    </div>
  );

  const outputPreviewContent = (
    <>
      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-sky-600"></div>
          <p className="ml-3 text-slate-600">Designing your lab...</p>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {generatedLabDesign && !isLoading && (
        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {generatedLabDesign}
          </ReactMarkdown>
        </div>
      )}
      {!isLoading && !error && !generatedLabDesign && (
        <p className="text-slate-500 text-center">Your generated lab design will appear here.</p>
      )}
    </>
  );

  return (
    <AIToolTemplate
      toolTitle="AI Lab Designer"
      heroAnimationPlaceholder="bg-gradient-to-r from-cyan-200 to-blue-300" // Example gradient
      inputSection={inputSectionContent}
      onSubmit={handleGenerateLabDesign}
      outputPreview={outputPreviewContent}
      isGenerating={isLoading}
    />
  );
};

export default LabDesignerPage;
