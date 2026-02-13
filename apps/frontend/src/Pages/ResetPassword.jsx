import React from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const ResetPasswordScreen = () => {
  return (
    // Main Container - Light Gray Background, Centered Content
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      {/* Card Container - White, Rounded, Shadowed, Centered */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm p-8 relative">

        {/* Header (Back & Help Buttons) */}
        <div className="flex justify-between items-center mb-6">
          <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Title & Description - Centered Text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Reset password
        </h1>
        <p className="text-gray-600 mb-8 text-center leading-relaxed">
          Enter the email associated with your account and we'll send an email with instructions to reset your password.
        </p>

        {/* Form Section */}
        <div className="space-y-6">
          <div>
            {/* Label - Centered */}
            <label className="block text-gray-700 text-sm font-medium mb-2 text-center">
              Email address
            </label>
            {/* Input Field - Centered Text */}
            <input 
              type="email" 
              defaultValue="example@gmail.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#002D62] focus:border-transparent transition-all text-center"
            />
          </div>

          {/* Send Instructions Button - Navy Blue, Centered */}
          <button className="w-full bg-[#002D62] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition duration-200">
            Send Instructions
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordScreen;
