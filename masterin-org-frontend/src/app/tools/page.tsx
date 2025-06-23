import React from 'react';
import Link from 'next/link'; // Import Link for navigation if needed

// Define a type for AI tool props for clarity
type AIToolCardProps = {
  title: string;
  description: string;
  animationPlaceholder: string; // Could be a color class or a placeholder for an image/component
  linkTo?: string; // Optional link for the button
};

const AIToolCard: React.FC<AIToolCardProps> = ({ title, description, animationPlaceholder, linkTo }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-4 flex flex-col justify-between transform transition-all hover:scale-105">
      <div>
        <div className={`w-full h-32 rounded-md mb-4 ${animationPlaceholder}`}>
          {/* Placeholder for Hero Animation */}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
      </div>
      {linkTo ? (
        <Link href={linkTo} legacyBehavior>
          <a className="mt-auto bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md text-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 text-sm">
            Open Tool
          </a>
        </Link>
      ) : (
        <button
          className="mt-auto bg-gray-300 text-gray-600 font-medium py-2 px-4 rounded-md text-center transition-colors duration-150 cursor-not-allowed text-sm"
          disabled
        >
          Coming Soon
        </button>
      )}
    </div>
  );
};

// Helper to create slugs
const toSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-');

const ToolsPage = () => {
  const aiToolsData = [
    {
      title: 'Lesson Plan Generator',
      description: 'Generate comprehensive lesson plans tailored to your subject, grade level, and learning objectives.',
      animationPlaceholder: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
      isAvailable: true,
    },
    {
      title: 'Lab Designer',
      description: 'Design engaging and safe laboratory experiments with AI assistance, including materials and procedures.',
      animationPlaceholder: 'bg-gradient-to-r from-green-400 to-blue-500',
      isAvailable: false, // Example: Not yet available
    },
    {
      title: 'Assessment Generator',
      description: 'Create diverse assessments, from multiple-choice quizzes to essay prompts, aligned with your curriculum.',
      animationPlaceholder: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600',
      isAvailable: true, // Assuming quiz-builder is the assessment generator
    },
    {
      title: 'Math Problem Creator',
      description: 'Generate a variety of math problems, including word problems and equations, for different skill levels.',
      animationPlaceholder: 'bg-gradient-to-r from-indigo-400 via-blue-500 to-teal-500',
      isAvailable: false,
    },
  ];

  const aiTools: AIToolCardProps[] = aiToolsData.map(tool => ({
    ...tool,
    linkTo: tool.isAvailable ? `/tools/${toSlug(tool.title)}` : undefined,
  }));


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-gray-700">
        AI Powered Tools for Educators
      </h1>
      <p className="text-center text-lg text-gray-500 mb-12">
        Leverage artificial intelligence to streamline your teaching tasks and enhance learning experiences.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiTools.map((tool) => (
          <AIToolCard
            key={tool.title}
            title={tool.title}
            description={tool.description}
            animationPlaceholder={tool.animationPlaceholder}
            linkTo={tool.linkTo}
          />
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;
