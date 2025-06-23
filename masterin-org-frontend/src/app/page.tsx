import React from 'react';
import HeroSection from '@/components/home/HeroSection'; // Using alias
import Link from 'next/link';

// Placeholder components for homepage sections

const FeaturedCourseCard: React.FC<{ title: string; description: string; link: string }> = ({ title, description, link }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="h-32 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
      <span className="text-gray-400">Course Thumbnail</span>
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <Link href={link} legacyBehavior>
      <a className="text-indigo-600 hover:text-indigo-800 font-medium group inline-flex items-center focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 rounded-sm p-0.5">
        Learn More <span aria-hidden="true" className="transition-transform duration-150 ease-in-out group-hover:translate-x-1 ml-1">&rarr;</span>
      </a>
    </Link>
  </div>
);

const HowItWorksStep: React.FC<{ stepNumber: number; title: string; description: string; icon?: React.ElementType }> = ({ stepNumber, title, description, icon: Icon }) => (
  <div className="text-center p-4">
    {Icon ? (
      <Icon className="w-12 h-12 text-indigo-600 mx-auto mb-4" /> // Placeholder for actual icons
    ) : (
      <div className="w-12 h-12 mx-auto bg-indigo-600 text-white flex items-center justify-center rounded-full text-xl font-bold mb-4">
        {stepNumber}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string }> = ({ quote, author, role }) => (
  <div className="bg-gray-100 p-6 rounded-lg shadow-md">
    <p className="text-gray-700 italic mb-4">"{quote}"</p>
    <p className="font-semibold text-gray-800">- {author}</p>
    <p className="text-sm text-gray-500">{role}</p>
  </div>
);

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* Featured Courses Section (Optional Placeholder) */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Featured Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeaturedCourseCard title="Advanced JavaScript" description="Master modern JavaScript concepts and techniques." link="/courses/placeholder-1" />
            <FeaturedCourseCard title="Introduction to AI" description="Explore the fundamentals of Artificial Intelligence." link="/courses/placeholder-2" />
            <FeaturedCourseCard title="Digital Marketing Essentials" description="Learn key strategies for online marketing." link="/courses/placeholder-3" />
          </div>
        </div>
      </section>

      {/* How It Works Section (Optional Placeholder) */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How MasterIn.org Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            <HowItWorksStep
              stepNumber={1}
              title="Discover & Personalize"
              description="Take our AI diagnostic quiz or explore career paths to tailor your learning journey."
              // icon={AcademicCapIcon} // Example, replace with actual or suitable icons
            />
            <HowItWorksStep
              stepNumber={2}
              title="Learn, Create & Teach"
              description="Engage with courses, utilize AI tools to build content, or share your expertise on our marketplace."
              // icon={SparklesIcon}
            />
            <HowItWorksStep
              stepNumber={3}
              title="Achieve & Grow"
              description="Track progress, earn credentials (future), and continuously develop your skills and knowledge."
              // icon={ChartBarIcon}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section (Optional Placeholder) */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="MasterIn has revolutionized how I plan my lessons. The AI tools are incredible!"
              author="Jane D."
              role="High School Teacher"
            />
            <TestimonialCard
              quote="The personalized learning path helped me focus on exactly what I needed to learn for my career change."
              author="John S."
              role="Student (Career Changer)"
            />
            <TestimonialCard
              quote="Selling my teaching materials on the marketplace was super easy and rewarding."
              author="Alice M."
              role="Educator & Creator"
            />
          </div>
        </div>
      </section>

      {/* Note: Footer is part of the global Layout.tsx, so not explicitly added here */}
    </div>
  );
};

export default HomePage;
