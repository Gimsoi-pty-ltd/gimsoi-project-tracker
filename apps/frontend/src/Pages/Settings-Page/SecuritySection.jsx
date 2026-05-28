// src/Pages/Settings Page/SecuritySection.jsx
import { useState } from "react";
import { resourceAPI } from "../../api/api";

export default function SecuritySection() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await resourceAPI.patch("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 md:p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#001f44]/10 text-[#001f44] flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.98 11.98 0 0 1-3.643 2.183 11.987 11.987 0 0 1-3.765.899.75.75 0 0 0-.699.75v4.805a11.25 11.25 0 0 0 6.863 10.356l1.435.616a.75.75 0 0 0 .65 0l1.435-.616a11.25 11.25 0 0 0 6.863-10.356V6.002a.75.75 0 0 0-.699-.75 11.987 11.987 0 0 1-3.765-.9 11.98 11.98 0 0 1-3.643-2.182Z" clipRule="evenodd" />
            </svg>
          </span>
          <h2 className="text-base font-semibold text-[#001f44]">Security</h2>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">Password</p>
            <p className="text-xs text-gray-400">Keep your account secure</p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex-shrink-0 px-4 py-2 rounded-md text-white text-sm font-semibold shadow-sm bg-[#001f44] hover:bg-[#002d62] focus:outline-none focus:ring-2 focus:ring-[#001f44] focus:ring-offset-2 transition-colors"
          >
            Change
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-700 min-w-0 truncate">Two-Factor Authentication</p>
          <button className="flex-shrink-0 px-4 py-2 rounded-md text-white text-sm font-semibold shadow-sm bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
            Enabled
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.98 11.98 0 0 1-3.643 2.183 11.987 11.987 0 0 1-3.765.899.75.75 0 0 0-.699.75v4.805a11.25 11.25 0 0 0 6.863 10.356l1.435.616a.75.75 0 0 0 .65 0l1.435-.616a11.25 11.25 0 0 0 6.863-10.356V6.002a.75.75 0 0 0-.699-.75 11.987 11.987 0 0 1-3.765-.9 11.98 11.98 0 0 1-3.643-2.182Z" clipRule="evenodd" />
                </svg>
              </span>
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
            </div>

            {passwordSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-medium">✓ Password changed successfully!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm Password"}
                      </label>
                      <input
                        type="password"
                        name={field}
                        value={passwordForm[field]}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm">{passwordError}</p>
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#001f44] text-white rounded-md text-sm font-semibold hover:bg-[#002d62] transition-colors disabled:opacity-60"
                  >
                    {isLoading ? "Saving..." : "Change Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}