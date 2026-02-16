import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, Lock } from "lucide-react";
import NavyButton from "../Components/Buttons";
import { useAuthStore } from "../store/authStore";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, error, isLoading, message } = useAuthStore();

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await resetPassword(token, password);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm p-8 relative">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Reset Password
        </h1>
        <p className="text-gray-600 mb-8 text-center leading-relaxed">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#002D62] text-center"
              required
            />
          </div>
          <div className="relative group">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#002D62] text-center"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm mb-4 text-center">{message}</p>}

          <NavyButton
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center"
          >
            {isLoading ? <Loader className="animate-spin" size={24} /> : "Reset Password"}
          </NavyButton>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
