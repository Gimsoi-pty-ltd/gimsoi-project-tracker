import { Menu, HelpCircle, Search, Settings, AlertCircle, BarChart2 } from "lucide-react";
import logo from "../../assets/gimsoi-ai.png"; 


export default function OverdueTasks() {
  const tabs = [
    "Dashboard",
    "Tasks",
    "Users",
    "Reports",
    "Documents",
    "Phases",
    "Calendar",
  ];

  const tasks = [
    { id: "TSK-8", title: "Improve Navigation & Menu Organization", urgency: "Moderate" },
    { id: "TSK-20", title: "Enhance Search Functionality", urgency: "Critical" },
    { id: "TSK-22", title: "Dark Mode Implementation", urgency: "Minor" },
    { id: "TSK-6", title: "Optimize Mobile Responsiveness", urgency: "Moderate" },
    { id: "TSK-6", title: "Redesign Checkout Flow", urgency: "Critical" },
    { id: "TSK-10", title: "Speed Optimization for Home Page", urgency: "Critical" },
    { id: "TSK-40", title: "Reduce Load Time for Large Data Sets", urgency: "Minor" },
    { id: "TSK-12", title: "Optimize Image Compression for Faster Loading", urgency: "Moderate" },
  ];

  const urgencyStyle = (urgency) => {
    switch (urgency) {
      case "Critical":
        return "text-red-500";
      case "Moderate":
        return "text-yellow-600";
      case "Minor":
        return "text-green-700";
      default:
        return "text-gray-600";
    }
  };

  return (
    <>
      

      {/* ===== Page Content ===== */}
        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-2xl shadow-lg p-6">

             {/* Table */}
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b">
              <tr>
                <th className="text-left py-3">Feature</th>
                <th className="text-left py-3">Progress</th>
                <th className="text-left py-3">Urgency</th>
                <th className="text-left py-3">Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {/* ROWS */}
              {tasks.map((task, index) => (
                <tr
                  key={index}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition"
                >
                  {/* FEATURE */}
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={task.checked}
                        className="w-5 h-5 rounded-full accent-blue-600"
                      />
                      <span className="text-gray-400 text-sm">{task.id}</span>
                      <span className="text-sm font-medium text-gray-800">
                        {task.title}
                      </span>
                    </div>
                  </td>

                  {/* PROGRESS */}
                  <td className="py-5">
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle size={20} className="text-white bg-red-500 rounded-full" />
                      Overdue
                    </div>
                  </td>

                {/* URGENCY */}
              <td className="py-5">
              <div className="flex items-center gap-3 text-sm">
    
               {/* Bar chart visualization */}
               <div className="flex items-end gap-1 h-6">
 
              <div
               className={`w-1 rounded ${task.urgency === "Critical" ? "h-2 bg-red-500": task.urgency === "Moderate" ? "h-2 bg-yellow-500": task.urgency === "Minor" ? "h-2 bg-green-700": "h-8 bg-gray-300"}`}
            ></div>

           {/* Medium urgency bar */}
               <div
               className={`w-1 rounded ${task.urgency === "Critical" ? "h-4 bg-red-500": task.urgency === "Moderate" ? "h-4 bg-yellow-500": task.urgency === "Minor" ? "h-4 bg-gray-300": "h-6 bg-gray-300"}`}
            ></div>

            <div
               className={`w-1 rounded ${task.urgency === "Critical" ? "h-6 bg-red-500": task.urgency === "Moderate" ? "h-6 bg-gray-300": task.urgency === "Minor" ? "h-6 bg-gray-300": "h-8 bg-gray-300"}`}
            ></div>

          </div>

           {task.urgency}
             </div>
            </td>

           {/* Assigned */}
        <div className="col-span-2 flex -space-x-3">
          <img
            src={`=${index + 5}`}
            className="w-9 h-9 rounded-full border-2 border-white"
          />
          {index % 2 === 1 && (
            <img
              src={`=${index + 15}`}
              className="w-9 h-9 rounded-full border-2 border-white"
            />
          )}
        </div>
        </tr>
      ))}
    </tbody>
  </table>
          </div>
        </div>
    </>
  );
}
