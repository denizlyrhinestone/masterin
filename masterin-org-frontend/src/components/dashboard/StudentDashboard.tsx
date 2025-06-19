import React from 'react';

interface LearningPathItemProps {
  name: string;
}
const LearningPathItem: React.FC<LearningPathItemProps> = ({ name }) => (
  <li className="p-3 mb-2 bg-indigo-50 rounded-md shadow-sm hover:bg-indigo-100 transition-colors">
    {name}
  </li>
);

interface CourseProgressProps {
  name: string;
  progress: number;
}
const CourseProgress: React.FC<CourseProgressProps> = ({ name, progress }) => (
  <div className="p-3 mb-3 bg-sky-50 rounded-md shadow-sm">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-sky-700">{name}</span>
      <span className="text-xs font-semibold text-sky-600">{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-sky-500 h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);


const StudentDashboard: React.FC = () => {
  const learningPaths = [
    { name: 'Web Development Basics' },
    { name: 'Introduction to Algebra' },
  ];

  const courses = [
    { name: 'HTML Fundamentals', progress: 75 },
    { name: 'Solving Equations - Part 1', progress: 30 },
    { name: 'JavaScript for Beginners', progress: 50 },
  ];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-indigo-700 mb-8">
        Welcome, Student!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Learning Paths Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">My Learning Paths</h3>
          {learningPaths.length > 0 ? (
            <ul>
              {learningPaths.map((path) => (
                <LearningPathItem key={path.name} name={path.name} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No active learning paths yet. Explore and enroll!</p>
          )}
        </section>

        {/* Courses Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">My Courses</h3>
          {courses.length > 0 ? (
            <div>
              {courses.map((course) => (
                <CourseProgress key={course.name} name={course.name} progress={course.progress} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You are not currently enrolled in any courses.</p>
          )}
        </section>

        {/* Recent Activity Section */}
        <section className="md:col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h3>
          <div className="p-4 bg-gray-50 rounded-md shadow-sm">
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Completed "HTML Basics Quiz" - Score: 90%</li>
              <li>Unlocked "CSS Flexbox" badge</li>
              <li>Joined "Calculus Study Group"</li>
            </ul>
          </div>
        </section>

        {/* AI Recommendations Section */}
        <section className="md:col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">AI Recommendations</h3>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm">
            <p className="text-sm text-yellow-700">
              Based on your progress in Algebra, you might like "Advanced Trigonometry" or "Statistics Fundamentals".
            </p>
            {/* Placeholder for recommended content cards */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
