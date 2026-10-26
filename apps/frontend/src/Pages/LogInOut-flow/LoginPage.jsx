import React, { useState } from "react";
import { Mail, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NavyButton from "../../Components/Buttons";
import logo from "../../assets/Gimsoi-AI.png";
import { useAuthStore } from "../../store/authStore";
import InfoIcon from "../../Components/InfoIcon";
import InformationModal from "../../Components/InformationModal";
import PasswordInput from "../../Components/PasswordEye";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const navigate = useNavigate();

  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password: "[REDACTED]" });
    try {
      await login(email, loginPassword);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-indigo-50 items-center justify-center p-4">





      {/* Main Card Container */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-[#f4f4f4] rounded-[40px] shadow-2xl overflow-hidden min-h-125">
        {/* Left Section (The Curve) */}

        <div className="md:w-5/12 bg-[#002D62] text-white flex flex-col justify-center items-center p-12 text-center rounded-br-[150px] md:rounded-br-[250px] relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#002D62] to-[#011f44] opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={logo}
              alt="Gimsoi AI"
              className="w-36 h-36 object-contain mb-6 rounded-full "
            />

            <h1 className="text-3xl font-bold mb-2 text-gray-100">
              Hello, Welcome!
            </h1>
            <p className="text-sm opacity-90 mb-8">Don't have an account?</p>
            <Link to="/signup">
              <button className="border-2 border-white rounded-xl px-10 py-2 hover:bg-white hover:text-[#002D62] transition-all font-semibold">
                Sign Up
              </button>
            </Link>
          </div>
        </div>

        {/* Right Section (The Form) */}

        <div className="md:w-7/12 bg-[#f4f4f4] flex flex-col justify-center relative items-center p-12">
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <InfoIcon
              onClick={() => setShowLoginInfo(true)}
              label="Login information"
            />
          </div>
          <div className="mb-8 flex items-center justify-center gap-3">
            <h2 className="text-3xl font-bold text-gray-800">Login</h2>
          </div>

          <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
            {/* Input with Icon on Right */}
            <div className="relative group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white rounded-lg px-4 py-3 pr-12 outline-none text-sm border-2 border-transparent focus:border-[#002D62]/20 transition-all shadow-sm"
                required
              />
              <Mail
                size={18}
                className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#002D62] transition-colors"
              />
            </div>

            <PasswordInput
              name="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
              className="bg-white rounded-lg px-4 py-3 pr-12 outline-none text-sm border-2 border-transparent focus:border-[#002D62]/20 transition-all shadow-sm"
              required
            />

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-[#002D62] font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="text-red-500 font-semibold mt-2 text-center text-sm">
                {error}
              </p>
            )}

            <NavyButton
              type="submit"
              className="w-full rounded-xl! shadow-lg flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin" size={24} />
              ) : (
                "Login"
              )}
            </NavyButton>
          </form>

          <div className="mt-8 text-center w-full max-w-sm">
            {/* <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase font-medium">or login with</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div> */}
            <div className="flex justify-center mt-2">
              {/* <button className="flex items-center gap-3 px-6 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-all shadow-sm group">
                <img
                  src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="text-[#002D62] font-bold text-sm">Google</span>
              </button> */}
            </div>
          </div>
        </div>
      </div>
      {/* Login information modal */}
      <InformationModal
        isOpen={showLoginInfo}
        onClose={() => setShowLoginInfo(false)}
        title="Login information"
      >
        <div className="text-sm">
          <p>Here is what you need to know to login:</p>
        </div>

        <div className="mt-4 rounded-lg bg-white p-1 text-black shadow-md">
          Enter your Email
          <p className="text-sm">
            Enter the email address registered with your Gimsoi account.
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-white p-1 text-black shadow-md">
          Forgot password?
          <p className="text-sm">
            Select "Forgot Password" on the login page to reset your password.
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-white p-1 text-black shadow-md">
          First-time login?
          <p className="text-sm">
            You may be prompted to change your password immediately for
            security.
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-white p-1 text-black shadow-md">
          Need help? Contact IT support
          <p className="text-sm">
            Email: info@gimsoi.com Phone: (123) 456-7890
          </p>
        </div>

        <div className="mt-6 rounded-lg bg-[#002D62] p-2 text-white shadow-md">
          <p className="text-sm">
            Security Tip: Keep your password private. Never share it with
            anyone. Enable 2MFA if available
          </p>
        </div>
      </InformationModal>
    </div>
  );
}

export default LoginPage;
