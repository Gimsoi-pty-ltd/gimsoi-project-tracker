import  { useMemo, useRef, useState } from "react";
import GimsoiAI from "../assets/Gimsoi AI.jpg";

export default function EmailVerificationOtp({
  email = "someone@example.com",
  length = 6,
  onVerify,
  onResend,
}) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const refs = useRef([]);

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

    const chars = v.split("").slice(0, length - i);
    const next = [...otp];
    chars.forEach((c, idx) => (next[i + idx] = c));
    setOtp(next);

    focus(Math.min(i + chars.length, length - 1));
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
    if (e.key === "ArrowRight" && i < length - 1) focus(i + 1);
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();

    const chars = text.split("").slice(0, length);
    const next = Array(length).fill("");
    chars.forEach((c, idx) => (next[idx] = c));
    setOtp(next);
    focus(Math.min(chars.length, length) - 1);
  }

  function submit() {
    if (otpValue.length !== length || otpValue.includes("")) return;
    onVerify?.(otpValue);
  }

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 sm:py-10">
      {/* Outer responsive card */}
      <div
        className="
         mx-auto w-full max-w-xl rounded-2xl bg-[#f4f4f4]
          px-10 py-12 text-center
          shadow-[0_18px_50px_rgba(2,6,23,0.10),0_2px_10px_rgba(2,6,23,0.06)]
          ring-1 ring-slate-100
        "
      >
        <div className="mx-auto w-full max-w-[640px] text-center">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-slate-100">
            <img
              src={emailIcon}
              alt="Email verification"
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
          </div>

          {/* Title */}
          <h1 className="mt-6 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Email Verification
          </h1>

          <p className="mt-3 text-sm sm:text-lg text-slate-500">
            Please enter the OTP received on the email
          </p>

          <p className="mt-3 text-sm sm:text-lg font-semibold text-slate-900 break-all">
            {email}
          </p>

          {/* OTP inputs (responsive + wrap-safe) */}
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

          {/* Resend */}
          <div className="mt-6 sm:mt-7 text-sm sm:text-base text-slate-500">
            Didn&apos;t get code?{" "}
            <button
              type="button"
              onClick={onResend}
              className="font-semibold text-slate-900 hover:underline"
            >
              Resend Code
            </button>
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={submit}
            disabled={otpValue.includes("")}
            className="
              inline-flex items-center justify-center
        min-w-[140px] px-10 py-3.5
        rounded-lg 
        bg-[#002D62] hover:bg-[#001f44] 
        text-white font-semibold tracking-wide
        shadow-md hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-200 
        active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#002D62]/30
            "
          >
            Verify Email
          </button>
        </div>
      </div>
    </div>
  );
}
import { useMemo, useRef, useState } from "react";
import NavyButton from "../Components/Buttons";

export default function EmailVerificationOtp({
  email = "someone@example.com",
  length = 6,
  onVerify,
  onResend,
}) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const refs = useRef([]);

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

    const chars = v.split("").slice(0, length - i);
    const next = [...otp];
    chars.forEach((c, idx) => (next[i + idx] = c));
    setOtp(next);

    focus(Math.min(i + chars.length, length - 1));
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
    if (e.key === "ArrowRight" && i < length - 1) focus(i + 1);
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();

    const chars = text.split("").slice(0, length);
    const next = Array(length).fill("");
    chars.forEach((c, idx) => (next[idx] = c));
    setOtp(next);
    focus(Math.min(chars.length, length) - 1);
  }

  function submit() {
    if (otpValue.length !== length || otpValue.includes("")) return;
    onVerify?.(otpValue);
  }

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 sm:py-10">
      {/* Outer responsive card */}
      <div
        className="
         mx-auto w-full max-w-xl rounded-2xl bg-[#f4f4f4]
          px-10 py-12 text-center
          shadow-[0_18px_50px_rgba(2,6,23,0.10),0_2px_10px_rgba(2,6,23,0.06)]
          ring-1 ring-slate-100
        "
      >
        <div className="mx-auto w-full max-w-[640px] text-center">
          {/* Icon */}
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

          {/* Title */}
          <h1 className="mt-6 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Email Verification
          </h1>

          <p className="mt-3 text-sm sm:text-lg text-slate-500">
            Please enter the OTP received on the email
          </p>

          <p className="mt-3 text-sm sm:text-lg font-semibold text-slate-900 break-all">
            {email}
          </p>

          {/* OTP inputs (responsive + wrap-safe) */}
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

          {/* Resend */}
          <div className="mt-6 sm:mt-7 text-sm sm:text-base text-slate-500">
            Didn&apos;t get code?{" "}
            <button
              type="button"
              onClick={onResend}
              className="font-semibold text-slate-900 hover:underline"
            >
              Resend Code
            </button>
          </div>

          {/* Button */}
          <NavyButton
            onClick={submit}
            disabled={otpValue.includes("")}
          >
            Verify Email
          </NavyButton>
        </div>
      </div>
    </div>
  );
}


