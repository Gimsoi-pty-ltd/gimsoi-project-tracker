import { useState } from "react";
import SearchIcon from "../../assets/searchicon.png";
import AccountIcon from "../../assets/accounticon.png";
import TasksIcon from "../../assets/tasksicon.png";
import SettingsIcon from "../../assets/settingsicon.png";
 

export default function HelpSupport() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Go to Settings → Security → Reset Password.",
    },
    {
      question: "How do I update my profile?",
      answer: "Navigate to Account Settings and update your profile information.",
    },
    {
      question: "How do I create a task?",
      answer: "Go to Tasks and click on 'Create New Task'.",
    },
  ];

  const categories = [
    {
      name: "Account",
      icon: AccountIcon,
    },
    {
      name: "Tasks",
      icon: TasksIcon,
    },
    {
      name: "Settings",
      icon: SettingsIcon,
    },
   
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* ===== Help Header Section ===== */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-gray-500 mb-6">
            Find answers to common questions or contact support.
          </p>

          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <img
              src={SearchIcon}
              alt="Search"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60"
            />
          </div>
        </div>
      </div>

      {/* ===== FAQ Section ===== */}
      <div className="max-w-3xl mx-auto px-6 mt-10">
        <h2 className="text-lg font-semibold mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border rounded-md shadow-sm"
            >
              <button
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                className="w-full flex justify-between items-center px-4 py-3 text-left"
              >
                <span>{faq.question}</span>
                <span className="text-gray-500">
                  {activeIndex === index ? "−" : "›"}
                </span>
              </button>

              {activeIndex === index && (
                <div className="px-4 pb-4 text-sm text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Help Categories ===== */}
      <div className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-xl font-semibold mb-6">Help Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((item) => (
            <div
              key={item.name}
              className="bg-gray-100 border rounded-lg px-4 py-3 flex flex-row items-center justify-start gap-3 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <img
                src={item.icon}
                alt={item.name}
                className="w-6 h-6"
              />
              <span className="text-sm font-medium">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Support Section ===== */}
      <div className="max-w-3xl mx-auto px-6 mt-12 mb-16 text-center">
        <h3 className="text-lg font-semibold">Need more help?</h3>
        <p className="text-gray-500 mb-6">
          Contact our support team
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white border px-6 py-2 rounded-md shadow-sm hover:bg-blue-900 hover:text-white hover:scale-105 transition">
            Submit a Ticket
          </button>

          <button className="bg-white border px-6 py-2 rounded-md shadow-sm hover:bg-blue-900 hover:text-white hover:scale-105 transition">
            Live Chat
          </button>

          <button className="bg-white border px-10 py-2 rounded-md shadow-sm hover:bg-blue-900 hover:text-white hover:scale-105 transition">
            Email Us
          </button>
        </div>
        <br />
        <br />
      </div>
    </div>
  );
}