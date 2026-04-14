import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";

export default function ProjectTrackerProfilePage() {
  return (
    <div className="min-h-screen bg-white p-10">
      {/* Profile Header */}
      <div className="flex items-start justify-between mb-12">
        <div className="flex items-center gap-6">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#4f46e5', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600
          }}>
            S
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-black">
              Sarah Mitchell
            </h1>
            <p className="text-lg text-gray-700 mt-1">Project Manager</p>
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <p>📧 sarah.mitchell@email.com</p>
              <p>📞 +1 (555) 123-4567</p>
            </div>
          </div>
        </div>
        <button className="rounded-2xl px-6 py-2 text-base bg-blue-600 text-white hover:bg-blue-700 transition">Edit Profile</button>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Assigned Projects */}
        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Assigned Projects</h2>
          <div className="space-y-4 text-sm text-gray-800">
            <div>
              <p className="font-medium">Website Redesign</p>
              <p className="text-gray-600">Status: In Progress</p>
            </div>
            <div>
              <p className="font-medium">Mobile App Development</p>
              <p className="text-gray-600">Status: Active</p>
            </div>
            <div>
              <p className="font-medium">Marketing Campaign</p>
              <p className="text-gray-600">Status: Completed</p>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Permissions</h2>
          <div className="space-y-4 text-sm text-gray-800">
            <p><span className="font-medium">Role:</span> Project Manager</p>
            <p><span className="font-medium">Access Level:</span> Admin</p>
            <p><span className="font-medium">Project Access:</span> All Projects</p>
            <p><span className="font-medium">Task Management:</span> Full Access</p>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Activity Log</h2>
          <div className="space-y-4 text-sm text-gray-800">
            <p>02/14/2024 - Updated task "Design Mockup"</p>
            <p>02/12/2024 - Commented on "App Development"</p>
            <p>02/10/2024 - Completed project "Marketing Campaign"</p>
            <p>02/08/2024 - Assigned new task "Client Meeting"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
