import React, { useState } from "react";
import ProfileSection from "./Settings-Page/ProfileSection";
import SecuritySection from "./Settings-Page/SecuritySection";
import PreferencesSection from "./Settings-Page/PreferencesSection";
import StorageSection from "./Settings-Page/StorageSection";
import ActivitySection from "./Settings-Page/ActivitySection";
import { User, Lock, Settings as SettingsIcon, Database, Activity } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={18} />, component: <ProfileSection /> },
    { id: "security", label: "Security & Password", icon: <Lock size={18} />, component: <SecuritySection /> },
    { id: "preferences", label: "Preferences", icon: <SettingsIcon size={18} />, component: <PreferencesSection /> },
    { id: "activity", label: "Activity Logs", icon: <Activity size={18} />, component: <ActivitySection /> },
    { id: "storage", label: "Storage & API", icon: <Database size={18} />, component: <StorageSection /> },
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#001f44] mb-6 md:mb-8">Settings</h1>
      
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 lg:pr-6 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-900 border-l-4 border-blue-900 lg:rounded-l-none"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Content */}
        <div className="flex-1 min-w-0">
          {currentTab.component}
        </div>
      </div>
    </div>
  );
}
