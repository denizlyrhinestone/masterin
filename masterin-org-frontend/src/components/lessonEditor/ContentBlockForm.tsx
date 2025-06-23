"use client";

import React, { useState, useEffect } from 'react';
import { ContentBlock } from '@/types/courseTypes';
import { XMarkIcon, SparklesIcon, DocumentTextIcon, VideoCameraIcon, HashtagIcon, BeakerIcon, DocumentArrowDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; // Added QuestionMarkCircleIcon

export type ContentBlockType = 'text' | 'video_embed' | 'video_upload' | 'slide_deck_embed' | 'slide_deck_upload' | 'quiz_ref' | 'lab_ref' | 'downloadable_ref' | 'ai_generated_text';

const blockTypeOptions: { value: ContentBlockType; label: string; icon: React.ElementType }[] = [
  { value: 'text', label: 'Text Block', icon: DocumentTextIcon },
  { value: 'ai_generated_text', label: 'AI Assisted Text', icon: SparklesIcon },
  { value: 'video_embed', label: 'Video Embed (URL)', icon: VideoCameraIcon },
  { value: 'quiz_ref', label: 'Quiz Reference', icon: HashtagIcon },
  { value: 'lab_ref', label: 'Lab/Simulation Ref', icon: BeakerIcon },
  { value: 'downloadable_ref', label: 'Downloadable File Ref', icon: DocumentArrowDownIcon },
  // Future types: video_upload, slide_deck_embed, slide_deck_upload
];

interface ContentBlockFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockData: Partial<ContentBlock>) => void;
  initialData?: Partial<ContentBlock> | null;
  availableQuizzes?: { id: number; title: string }[];
  availableLabs?: { id: number; title: string }[];
  availableFiles?: { id: number; file_name: string }[];
}

// Helper to get JWT token (placeholder)
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (!token) console.warn("No JWT token found for AI operation.");
    return token;
  }
  return null;
};

