import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import NavyButton from "../../Components/Buttons";
import { useAuthStore } from "../../store/authStore";

export default function EmailVerification() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const refs = useRef([]);
  const navigate = useNavigate();

  const { verifyEmail, isLoading, error, user } = useAuthStore();

  const otpValue = useMemo(() => otp.join(""), [otp]);

  const focus = (i) => refs.current[i]?.focus();

  const setAt = (i, val) => {
    const next = [...otp];
    next[i] = val;
    setOtp(next);
  };

  function handleChange(i, value) {
    const v = value.replace(/\D/g, "");
    if (!v) {
      setAt(i, "");
      return;
    }

    const chars = v.split("").slice(0, 6 - i);
    const next = [...otp];
    chars.forEach((c, idx) => (next[i + idx] = c));
    setOtp(next);

    focus(Math.min(i + chars.length, 5));
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      if (otp[i]) {
        setAt(i, "");
        return;
      }
      if (i > 0) {
        focus(i - 1);
        setAt(i - 1, "");
      }
    }
    if (e.key === "ArrowLeft" && i > 0) focus(i - 1);
    if (e.key === "ArrowRight" && i < 5) focus(i + 1);
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();

    const chars = text.split("").slice(0, 6);
    const next = Array(6).fill("");
    chars.forEach((c, idx) => (next[idx] = c));
    setOtp(next);
    focus(Math.min(chars.length, 6) - 1);
  }

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    try {
      await verifyEmail(otpValue);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 sm:py-10">
      <div
        className="
         mx-auto w-full max-w-xl rounded-2xl bg-[#f4f4f4]
          px-10 py-12 text-center
          shadow-[0_18px_50px_rgba(2,6,23,0.10),0_2px_10px_rgba(2,6,23,0.06)]
          ring-1 ring-slate-100
        "
      >
        <div className="mx-auto w-full max-w-[640px] text-center">
          <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-slate-100">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <path
                d="M4 7.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5"
                stroke="#334155"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4.5 8l7.1 5.1a1.5 1.5 0 0 0 1.8 0L20.5 8"
                stroke="#334155"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Email Verification
          </h1>

          <p className="mt-3 text-sm sm:text-lg text-slate-500">
            Please enter the OTP received on your email
          </p>

          <p className="mt-3 text-sm sm:text-lg font-semibold text-slate-900 break-all">
            {user?.email || "your email"}
          </p>

          <div
            className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-2 sm:gap-4"
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="
                  h-12 w-12 sm:h-16 sm:w-16
                  rounded-xl border border-slate-200
                  bg-white text-center text-lg sm:text-2xl font-semibold text-slate-900
                  outline-none
                  focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                "
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          <div className="mt-6 sm:mt-7 text-sm sm:text-base text-slate-500">
            Didn&apos;t get code?{" "}
            <button
              type="button"
              className="font-semibold text-slate-900 hover:underline"
            >
              Resend Code
            </button>
          </div>

          {error && <p className="text-red-500 font-semibold mt-4">{error}</p>}

          <NavyButton
            onClick={handleVerify}
            disabled={otpValue.length < 6 || isLoading}
            className="mt-8 w-full flex justify-center items-center"
          >
            {isLoading ? <Loader className="animate-spin" size={24} /> : "Verify Email"}
          </NavyButton>
        </div>
      </div>
    </div>
  );
}


