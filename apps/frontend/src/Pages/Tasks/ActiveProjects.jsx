import React from "react";
const projects = [
  {
    name: "Project 1",
    tasks: [
      { task: "Task1", owner: "Owner1", status: "Done", date: "15 Jan" },
      { task: "Task2", owner: "Owner2", status: "Stuck", date: "18 Jan" },
      { task: "Task3", owner: "Owner3", status: "Working", date: "20 Jan" },
    ],
  },
  {
    name: "Project 2",
    tasks: [
      { task: "Task4", owner: "Owner1", status: "Done", date: "15 Feb" },
      { task: "Task5", owner: "Owner2", status: "Stuck", date: "18 Feb" },
      { task: "Task6", owner: "Owner3", status: "Working", date: "20 Feb" },
    ],
  },
  {
    name: "Project 3",
    tasks: [
      { task: "Task7", owner: "Owner1", status: "Done", date: "15 Mar" },
      { task: "Task8", owner: "Owner2", status: "Stuck", date: "18 Mar" },
      { task: "Task9", owner: "Owner3", status: "Working", date: "20 Mar" },
    ],
  },
];

const statusStyle = {
  Done: "bg-green-500",
  Working: "bg-orange-400",
  Stuck: "bg-red-500",
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Top Bar */}
      <div className="bg-blue-800 text-white px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">G</div>
          <h1 className="text-lg font-semibold">Gimsoi AI</h1>
        </div>
        <div className="flex gap-6 text-xl">
          <span>🔍</span>
          <span>👤</span>
          <span>⚙</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-10">
        <h2 className="text-3xl font-semibold mb-4">
          My Active Projects
        </h2>

        {/* Controls */}
        <div className="flex gap-6 text-gray-600 mb-8">
          <span className="cursor-pointer hover:text-black">Search</span>
          <span className="cursor-pointer hover:text-black">Person</span>
          <span className="cursor-pointer hover:text-black">Filter</span>
          <span className="cursor-pointer hover:text-black">Sort</span>
          <span className="cursor-pointer hover:text-black">Hide</span>
          <span className="cursor-pointer hover:text-black">Group by</span>
        </div>

        {/* Projects */}
        {projects.map((project, index) => (
          <div key={index} className="mb-12">
            <h3 className="text-xl font-semibold mb-4">{project.name}</h3>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 border"></th>
                    <th className="p-4 border">Tasks</th>
                    <th className="p-4 border">Task Owners</th>
                    <th className="p-4 border">Task Status</th>
                    <th className="p-4 border">Due Date</th>
                  </tr>
                </thead>

                <tbody>
                  {project.tasks.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-4 border">
                        <input type="checkbox" />
                      </td>
                      <td className="p-4 border">{item.task}</td>
                      <td className="p-4 border">{item.owner}</td>
                      <td className="p-4 border">
                        <span
                          className={`text-white px-4 py-1 rounded-full text-sm ${statusStyle[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 border">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {index === projects.length - 1 && (
              <button className="mt-4 px-5 py-2 border border-black rounded hover:bg-black hover:text-white transition">
                + Add New
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}