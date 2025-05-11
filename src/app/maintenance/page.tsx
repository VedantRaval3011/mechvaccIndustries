import { NextPage } from "next";

const MaintenancePage: NextPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Under Maintenance</h1>
        <p className="text-lg text-gray-600 mb-4">
          Our website is currently undergoing scheduled maintenance. We&apos;ll be back soon!
        </p>
        <p className="text-sm text-gray-500">
          Expected downtime: Until [insert time or date, e.g., May 11, 2025, 12:00 PM UTC]
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;