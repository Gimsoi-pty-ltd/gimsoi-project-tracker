import React from 'react';
import { ArrowLeft, Mail, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavyButton from '../Components/Buttons';

const ForgotEmailPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white">
      {/* Box background set to #F4F4F4 */}
      <div className="bg-[#F4F4F4] w-full max-w-[450px] rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100">

        <Link to="/login" className="flex items-center gap-2 mb-8 text-[#002D62] hover:text-[#001f44] transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back to Login</span>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-black mb-2">Enter Email Address</h1>
          <p className="text-black font-medium">Edit your personal information</p>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <input
              type="email"
              placeholder="example@gmail.com"
              className="w-full px-6 py-4 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]/20 text-black placeholder-gray-400 bg-white transition-all shadow-sm"
              required
            />
            <Mail size={18} className="absolute right-6 top-4.5 text-gray-400 group-focus-within:text-[#002D62] transition-colors" />
          </div>

          <div className="text-center">
            <a href="#" className="text-black font-bold text-sm hover:underline">
              Back to sign in
            </a>
          </div>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400"></div>
            </div>
            <span className="relative px-4 bg-[#F4F4F4] text-black font-bold text-sm uppercase">or</span>
          </div>

          {/* Single Google Option */}
          <div className="flex justify-center">
            <button className="flex items-center gap-3 px-6 py-3 rounded-full border border-gray-400 bg-white hover:bg-gray-50 transition-colors">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-black font-bold text-sm">Google</span>
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-black text-sm mb-4">Do you have an account?</p>
            <NavyButton>Sign up</NavyButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotEmailPage;
