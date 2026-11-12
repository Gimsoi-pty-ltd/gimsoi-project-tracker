
import React from "react";
import {
  BrainCircuit,
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
} from "lucide-react";

const sampleInsights = [
  {
    id: 1,
    priority: "HIGH",
    title: "Blocked tasks detected",
    description:
      "Several tasks are blocked and may delay project delivery.",
    recommendation:
      "Review blocked tasks and resolve outstanding dependencies.",
  },
  {
    id: 2,
    priority: "MEDIUM",
    title: "Employee workload imbalance",
    description:
      "Some employees have more active tasks than others.",
    recommendation:
      "Reassign tasks to employees with available capacity.",
  },
  {
    id: 3,
    priority: "LOW",
    title: "Sprint progress monitoring",
    description:
      "Some outstanding tasks still need attention before the sprint ends.",
    recommendation:
      "Review the remaining tasks and prioritise high-impact work.",
  },
];

const priorityStyles = {
  HIGH: {
    badge: "bg-red-100 text-red-700",
    icon: <AlertTriangle size={18} className="text-red-500" />,
  },
  MEDIUM: {
    badge: "bg-yellow-100 text-yellow-700",
    icon: <AlertCircle size={18} className="text-yellow-600" />,
  },
  LOW: {
    badge: "bg-blue-100 text-blue-700",
    icon: <Info size={18} className="text-blue-500" />,
  },
};

const AIProjectInsights = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-100 rounded-lg">
            <BrainCircuit size={18} className="text-sky-500" />
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-wide">
              Project Insights
            </h2>
            <p className="text-sm text-gray-500">
              Rule-based project recommendations
            </p>
          </div>
        </div>

        <span className="text-xs text-gray-500">
          {sampleInsights.length} insights
        </span>
      </div>

      <div className="space-y-4">
        {sampleInsights.map((insight) => {
          const style = priorityStyles[insight.priority];

          return (
            <div
              key={insight.id}
              className="border border-gray-100 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{style.icon}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-gray-800">
                      {insight.title}
                    </h3>

                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${style.badge}`}
                    >
                      {insight.priority}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {insight.description}
                  </p>

                  <div className="flex items-start gap-2 bg-gray-50 rounded-md p-3">
                    <Lightbulb
                      size={16}
                      className="text-amber-500 mt-0.5 shrink-0"
                    />
                    <p className="text-sm text-gray-700">
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AIProjectInsights;
