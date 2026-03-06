import React from "react";

import NavyButton from "../../Components/Buttons"; 

import { 
  Plus, 
  FileText, 
  FileCode, 
  FileSignature, 
  Layout, 
  Palette, 
  ClipboardList,
  History,
  ExternalLink
} from "lucide-react";


const DocumentRow = ({ title, updated, Icon = FileText }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition ">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center">
          <Icon size={20} className="text-blue-600" />
        </div>
        <span className="font-medium text-gray-800">{title}</span>
      </div>
      <span className="text-sm text-gray-500">{updated}</span>
    </div>
  );
};


const SectionCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 ">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-bold text-lg text-gray-800">{title}</h2>
      </div>
      <div className="divide-y divide-gray-200">{children}</div>
    </div>
  );
};


const SidebarCard = ({ title, children, icon: HeaderIcon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 ">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
        {HeaderIcon && <HeaderIcon size={18} className="text-gray-500" />}
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
};

const ActivityItem = ({ text, time }) => {
  return (
    <div className="flex gap-3 ">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold border border-gray-200">
        JD
      </div>
      <div>
        <p className="text-sm text-gray-700">{text}</p>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
};


const DocumentsPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700">Documents</h1>
            <div className="flex gap-6 mt-3 text-sm text-gray-600">
              <span className="cursor-pointer hover:text-blue-600">Filter: All</span>
              <span className="cursor-pointer hover:text-blue-600">Sort: Last Updated</span>
            </div>
          </div>

          <NavyButton className="flex items-center bg-[#1e293b] text-white px-4 py-2 rounded-lg">
            <Plus size={18} className="mr-2" />
            New Document
          </NavyButton>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main List */}
          <div className="col-span-8">
            <SectionCard title="Project Documents">
              <DocumentRow title="Project Plan" updated="Updated 2 days ago by John Doe" Icon={ClipboardList} />
              <DocumentRow title="Meeting Notes" updated="Updated 1 day ago by John Doe" Icon={FileText} />
              <DocumentRow title="Content Strategy" updated="Updated Apr 15 by Jane Doe" Icon={FileSignature} />
            </SectionCard>

            <SectionCard title="Design Files">
              <DocumentRow title="Wireframes" updated="Updated 3 days ago by Jane Doe" Icon={Layout} />
              <DocumentRow title="UI Mockups" updated="Updated Apr 10 by John Doe" Icon={Palette} />
            </SectionCard>

            <SectionCard title="Client Materials">
              <DocumentRow title="Contract Agreement" updated="Updated Mar 10 by John Doe" Icon={FileCode} />
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="col-span-4">
            <SidebarCard title="Recent Activity" icon={History}>
              <ActivityItem text='John Doe uploaded "Homepage Mockup"' time="1 hour ago" />
              <ActivityItem text='Jane Doe edited "Project Plan"' time="2 days ago" />
            </SidebarCard>

            <SidebarCard title="Quick Links" icon={ExternalLink}>
              <div className="space-y-3 text-sm text-blue-600">
                <p className="cursor-pointer hover:underline">Project Plan</p>
                <p className="cursor-pointer hover:underline">Wireframes</p>
                <p className="cursor-pointer hover:underline">Contract Agreement</p>
              </div>
            </SidebarCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;