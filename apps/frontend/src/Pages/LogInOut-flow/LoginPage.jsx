
import React, { useState } from "react";
import { EyeClosed, Mail, Loader, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NavyButton from "../../Components/Buttons";
import logo from "../../assets/Gimsoi-AI.png";
import { useAuthStore } from "../../store/authStore";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginInfo, setShowLoginInfo] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(email, loginPassword);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-indigo-50 p-4">
      {/* Login card and information panel positioning */}
      <div className="relative w-full max-w-4xl">

        {/* Information icon */}
        <InfoIcon
        size={20}
        onClick={() => setShowLoginInfo((prev) => !prev)}
        className="absolute top-[175px] right-[225px] z-50 cursor-pointer text-gray-500 hover:text-blue-400"
        aria-label="Show login information"
        role="button"
        tabIndex={0}
      />


        {/* Login information panel */}
        {showLoginInfo && (
        <div className="fixed right-1 top-40 z-50 w-80 max-w-[calc(100vw-2.5rem)] rounded-xl bg-gray-100 p-5 text-gray-800 shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">Login information</h2>
          <div className="text-xs">
            <p>Here is what you need to know to login:</p>
          </div>

          <div className="mt-4 bg-white text-black p-1 rounded-lg shadow-md">
            Use your assigned username
            <p className="text-xs">Typically your work email or employee ID</p>
          </div>

          <div className="mt-4 bg-white text-black p-1 rounded-lg shadow-md">
            Forgot password?
            <p className="text-xs">Typically your work email or employee ID</p>
          </div>

          <div className="mt-4 bg-white text-black p-1 rounded-lg shadow-md">
            First-time login?
            <p className="text-xs">Typically your work email or employee ID</p>
          </div>

          <div className="mt-4 bg-white text-black p-1 rounded-lg shadow-md">
            Need help? Contact IT support
            <p className="text-xs">Typically your work email or employee ID</p>
          </div>

          <div className="mt-16 bg-navyblue text-black p-1 rounded-lg shadow-md">
            <p className="text-xs">
              Security Tip: Keep your password private. Never share it with
              anyone. Enable 2MFA if available
            </p>
          </div>
        </div>
      )}

        {/* Main login card */}
        <div className="flex min-h-125 flex-col overflow-hidden rounded-[40px] bg-[#f4f4f4] shadow-2xl md:flex-row">

          {/* Left section */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-br-[150px] bg-[#002D62] p-12 text-center text-white md:w-5/12 md:rounded-br-[250px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#002D62] to-[#011f44] opacity-50" />

            <div className="relative z-10 flex flex-col items-center">
              <img
                src={logo}
                alt="Gimsoi AI"
                className="mb-6 h-36 w-36 rounded-full object-contain"
              />

              <h1 className="mb-2 text-3xl font-bold text-gray-100">
                Hello, Welcome!
              </h1>

              <p className="mb-8 text-sm opacity-90">
                Don't have an account?
              </p>

              <Link to="/signup">
                <button className="rounded-xl border-2 border-white px-10 py-2 font-semibold transition-all hover:bg-white hover:text-[#002D62]">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>

          {/* Right section: login form */}
          <div className="flex flex-col items-center justify-center bg-[#f4f4f4] p-12 md:w-7/12">
            <h2 className="mb-8 text-3xl font-bold text-gray-800">
              Login
            </h2>

            <form
              onSubmit={handleLogin}
              className="w-full max-w-sm space-y-4"
            >
              {/* Email input */}
              <div className="group relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-lg border-2 border-transparent bg-white px-4 py-3 pr-12 text-sm shadow-sm outline-none transition-all focus:border-[#002D62]/20"
                  required
                />

                <Mail
                  size={18}
                  aria-hidden="true"
                  className="absolute right-4 top-3.5 text-gray-400 transition-colors group-focus-within:text-[#002D62]"
                />
              </div>

              {/* Password input */}
              <div className="group relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border-2 border-transparent bg-white px-4 py-3 pr-12 text-sm shadow-sm outline-none transition-all focus:border-[#002D62]/20"
                  required
                />

                <EyeClosed
                  size={18}
                  aria-hidden="true"
                  className="absolute right-4 top-3.5 text-gray-400 transition-colors group-focus-within:text-[#002D62]"
                />
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#002D62] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login error */}
              {error && (
                <p
                  role="alert"
                  className="mt-2 text-center text-sm font-semibold text-red-500"
                >
                  {error}
                </p>
              )}

              {/* Submit button */}
              <NavyButton
                type="submit"
                className="flex w-full items-center justify-center rounded-xl! shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin" size={24} />
                ) : (
                  "Login"
                )}
              </NavyButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
