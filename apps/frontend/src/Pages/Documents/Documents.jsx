import React, { useState, useMemo } from "react";
import { 
  Plus, 
  FileText, 
  Clock,
  Filter,
  Download,
  Share2,
  MoreVertical
} from "lucide-react";
import { useProjectStore } from "../../store/projectStore";

const DocumentRow = ({ doc, Icon = FileText }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 md:px-6 py-4 hover:bg-gray-50 transition group">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition">
          <Icon size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-sm md:text-base truncate">{doc.title}</p>
          <p className="text-xs text-gray-500">Created by {doc.createdBy}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          doc.status === 'approved' ? 'bg-green-100 text-green-700' :
          doc.status === 'in-review' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {doc.status === 'approved' ? '✓ Approved' : doc.status === 'in-review' ? 'In Review' : 'Draft'}
        </span>
        <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">{doc.updatedDate}</span>
        <button className="p-2 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-gray-600">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};

const SectionCard = ({ title, documents }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-bold text-lg text-gray-800">{title} ({documents.length})</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {documents.length > 0 ? (
          documents.map(doc => <DocumentRow key={doc.id} doc={doc} />)
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            No documents yet
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentsPage = () => {
  const { documents = [], projects = [] } = useProjectStore((state) => state);
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('updated');
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', type: 'documentation', projectId: '' });

  // Group documents by type
  const documentsByType = useMemo(() => {
    let filtered = documents;
    
    if (filterType !== 'All') {
      filtered = filtered.filter(d => d.type === filterType.toLowerCase());
    }

    // Sort
    if (sortBy === 'updated') {
      filtered = [...filtered].sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));
    } else if (sortBy === 'created') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return {
      all: filtered,
      architecture: filtered.filter(d => d.type === 'architecture'),
      'api-docs': filtered.filter(d => d.type === 'api-docs'),
      guidelines: filtered.filter(d => d.type === 'guidelines'),
      schema: filtered.filter(d => d.type === 'schema')
    };
  }, [documents, filterType, sortBy]);

  const handleAddDocument = () => {
    if (newDoc.title && newDoc.projectId) {
      console.log("Document added:", newDoc);
      setShowNewDocModal(false);
      setNewDoc({ title: '', type: 'documentation', projectId: '' });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Documents</h1>
            <div className="flex flex-wrap gap-3 md:gap-6 mt-3 text-xs md:text-sm text-gray-600">
              <button onClick={() => setFilterType('All')} className={`cursor-pointer hover:text-blue-600 ${filterType === 'All' ? 'text-blue-600 font-medium' : ''}`}>
                Filter: {filterType}
              </button>
              <button onClick={() => setSortBy('updated')} className={`cursor-pointer hover:text-blue-600 ${sortBy === 'updated' ? 'text-blue-600 font-medium' : ''}`}>
                Sort: Last Updated
              </button>
            </div>
          </div>

          <button 
            onClick={() => setShowNewDocModal(true)}
            className="flex items-center gap-2 bg-[#002D62] hover:bg-[#001f44] text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            New Document
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* Main List */}
          <div className="md:col-span-2 space-y-6">
            {filterType === 'All' ? (
              <>
                <SectionCard title="All Documents" documents={documentsByType.all} />
              </>
            ) : filterType === 'Architecture' ? (
              <SectionCard title="Architecture Documents" documents={documentsByType.architecture} />
            ) : filterType === 'API' ? (
              <SectionCard title="API Documentation" documents={documentsByType['api-docs']} />
            ) : filterType === 'Guidelines' ? (
              <SectionCard title="Guidelines" documents={documentsByType.guidelines} />
            ) : (
              <SectionCard title="Database Schema" documents={documentsByType.schema} />
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-6">
            {/* Filter Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Filter size={18} />
                Document Types
              </h3>
              <div className="space-y-2">
                {['All', 'Architecture', 'API', 'Guidelines', 'Schema'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                      filterType === type
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={18} />
                Recently Updated
              </h3>
              <div className="space-y-3">
                {documents.slice(0, 4).map(doc => (
                  <div key={doc.id} className="text-sm">
                    <p className="font-medium text-gray-800 truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500">{doc.updatedDate}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-bold mb-4">Document Library</h3>
              <p className="text-sm text-blue-100 mb-4">
                Organize and share project documents with your team
              </p>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
                  <Download size={16} />
                  Export All
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
                  <Share2 size={16} />
                  Share Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Document</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  placeholder="Enter document title"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="documentation">Documentation</option>
                  <option value="architecture">Architecture</option>
                  <option value="api-docs">API Documentation</option>
                  <option value="guidelines">Guidelines</option>
                  <option value="schema">Database Schema</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  value={newDoc.projectId}
                  onChange={(e) => setNewDoc({ ...newDoc, projectId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowNewDocModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDocument}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Create Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;