import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
import { useSprintStore } from "../../store/sprintStore";

export default function BurnDownCard() {
  const [showInfo, setShowInfo] = useState(false);
  const activeSprint = useProjectStore((state) => state.activeSprint);
  const fetchSprintBurndown = useSprintStore((state) => state.fetchSprintBurndown);
  const burndownRaw = useSprintStore((state) => state.burndownData);
  const burndown = burndownRaw || [];

  useEffect(() => {
    if (activeSprint?.id) {
      fetchSprintBurndown(activeSprint.id).catch(console.error);
    }
  }, [activeSprint?.id, fetchSprintBurndown]);

  const startDate = activeSprint?.startDate
    ? new Date(activeSprint.startDate).toLocaleDateString()
    : "—";
  const endDate = activeSprint?.endDate
    ? new Date(activeSprint.endDate).toLocaleDateString()
    : "—";

  const hasChartData = burndown.length > 1;

  const width = 470;
  const height = 220;
  const padding = 35;
  const maxY = hasChartData ? Math.max(...burndown.map((d) => d.ideal)) + 5 : 1;

  const getX = (i) => padding + (i * (width - padding * 2)) / (burndown.length - 1);
  const getY = (v) => height - padding - (v / maxY) * (height - padding * 2);
  const createPath = (key) =>
    burndown.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d[key])}`).join(" ");

  return (
    <div className="min-h-[390px] bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-blue-400 uppercase">BURN-DOWN CHART</h3>
          <Info
            className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(true);
            }}
          />
        </div>
      </div>

      {!hasChartData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-gray-600">No burndown data yet</p>
          <p className="text-xs text-gray-400 mt-2 max-w-xs">
            Burndown chart requires a backend endpoint that is not available yet.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <select className="rounded-md border border-gray-300 bg-white px-3 py-[6px] text-[13px] text-gray-700 outline-none">
              <option>Story Points Remaining</option>
            </select>
            <div className="flex items-center gap-5 text-[13px]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#16a34a]" />
                <span className="text-gray-500">Actual</span>
              </div>
            </div>
          </div>

          <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d1d5db" />
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#d1d5db"
            />
            <path
              d={createPath("ideal")}
              fill="none"
              stroke="#b0b7c3"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <path d={createPath("actual")} fill="none" stroke="#16a34a" strokeWidth="3" />
            {burndown.map((d, i) => (
              <circle key={i} cx={getX(i)} cy={getY(d.actual)} r="4.8" fill="#16a34a" />
            ))}
            {burndown.map((d, i) => (
              <text
                key={i}
                x={getX(i)}
                y={height - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {d.day}
              </text>
            ))}
            {[0, 10, 20, 30, 40].map((v) => (
              <text key={v} x="12" y={getY(v) + 4} fontSize="10" fill="#6b7280">
                {v}
              </text>
            ))}
          </svg>
        </>
      )}

      <div className="mt-2 text-[13px] text-gray-700">
        <p>
          <span className="font-semibold">Sprint Duration:</span> {startDate} – {endDate}
        </p>
        <p className="mt-1 text-gray-500">Shows remaining story points over sprint duration</p>
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
              <h2 className="text-xl font-bold text-gray-900">Burn-Down Chart</h2>
              <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-red-500">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT TRACKS</p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-gray-700">
                  Remaining story points across the sprint duration.
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">WHAT IT MEANS</p>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                  The burn-down chart shows how much work is still remaining in the sprint.
                  The ideal line represents expected progress while the actual line shows the
                  team&apos;s real progress over time.
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">CURRENT SPRINT</p>
                <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-700">
                  Sprint Duration: {startDate} – {endDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