const ContentBlockForm: React.FC<ContentBlockFormProps> = ({
  isOpen, onClose, onSave, initialData,
  availableQuizzes = [{id:1, title:"Sample Quiz 1 (Mock)"}, {id:2, title:"Python Intro Quiz (Mock)"}],
  availableLabs = [{id:1, title:"Physics Lab Alpha (Mock)"}, {id:2, title:"Chemistry Sim Beta (Mock)"}],
  availableFiles = [{id:1, file_name:"cheatsheet.pdf (Mock)"}, {id:2, file_name:"syllabus.docx (Mock)"}],
}) => {
  const [blockType, setBlockType] = useState<ContentBlockType>('text');
  const [contentData, setContentData] = useState<any>({});
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [isGeneratingAiText, setIsGeneratingAiText] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setBlockType(initialData.content_type || 'text');
        setContentData(initialData.content_data || {});
        setOrderIndex(initialData.order_index || 0);
      } else {
        setBlockType('text');
        setContentData({});
        setOrderIndex(0);
      }
      setIsGeneratingAiText(false);
      setAiGenerationError(null);
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave({ id: initialData?.id, content_type: blockType, content_data: contentData, order_index: orderIndex });
    onClose();
  };

  const handleContentDataChange = (field: string, value: any) => {
    setContentData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateAiText = async () => {
    const userPrompt = contentData.text?.trim(); // Use current text as prompt
    if (!userPrompt) {
      setAiGenerationError("Please enter a prompt in the text area first.");
      return;
    }
    setIsGeneratingAiText(true);
    setAiGenerationError(null);
    const token = getAuthToken();
    if (!token) {
      setAiGenerationError("Authentication required for AI features.");
      setIsGeneratingAiText(false);
      return;
    }
    try {
      const response = await fetch('/api/ai/generate-lesson-text-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate text from AI.');
      }
      setContentData(prev => ({ ...prev, text: data.generatedText }));
    } catch (err: any) {
      setAiGenerationError(err.message || 'An error occurred.');
    } finally {
      setIsGeneratingAiText(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow">
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{initialData?.id ? 'Edit' : 'Add New'} Content Block</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {(!initialData?.id) && (
          <div className="mb-4">
            <label htmlFor="blockType" className="block text-sm font-medium text-gray-700 mb-1">Block Type</label>
            <select id="blockType" value={blockType}
              onChange={(e) => {
                setBlockType(e.target.value as ContentBlockType);
                setContentData({});
                setAiGenerationError(null);
              }}
              className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
              {blockTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        )}

        <div className="space-y-4">
          {blockType === 'text' || blockType === 'ai_generated_text' ? (
            <div>
              <label htmlFor="text-content" className="block text-sm font-medium text-gray-700 mb-1">
                {blockType === 'ai_generated_text' ? 'Prompt / Text Content' : 'Text Content'}
              </label>
              <textarea id="text-content" rows={blockType === 'ai_generated_text' ? 4 : 8}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={contentData.text || ''}
                onChange={(e) => handleContentDataChange('text', e.target.value)}
                placeholder={blockType === 'ai_generated_text' ? "Enter your prompt here, then click 'Generate with AI'. You can also type or paste directly." : "Enter your text content..."}
              />
              {blockType === 'ai_generated_text' && (
                <div className="mt-2">
                  <button type="button" onClick={handleGenerateAiText} disabled={isGeneratingAiText || !contentData.text?.trim()}
                    className="text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium py-1.5 px-3 rounded-md inline-flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                    <SparklesIcon className={`h-4 w-4 mr-1.5 ${isGeneratingAiText ? 'animate-spin' : ''}`} />
                    {isGeneratingAiText ? 'Generating...' : 'Generate with AI'}
                  </button>
                  {aiGenerationError && <p className="text-xs text-red-600 mt-1.5">{aiGenerationError}</p>}
                </div>
              )}
            </div>
          ) : blockType === 'video_embed' ? ( /* UI for video embed */ <>
            <div><label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-1">Video URL</label><input type="url" id="video-url" className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm" value={contentData.url || ''} onChange={(e) => handleContentDataChange('url', e.target.value)} placeholder="https://youtube.com/watch?v=example" /></div>
            <div><label htmlFor="video-caption" className="block text-sm font-medium text-gray-700 mb-1">Caption</label><input type="text" id="video-caption" className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm" value={contentData.caption || ''} onChange={(e) => handleContentDataChange('caption', e.target.value)} /></div></>
          ) : blockType === 'quiz_ref' ? ( /* UI for quiz ref */ <div>
            <label htmlFor="quiz-ref" className="block text-sm font-medium text-gray-700 mb-1">Select Quiz</label>
            <select id="quiz-ref" value={contentData.quiz_id || ''} onChange={(e) => { const qId = parseInt(e.target.value); const qTitle = availableQuizzes.find(q=>q.id === qId)?.title || ''; setContentData({quiz_id: qId, quiz_title: qTitle});}} className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm">
              <option value="">-- Select a Quiz --</option>{availableQuizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}</select></div>
          ) : blockType === 'lab_ref' ? ( /* UI for lab ref */ <div>
            <label htmlFor="lab-ref" className="block text-sm font-medium text-gray-700 mb-1">Select Lab</label>
            <select id="lab-ref" value={contentData.lab_id || ''} onChange={(e) => { const lId = parseInt(e.target.value); const lTitle = availableLabs.find(l=>l.id === lId)?.title || ''; setContentData({lab_id: lId, lab_title: lTitle});}} className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm">
              <option value="">-- Select a Lab --</option>{availableLabs.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></div>
          ) : blockType === 'downloadable_ref' || blockType === 'video_upload' || blockType === 'slide_deck_upload' ? ( /* UI for file ref */ <div>
            <label htmlFor="file-ref" className="block text-sm font-medium text-gray-700 mb-1">Select File</label><p className="text-xs text-gray-500 mb-1">(File upload component will be integrated here later. Select mock file ID.)</p>
            <select id="file-ref" value={contentData.file_id || ''} onChange={(e) => { const fId = parseInt(e.target.value); const fName = availableFiles.find(f=>f.id === fId)?.file_name || ''; setContentData({file_id: fId, file_name: fName});}} className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm">
              <option value="">-- Select a File --</option>{availableFiles.map(f => <option key={f.id} value={f.id}>{f.file_name}</option>)}</select></div>
          ) : (<p className="text-gray-500 text-sm">Configuration for '{blockType}' not implemented yet.</p>)}
          <div className="mt-3"><label htmlFor="order-index" className="block text-sm font-medium text-gray-700 mb-1">Order Index</label><input type="number" id="order-index" value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value,10)||0)} className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm"/></div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md text-sm transition-colors">Cancel</button>
          <button type="button" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors">{initialData?.id ? 'Save Changes' : 'Add Block'}</button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes modalShow {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modalShow { animation: modalShow 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ContentBlockForm;
