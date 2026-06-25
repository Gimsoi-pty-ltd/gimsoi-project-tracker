import React, { useEffect, useRef } from "react";

const buildChartData = (tasks = []) => {
  const counts = {
    Complete: 0,
    Blocked: 0,
    "In Progress": 0,
    "To-do": 0,
  };

  tasks.forEach((task) => {
    const status = (task.status || "").toString().toLowerCase();
    if (status === "done" || status === "completed") counts.Complete += 1;
    else if (status === "blocked") counts.Blocked += 1;
    else if (
      status === "in_progress" ||
      status === "inprogress" ||
      status === "in progress" ||
      status === "in progress"
    ) {
      counts["In Progress"] += 1;
    } else {
      counts["To-do"] += 1;
    }
  });

  const rawData = Object.entries(counts).filter(([, value]) => value > 0);
  const total = rawData.reduce((sum, [, value]) => sum + value, 0);

  return rawData.map(([label, value], index) => ({
    label,
    value,
    pct: total ? Math.round((value / total) * 100) : 0,
    color: ["#0047AB", "#f97316", "#10B981", "#9CA3AF"][index] || "#6B7280",
  }));
};

const PieChart = ({ tasks = [] }) => {
  const canvasRef = useRef(null);
  const chartData = buildChartData(tasks);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = 55;
    const cy = 55;
    const r = 48;

    const toRad = (pct) => (pct / 100) * Math.PI * 2;
    let startAngle = -Math.PI / 2;

    chartData.forEach((segment) => {
      const sweep = toRad(segment.pct);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      startAngle += sweep;
    });
  }, [chartData]);

  return (
    <div className="bg-gray-100 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-[#f97316] px-6 py-4">
        <h2 className="text-sm font-bold text-white tracking-wide uppercase">Task Breakdown</h2>
      </div>

      <div className="p-5 flex items-center gap-6">
        <canvas ref={canvasRef} width={110} height={110}></canvas>

        <div className="flex flex-col gap-3">
          {chartData.length > 0 ? (
            chartData.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-sm text-gray-500 flex-1">{item.label}</span>
                <span className="text-sm font-bold text-gray-800 ml-4">{item.pct}%</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No task data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
