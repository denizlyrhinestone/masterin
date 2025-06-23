"use client";

import React from 'react';
import { ContentBlock } from '@/types/courseTypes';
import { PencilIcon, TrashIcon, Bars3Icon, VideoCameraIcon, DocumentTextIcon, SparklesIcon, DocumentArrowDownIcon, BeakerIcon, HashtagIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface ContentBlockItemProps {
  block: ContentBlock;
  onEdit: (block: ContentBlock) => void;
  onDelete: (blockId: number) => void;
  onMove: (blockId: number, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

const getBlockTypeIcon = (type: string) => {
  switch (type) {
    case 'text': return DocumentTextIcon;
    case 'ai_generated_text': return SparklesIcon;
    case 'video_embed': return VideoCameraIcon;
    case 'video_upload': return VideoCameraIcon; // Could differentiate later
    case 'quiz_ref': return HashtagIcon;
    case 'lab_ref': return BeakerIcon;
    case 'downloadable_ref': return DocumentArrowDownIcon;
    default: return QuestionMarkCircleIcon;
  }
};

const ContentBlockItem: React.FC<ContentBlockItemProps> = ({ block, onEdit, onDelete, onMove, isFirst, isLast }) => {
  const IconComponent = getBlockTypeIcon(block.content_type);

  const getBlockPreview = () => {
    switch (block.content_type) {
      case 'text':
      case 'ai_generated_text':
        return <p className="text-sm text-gray-600 truncate">{block.content_data.text?.substring(0, 100) || "Empty text block"}{block.content_data.text?.length > 100 ? "..." : ""}</p>;
      case 'video_embed':
        return <p className="text-sm text-gray-600">Video: <a href={block.content_data.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{block.content_data.caption || block.content_data.url}</a></p>;
      case 'quiz_ref':
        return <p className="text-sm text-gray-600">Quiz: {block.content_data.quiz_title || `Quiz ID: ${block.content_data.quiz_id}`}</p>;
      case 'lab_ref':
        return <p className="text-sm text-gray-600">Lab: {block.content_data.lab_title || `Lab ID: ${block.content_data.lab_id}`}</p>;
      case 'downloadable_ref':
      case 'video_upload': // Assuming file_id is present and we'd show file name if fetched
        return <p className="text-sm text-gray-600">File ID: {block.content_data.file_id} (Details would show file name)</p>;
      default:
        return <p className="text-sm text-gray-500 italic">Preview not available for type: {block.content_type}</p>;
    }
  };

  return (
    <div className="p-3 bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-lg transition-shadow flex items-center space-x-3">
      <Bars3Icon className="h-5 w-5 text-gray-400 cursor-grab" title="Drag to reorder (not implemented)" /> {/* Placeholder for drag handle */}
      <IconComponent className="h-6 w-6 text-indigo-600 flex-shrink-0" title={`Type: ${block.content_type}`} />

      <div className="flex-grow min-w-0"> {/* Added min-w-0 for proper truncation */}
        {getBlockPreview()}
      </div>

      <div className="flex items-center space-x-1 flex-shrink-0">
        <button
          onClick={() => onMove(block.id, 'up')}
          disabled={isFirst}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move Up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
        </button>
        <button
          onClick={() => onMove(block.id, 'down')}
          disabled={isLast}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move Down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <button
          onClick={() => onEdit(block)}
          className="p-1 text-blue-600 hover:text-blue-800"
          title="Edit Block"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="p-1 text-red-600 hover:text-red-800"
          title="Delete Block"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ContentBlockItem;
