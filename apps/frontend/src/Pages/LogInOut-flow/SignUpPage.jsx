import React, { useState } from "react";
import { User, Lock, Mail, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NavyButton from "../../Components/Buttons";
import logo from "../../assets/Gimsoi-AI.png";
import { useAuthStore } from "../../store/authStore";
import InfoIcon from "../../Components/InfoIcon";
import InformationModal from "../../Components/InformationModal";
import PasswordInput from "../../Components/PasswordEye";

function SignUpPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const [showSignupInfo, setShowSignupInfo] = useState(false);

  const { signup, error, isLoading } = useAuthStore();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setFormError("");
    if (password !== confirmPassword) {
      setFormError("Passwords do not match!");
      return;
    }

    try {
      await signup(email, password, fullName);
      navigate("/verify-email");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-indigo-50 items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-[#f4f4f4] rounded-[40px] shadow-2xl overflow-hidden min-h-150">
        <div className="md:w-5/12 bg-[#002D62] text-white flex flex-col justify-center items-center p-12 text-center rounded-br-[150px] md:rounded-br-[250px] relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#002D62] to-[#011f44] opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={logo}
              alt="Gimsoi AI"
              className="w-36 h-36 object-contain mb-6 rounded-full "
            />
            <h1 className="text-3xl font-bold mb-2 text-white">
              Hello, Welcome!
            </h1>
            <p className="text-sm opacity-90 mb-8">Already have an account?</p>
            <Link to="/login">
              <button className="border-2 border-white rounded-xl px-10 py-2 hover:bg-white hover:text-[#002D62] transition-all font-semibold">
                Login
              </button>
            </Link>
          </div>
        </div>

        <div className="md:w-7/12 bg-[#f4f4f4] flex flex-col justify-center items-center p-12 relative">
          <div className="absolute top-5 right-5 z-10">
            <InfoIcon
              onClick={() => setShowSignupInfo(true)}
              label="Sign up information"
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Create Account
          </h2>

          <form onSubmit={handleSignUp} className="w-full max-w-sm space-y-4">
            <div className="relative group">
              <input
                type="email"
                placeholder="Email Address"
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

            <div className="relative group">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white rounded-lg px-4 py-3 pr-12 outline-none text-sm border-2 border-transparent focus:border-[#002D62]/20 transition-all shadow-sm"
                required
              />
              <User
                size={18}
                className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#002D62] transition-colors"
              />
            </div>
            {/* <div className="relative group">
                        <input
                            type="tel"
                            placeholder="+27123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white rounded-lg px-4 py-3 pr-12 outline-none text-sm border-2 border-transparent focus:border-[#002D62]/20 transition-all shadow-sm"
                            required
                        />
                            <Phone size={18} className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#002D62] transition-colors" />
                        </div> */}

            <PasswordInput
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="bg-white rounded-lg px-4 py-3 pr-12 outline-none text-sm border-2 border-transparent focus:border-[#002D62]/20 transition-all shadow-sm"
              required
            />

            <PasswordInput
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="bg-white rounded-lg px-4 py-3 pr-12 outline-none text-sm border-2 border-transparent focus:border-[#002D62]/20 transition-all shadow-sm"
              required
            />

            {formError && (
              <p className="text-red-500 font-semibold mt-2 text-center text-sm">
                {formError}
              </p>
            )}
            {error && (
              <p className="text-red-500 font-semibold mt-2 text-center text-sm">
                {error}
              </p>
            )}

            <NavyButton
              type="submit"
              className="w-full rounded-xl! shadow-lg mt-2 flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin" size={24} />
              ) : (
                "Sign Up"
              )}
            </NavyButton>
          </form>

          <div className="mt-8 text-center w-full max-w-sm">
            {/* <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase font-medium">or sign up with</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div> */}
            {/* <div className="flex justify-center mt-2">
                            <button className="flex items-center gap-3 px-6 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-all shadow-sm group">
                                <img
                                    src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                <span className="text-[#002D62] font-bold text-sm">Google</span>
                            </button>
                        </div> */}
          </div>
        </div>
      </div>

      {/* Sign Up information modal */}
      <InformationModal
        isOpen={showSignupInfo}
        onClose={() => setShowSignupInfo(false)}
        title="Sign-up information"
      >
        <div className="text-xs">
          <p>Here is what you need to know to sign up:</p>
        </div>

        <div className="mt-4 rounded-lg bg-white p-3 text-black shadow-md">
          Fill in your details
          <p className="text-sm">
            Enter your full name, email adress and create a strong password
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-white p-3 text-black shadow-md">
          Read and accept the Terms & Conditions and Privacy Policy.
          <p className="text-sm">
            Review the terms and conditions and privacy Policy before signing
            up.
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-white p-3 text-black shadow-md">
          Click Sign Up
          <p className="text-sm">
            Submit your details by clicking the sign up button to create your
            account
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-white p-3 text-black shadow-md">
          Verify your email address
          <p className="text-sm">
            Check your inbox for a verification email from us.
          </p>
        </div>

        <div className="mt-6 rounded-lg bg-[#002D62] p-4 text-white shadow-md">
          <p className="text-sm">
            You will recieve a confirmation email. click the ling in the email
            to activate your account
          </p>
        </div>
      </InformationModal>
    </div>
  );
}

export default SignUpPage;
