import React, { useState } from "react";
import { Info } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";

const COLORS = ["#2563eb", "#f97316", "#6d28d9", "#3b82f6"];

export default function TaskDistributionCard() {
  const [showInfo, setShowInfo] = useState(false);
  const distribution = useProjectStore(
    (state) => state.dashboardData?.charts?.distribution ?? []
  );

  const total = distribution.reduce((sum, d) => sum + d.value, 0);

  const data =
    total > 0
      ? distribution.map((d, i) => ({
          ...d,
          percent: Math.round((d.value / total) * 100),
          color: COLORS[i % COLORS.length],
        }))
      : [];

  const radius = 58;
  const stroke = 24;
  const circumference = radius * 2 * Math.PI;
  let offset = 0;

  return (
    <div className="min-h-[390px] bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-sky-500 uppercase">Task Distribution</h3>
          <Info
            className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(true);
            }}
          />
        </div>
      </div>

      <div className="mb-5">
        <select className="rounded-md border border-gray-300 bg-white px-3 py-[6px] text-[13px] text-gray-700 outline-none">
          <option>By Priority</option>
        </select>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-gray-600">No tasks in this sprint</p>
          <p className="text-xs text-gray-400 mt-2 max-w-xs">
            Distribution by priority appears when sprint has tasks
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-8">
          <svg width="190" height="190" viewBox="0 0 190 190">
            <g transform="rotate(-90 95 95)">
              {data.map((item, i) => {
                const dash = (item.percent / 100) * circumference;
                const gap = circumference - dash;
                const circle = (
                  <circle
                    key={i}
                    cx="95"
                    cy="95"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += dash;
                return circle;
              })}
            </g>
          </svg>

          <div className="flex flex-col gap-4">
            {data.map((item) => (
              <div key={item.label} className="flex min-w-[180px] items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[14px] capitalize text-gray-700">{item.label}</span>
                </div>
                <span className="text-[14px] text-gray-600">
                  {item.value} ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-[13px] leading-5 text-gray-500">
        <p>Distribution based on task priority across the sprint.</p>
        <p>Click a segment to filter tasks.</p>
      </div>

      {showInfo && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white w-[90%] max-w-md rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Task Distribution</h2>
              <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-red-500">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">HOW IT IS CALCULATED</p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-gray-700">
                  (Task Type Count ÷ Total Tasks) × 100
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT MEANS</p>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                  This chart shows how tasks are distributed across different task categories
                  such as Features, Bugs, Chores, and Research tasks. It helps identify workload
                  balance within the sprint.
                </div>
              </div>

              {data.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">CURRENT DISTRIBUTION</p>
                  <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-700 space-y-2">
                    {data.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="capitalize">{item.label}</span>
                        <span>
                          {item.value} task(s) ({item.percent}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
