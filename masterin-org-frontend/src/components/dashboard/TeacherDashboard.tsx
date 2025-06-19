import React from 'react';

interface ProductItemProps {
  name: string;
  sales?: number;
  views?: number;
}
const ProductItem: React.FC<ProductItemProps> = ({ name, sales, views }) => (
  <li className="p-3 mb-2 bg-green-50 rounded-md shadow-sm hover:bg-green-100 transition-colors">
    <h4 className="font-medium text-green-800">{name}</h4>
    {sales !== undefined && views !== undefined && (
      <p className="text-xs text-green-600">Sales: {sales} | Views: {views}</p>
    )}
  </li>
);

const TeacherDashboard: React.FC = () => {
  const marketplaceProducts = [
    { name: 'Grade 5 Math Worksheets', sales: 120, views: 550 },
    { name: 'History Lesson Plan: Ancient Rome', sales: 75, views: 320 },
    { name: 'Physics Lab Guide: Optics', sales: 40, views: 200 },
  ];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-green-700 mb-8">
        Welcome, Teacher!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* My Marketplace Products Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">My Marketplace Products</h3>
          {marketplaceProducts.length > 0 ? (
            <ul>
              {marketplaceProducts.map((product) => (
                <ProductItem key={product.name} name={product.name} sales={product.sales} views={product.views} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">You haven't uploaded any products yet.</p>
          )}
        </section>

        {/* Content Usage Analytics Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Content Usage Analytics</h3>
          <div className="p-4 bg-gray-50 rounded-md shadow-sm">
            <p className="text-sm text-gray-600">
              (Placeholder for charts and stats on content engagement, e.g., most downloaded product, average rating trends.)
            </p>
            <div className="mt-3 h-32 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400">Analytics Chart Area</span>
            </div>
          </div>
        </section>

        {/* Student Performance Section */}
        <section className="md:col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Student Performance Overview</h3>
          <div className="p-4 bg-gray-50 rounded-md shadow-sm">
            <p className="text-sm text-gray-600">
              (Placeholder for overview of student progress on your courses or quizzes.)
            </p>
             <div className="mt-3 h-32 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400">Student Performance Graph</span>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="md:col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Links</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors">
              Upload New Product
            </button>
            <button className="w-full text-left p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors">
              View My Store Page
            </button>
             <button className="w-full text-left p-3 bg-teal-500 hover:bg-teal-600 text-white rounded-md shadow-sm transition-colors">
              Create New Course
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;
