import React, { useEffect, useRef } from "react";

const data = [
  { label: "Complete", pct: 75, color: "#0047AB" },
  { label: "Stuck", pct: 7, color: "#f97316" },
  { label: "Working on it", pct: 18, color: "#9ca3af" },
];

const PieChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const cx = 55;
    const cy = 55;
    const r = 48;

    const toRad = (pct) => (pct / 100) * Math.PI * 2;

    let startAngle = -Math.PI / 2;

    data.forEach((segment) => {
      const sweep = toRad(segment.pct);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();

      startAngle += sweep;
    });
  }, []);

  return (
    <div className="bg-gray-100 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-[#f97316] px-6 py-4">
        <h2 className="text-sm font-bold text-white tracking-wide uppercase">Task Breakdown</h2>
      </div>

      <div className="p-5 flex items-center gap-6">
        <canvas ref={canvasRef} width={110} height={110}></canvas>

        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-sm text-gray-500 flex-1">{item.label}</span>
              <span className="text-sm font-bold text-gray-800 ml-4">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
