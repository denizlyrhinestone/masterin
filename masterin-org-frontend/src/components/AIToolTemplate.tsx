import React, { ReactNode } from 'react';

type AIToolTemplateProps = {
  toolTitle: string;
  heroAnimationPlaceholder?: string; // e.g., a background color class or image URL
  inputSection: ReactNode; // Allow passing complex form structures
  onSubmit: () => void; // Function to call when the main action (e.g., "Generate") is triggered
  outputPreview: ReactNode; // Where the generated content will be shown
  isGenerating?: boolean; // To show loading state on button or output
};

const AIToolTemplate: React.FC<AIToolTemplateProps> = ({
  toolTitle,
  heroAnimationPlaceholder = 'bg-gray-200', // Default placeholder color
  inputSection,
  onSubmit,
  outputPreview,
  isGenerating = false,
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">{toolTitle}</h1>
        <div className={`w-full h-48 md:h-64 rounded-lg shadow-md ${heroAnimationPlaceholder} flex items-center justify-center`}>
          <span className="text-gray-500 text-xl">Hero Animation/Graphic Area</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Section */}
        <section className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Specifications</h2>
          {inputSection}
          <button
            onClick={onSubmit}
            disabled={isGenerating}
            className={`w-full mt-6 py-3 px-4 font-semibold rounded-md text-white transition-colors duration-150 ease-in-out
              ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </section>

        {/* Output Section */}
        <section className="bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Generated Output</h2>
          <div className="min-h-[200px] p-4 border border-gray-300 rounded-md bg-gray-50">
            {outputPreview}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-150"
              onClick={() => alert('Save action clicked (not implemented)')}
            >
              Save
            </button>
            <button
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-150"
              onClick={() => alert('Export action clicked (not implemented)')}
            >
              Export
            </button>
            <button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-150"
              onClick={() => alert('Attach to Learning Path clicked (not implemented)')}
            >
              Attach to Learning Path
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AIToolTemplate;
