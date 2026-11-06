import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordInput({
  name = "password",
  placeholder = "Password",
  value,
  onChange,
  required = true,
  autoComplete = "current-password",
  className = ""
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full group">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className={`w-full ${className}`}
      />

      <button
        type="button"
        onClick={() => setShowPassword((previous) => !previous)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#002D62] transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
      >
        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}

export default PasswordInput;
