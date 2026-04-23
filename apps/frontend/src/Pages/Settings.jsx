import ProfileSection from "./SettingsPage/ProfileSection";
import SecuritySection from "./SettingsPage/SecuritySection";
import PreferencesSection from "./SettingsPage/PreferencesSection";
import StorageSection from "./SettingsPage/StorageSection";
import ActivitySection from "./SettingsPage/ActivitySection";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProfileSection />
        <PreferencesSection />
        <ActivitySection />
        <StorageSection />
        <SecuritySection />
      </div>
    </div>
  );
}
