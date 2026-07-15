import ProfileSection from "./Settings-Page/ProfileSection";
import SecuritySection from "./Settings-Page/SecuritySection";
import PreferencesSection from "./Settings-Page/PreferencesSection";
import StorageSection from "./Settings-Page/StorageSection";
import ActivitySection from "./Settings-Page/ActivitySection";


export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto  space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black ">Settings</h1>
          
        </div>

        <div className="grid w-full grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-2">
          <ProfileSection />
          <PreferencesSection />
          <ActivitySection />
          <StorageSection />
          <SecuritySection />
        </div>
      </div>
    </div>
  );
}
