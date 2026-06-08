import { useState, useMemo } from "react";
import { Search, Mail, MessageCircle, FileText } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";

export default function HelpSupport() {
  const { helpTopics } = useProjectStore((state) => state);
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Get unique categories
  const categories = ["All", ...new Set(helpTopics.map(t => t.category))];

  // Filter topics based on search and category
  const filteredTopics = useMemo(() => {
    return helpTopics.filter(topic => {
      const matchesSearch = 
        searchQuery === "" || 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === "All" || topic.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, helpTopics]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* ===== Help Header Section ===== */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">
            Find answers to common questions or contact support.
          </p>

          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2.5 pl-10 pr-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ===== Help Categories Filter ===== */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6 bg-white border-b sticky top-0 z-10">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all
                ${
                  activeCategory === category
                    ? 'bg-[#002D62] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* ===== FAQ Section ===== */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-10">
        <h2 className="text-lg md:text-xl font-semibold mb-4">
          {searchQuery || activeCategory !== "All" 
            ? `Results (${filteredTopics.length})` 
            : "Frequently Asked Questions"}
        </h2>

        {filteredTopics.length > 0 ? (
          <div className="space-y-2 md:space-y-3">
            {filteredTopics.map((topic, index) => (
              <div
                key={topic.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() =>
                    setActiveIndex(activeIndex === topic.id ? null : topic.id)
                  }
                  className="w-full flex justify-between items-center px-3 md:px-4 py-3 md:py-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm md:text-base font-medium text-gray-900 block">
                      {topic.title}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {topic.category}
                    </span>
                  </div>
                  <span className={`
                    text-gray-400 ml-2 flex-shrink-0 transition-transform
                    ${activeIndex === topic.id ? 'rotate-180' : ''}
                  `}>
                    ▼
                  </span>
                </button>

                {activeIndex === topic.id && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 text-sm md:text-base text-gray-600 border-t pt-3 whitespace-pre-wrap">
                    {topic.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No help topics found</p>
            <p className="text-gray-400 text-sm mt-2">Try a different search or category</p>
          </div>
        )}
      </div>

      {/* ===== Support Section ===== */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 mt-12 md:mt-16 mb-12 md:mb-16 text-center">
        <h3 className="text-lg md:text-xl font-semibold mb-2">Need more help?</h3>
        <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">
          Contact our support team and we'll get back to you shortly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <button className="bg-white border border-gray-200 px-4 md:px-6 py-3 rounded-lg text-sm md:text-base font-medium shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            Submit a Ticket
          </button>

          <button className="bg-white border border-gray-200 px-4 md:px-6 py-3 rounded-lg text-sm md:text-base font-medium shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Live Chat
          </button>

          <button className="bg-white border border-gray-200 px-4 md:px-6 py-3 rounded-lg text-sm md:text-base font-medium shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex items-center justify-center gap-2">
            <Mail className="w-5 h-5" />
            Email Us
          </button>
        </div>
      </div>
    </div>
  );
}
