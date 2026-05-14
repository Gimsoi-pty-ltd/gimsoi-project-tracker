import React from 'react';
 
const phases = [
  {
    name: "Planning",
    progress: 100,
    owner: "Lisa M.",
    due: "May 7",
    status: "Completed",
    statusColor: "bg-green-800",
  },
  {
    name: "Design",
    progress: 65,
    owner: "John D.",
    due: "May 18",
    status: "In Progress",
    statusColor: "bg-yellow-500",
  },
  {
    name: "Development",
    progress: 20,
    owner: "John D.",
    due: "May 18",
    status: "Blocked",
    statusColor: "bg-red-500",
  },
  {
    name: "Testing",
    progress: 90,
    owner: "David S.",
    due: "May 12",
    status: "Under Review",
    statusColor: "bg-green-400",
  },
  {
    name: "Deployment",
    progress: 50,
    owner: "Mike R.",
    due: "May 25",
    status: "In Progress",
    statusColor: "bg-yellow-500",
  },
];
 
const PhaseOverview = () => {
  return (
    <div className="min-h-screen bg-gray-50">
 
      <div className="max-w-7xl mx-auto px-6 py-10">
 
        <h1 className="text-2xl font-bold mb-8">
          Phase Overview
        </h1>
 
        <div className="grid md:grid-cols-2 gap-6">
 
          {phases.map((phase) => (
            <div
              key={phase.name}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {phase.name}
                </h2>
 
                <span
                  className={`text-white text-xs px-4 py-1 rounded-full ${phase.statusColor}`}
                >
                  {phase.status}
                </span>
              </div>
 
              <div className="w-full bg-gray-200 rounded-full h-6 mb-4 overflow-hidden">
                <div
                  className="h-full bg-blue-600 flex items-center justify-end pr-3 text-xs text-white font-semibold"
                  style={{ width: `${phase.progress}%` }}
                >
                  {phase.progress}%
                </div>
              </div>
 
              <div className="text-sm text-gray-600">
                <p>Owner: {phase.owner}</p>
                <p>Due: {phase.due}</p>
              </div>
            </div>
          ))}
        </div>
 
        {/* Summary Footer */}
        <div className="flex justify-center gap-10 mt-12 text-gray-600 text-sm">
 
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-xl">●</span>
            In Progress
          </div>
 
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-xl">●</span>
            Blocked
          </div>
 
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">●</span>
            Under Review
          </div>
 
          <div className="flex items-center gap-2">
            <span className="text-green-800 text-xl">●</span>
            Completed
          </div>
 
        </div>
 
      </div>
    </div>
  );
 }
 
export default PhaseOverview;