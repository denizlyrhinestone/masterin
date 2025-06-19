import React from 'react';
import Link from 'next/link';

// Placeholder for an icon - in a real app, you'd use an SVG or an icon library
const PlaceholderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${className || 'bg-gray-300'}`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  </div>
);

interface AIToolShowcaseItemProps {
  name: string;
  description: string;
  iconBgColor: string;
}

const AIToolShowcaseItem: React.FC<AIToolShowcaseItemProps> = ({ name, description, iconBgColor }) => (
  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
    <div className="flex items-center mb-3">
      <PlaceholderIcon className={iconBgColor} />
      <h4 className="ml-3 text-md font-semibold text-gray-700">{name}</h4>
    </div>
    <p className="text-xs text-gray-500">{description}</p>
  </div>
);

const HeroSection: React.FC = () => {
  const aiTools = [
    { name: 'Lesson Plan Generator', description: 'Craft tailored lesson plans in minutes.', iconBgColor: 'bg-purple-500' },
    { name: 'Lab Designer', description: 'Design engaging lab experiments with AI.', iconBgColor: 'bg-green-500' },
    { name: 'Assessment Generator', description: 'Create diverse tests and quizzes effortlessly.', iconBgColor: 'bg-yellow-500' },
    { name: 'Math Problem Creator', description: 'Generate varied math problems for all levels.', iconBgColor: 'bg-blue-500' },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-slate-200 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text Content & CTA */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              MasterIn.org: Your Personalized Learning Journey Starts Here
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10">
              Empowering educators and students with AI-driven tools for enhanced learning, teaching, and marketplace collaboration.
            </p>
            <Link href="/learning-path" legacyBehavior>
              <a className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-transform duration-150 ease-in-out transform hover:scale-105">
                Start Your Learning Path
              </a>
            </Link>
          </div>

          {/* Right Column: AI Tool Showcase */}
          <div className="mt-12 md:mt-0">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2 text-center md:text-left">Discover Our AI Tools</h3>
            <p className="text-sm text-gray-500 mb-6 text-center md:text-left">
              {/* Future Animation Note: This section is intended to be an animated slider/carousel in a future iteration. */}
              Streamline your educational tasks with our suite of intelligent tools.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {aiTools.map(tool => (
                <AIToolShowcaseItem
                  key={tool.name}
                  name={tool.name}
                  description={tool.description}
                  iconBgColor={tool.iconBgColor}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
