import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Info } from "lucide-react";

export default function ProjectHealthPanel() {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Only Project Managers can see this panel
  //   const userRole = user?.role?.toLowerCase();

  //   const isProjectManager =
  //     userRole === "project manager" || userRole === "project_manager";

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  //   // Hide panel from other users
  //   if (!isProjectManager) {
  //     return null;
  //   }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      {/* Panel header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-blue-50 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">Project Health</h2>

          <p className="text-sm text-gray-500">
            Overview of your project's health
          </p>
        </div>

        <div className="flex items-center justify-end gap-1 mb-8 ml-auto">
          <Info size={16} className="text-blue-500" />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-16 bg-gray-100 rounded-lg" />
          <div className="h-5 bg-gray-200 rounded w-2/3" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <p className="font-medium">Unable to load project health.</p>
          </div>
          <p className="text-sm text-gray-600 mt-2">Please try again later.</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* Boitumelo - Project Health Metrics */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800">
              Health Metrics
            </h3>

            {/* health score, performance metrics and risk reasons here */}

            <div className="rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-sm text-gray-500">
                Health metrics and risk reasons will appear here.
              </p>
            </div>
          </section>

          {/* AI Insights and Recommendations */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800">
              AI Insights & Recommendations
            </h3>

            {/*AI insights and recommendations */}

            <div className="rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-sm text-gray-500">
                AI insights and recommendations will appear here.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
