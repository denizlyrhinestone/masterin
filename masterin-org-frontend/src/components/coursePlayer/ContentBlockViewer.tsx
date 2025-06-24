"use client";

import React from 'react';
import { ContentBlock, CourseQuizData, QuizResultsType } from '@/types/courseTypes'; // Added CourseQuizData, QuizResultsType
import ReactMarkdown from 'react-markdown';
import { DocumentTextIcon, VideoCameraIcon, HashtagIcon, BeakerIcon, DocumentArrowDownIcon, SparklesIcon, QuestionMarkCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import QuizPlayer from '@/components/quizPlayer/QuizPlayer'; // Import QuizPlayer

interface ContentBlockViewerProps {
  block: ContentBlock | null; // Current block to display (content_data here is just {quiz_id, quiz_title})
  blockDetails: any | null; // Full details from GET /.../details endpoint, e.g. full quiz questions
  isLoading: boolean;
  error?: string | null;
  courseId: string | number; // Needed for QuizPlayer submission
  // onStartQuiz is removed as QuizPlayer will be rendered directly
  onViewLab?: (labId: number | string) => void; // Callback for labs
  onQuizComplete?: (results: QuizResultsType) => void; // Pass this to QuizPlayer
}

const ContentBlockViewer: React.FC<ContentBlockViewerProps> = ({ block, blockDetails, isLoading, error, courseId, onViewLab, onQuizComplete }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 min-h-[300px] bg-slate-100 rounded-md">
        <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 bg-red-50 text-red-700 rounded-md">Error loading content: {error}</div>;
  }

  if (!block) {
    return <div className="p-10 bg-slate-100 text-slate-500 rounded-md text-center">Select a lesson item to view its content.</div>;
  }

  const renderBlockContent = () => {
    switch (block.content_type) {
      case 'text':
      case 'ai_generated_text':
        return (
          <article className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none p-1">
            <ReactMarkdown>{block.content_data?.text || '*No text content provided.*'}</ReactMarkdown>
          </article>
        );
      case 'video_embed':
        return (
          <div className="aspect-w-16 aspect-h-9">
            {block.content_data?.url ? (
              <iframe
                src={block.content_data.url.replace("watch?v=", "embed/")} // Basic YouTube embed conversion
                title={block.content_data?.caption || 'Embedded Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-md shadow-lg"
              ></iframe>
            ) : <p className="text-slate-500">Video URL not available.</p>}
            {block.content_data?.caption && <p className="mt-2 text-sm text-slate-600 text-center">{block.content_data.caption}</p>}
          </div>
        );
      case 'quiz_ref':
        return (
          <div className="text-center p-6 bg-sky-50 rounded-lg shadow">
            <HashtagIcon className="h-12 w-12 text-sky-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-sky-700 mb-2">{block.content_data?.quiz_title || `Quiz ID: ${block.content_data?.quiz_id}`}</h3>
            <p className="text-sm text-slate-600 mb-4">This lesson includes a quiz. Click below to start.</p>
            {/* Render QuizPlayer if blockDetails (which should contain full quiz data) is available */}
            {blockDetails && blockDetails.questions ? (
              <QuizPlayer
                quizData={blockDetails as CourseQuizData} // blockDetails IS the quizData here
                courseId={courseId}
                onQuizComplete={(results) => {
                  console.log("Quiz completed in viewer:", results);
                  if(onQuizComplete) onQuizComplete(results);
                  // Potentially update UI or navigate based on results
                }}
              />
            ) : (
              // Fallback or loading state for quiz questions if blockDetails not yet populated
              // This might indicate an issue if block.content_type is quiz_ref but blockDetails is not the quiz
              <p className="text-orange-500">Quiz content is loading or not available.</p>
            )}
          </div>
        );
      case 'lab_ref':
         return (
          <div className="text-center p-6 bg-teal-50 rounded-lg shadow">
            <BeakerIcon className="h-12 w-12 text-teal-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-teal-700 mb-2">{block.content_data?.lab_title || `Lab ID: ${block.content_data?.lab_id}`}</h3>
            <p className="text-sm text-slate-600 mb-4">Engage with this lab or simulation.</p>
            {/* Depending on lab_type, this might be an embed or a link */}
            {block.content_data?.embed_url || block.content_data?.config_json ? (
                 <button
                    onClick={() => onViewLab && block.content_data?.lab_id && onViewLab(block.content_data.lab_id)}
                    className="py-2 px-6 rounded-md text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center transition-colors"
                >
                    <PlayCircleIcon className="h-5 w-5 mr-2" /> View Lab/Simulation
                </button>
            ) : <p className="text-slate-500">Lab content not available for direct viewing.</p>}
          </div>
        );
      case 'video_upload':
        if (blockDetails?.view_url) {
          return (
            <div className="bg-slate-900 rounded-lg shadow-lg overflow-hidden">
              <video
                src={blockDetails.view_url}
                controls
                className="w-full max-h-[calc(100vh-300px)]" // Example max height
                preload="metadata"
              >
                Your browser does not support the video tag. You can download it <a href={blockDetails.view_url} download={blockDetails.file_name || 'video'}>here</a>.
              </video>
              {blockDetails.file_name && <p className="mt-2 p-2 text-sm text-slate-200 bg-slate-800 text-center">{blockDetails.file_name}</p>}
            </div>
          );
        }
        return <p className="text-slate-500 p-4">Video content is being processed or is unavailable.</p>;

      case 'slide_deck_upload': // Primarily for PDFs or viewable slide formats
        if (blockDetails?.view_url) {
          if (blockDetails.mime_type === 'application/pdf') {
            return (
              <div className="h-[calc(100vh-280px)] border border-slate-300 rounded-md overflow-hidden">
                <iframe
                  src={blockDetails.view_url}
                  title={blockDetails.file_name || 'Slide Deck'}
                  className="w-full h-full"
                ></iframe>
              </div>
            );
          }
          // For other slide types (pptx etc.), browser might download or try to render if plugin exists.
          // Offering a direct link is safer.
          return (
            <div className="text-center p-6 bg-indigo-50 rounded-lg shadow">
              <DocumentIcon className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-indigo-700 mb-2">{blockDetails.file_name || 'Slide Deck'}</h3>
              <p className="text-sm text-slate-600 mb-4">This slide deck may not be viewable directly. You can try opening or downloading it.</p>
              <a
                href={blockDetails.view_url} // view_url might prompt download for non-PDFs
                target="_blank" rel="noopener noreferrer"
                className="py-2 px-6 rounded-md text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 inline-flex items-center transition-colors"
              >
                Open/Download Slides
              </a>
            </div>
          );
        }
        return <p className="text-slate-500 p-4">Slide deck content is being processed or is unavailable.</p>;

      case 'downloadable_ref':
        if (blockDetails?.download_url) {
          return (
            <div className="text-center p-6 bg-purple-50 rounded-lg shadow">
              <DocumentArrowDownIcon className="h-12 w-12 text-purple-500 mx-auto mb-3"/>
              <h3 className="text-xl font-semibold text-purple-700 mb-2">{blockDetails.file_name || 'Downloadable Resource'}</h3>
              <a
                href={blockDetails.download_url}
                download={blockDetails.file_name || 'download'} // Suggest original filename for download
                className="py-2 px-6 rounded-md text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 inline-flex items-center transition-colors"
              >
                Download Resource
              </a>
            </div>
          );
        }
        return <p className="text-slate-500 p-4">Downloadable content is being processed or is unavailable.</p>;

      // Placeholder for a generic image uploaded via uploaded_files (if schema supports 'image_upload' type)
      // case 'image_upload':
      //   if (blockDetails?.public_url) { // Assuming backend provides public_url for this type
      //     return (
      //       <div className="text-center p-4">
      //         <img src={blockDetails.public_url} alt={blockDetails.file_name || 'Uploaded Image'} className="max-w-full h-auto rounded-md shadow-md mx-auto" />
      //         {blockDetails.file_name && <p className="mt-2 text-sm text-slate-600">{blockDetails.file_name}</p>}
      //       </div>
      //     );
      //   }
      //   return <p className="text-slate-500">Image content not available.</p>;

      default:
        return <p className="text-slate-500 italic">Unsupported content block type: "{block.content_type}"</p>;
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white shadow-lg rounded-lg min-h-[calc(100vh-250px)]"> {/* Adjust min-h as needed */}
      {renderBlockContent()}
    </div>
  );
};

export default ContentBlockViewer;
