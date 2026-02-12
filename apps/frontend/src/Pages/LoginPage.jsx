import React, { useState } from 'react';
import { User, Lock, Mail, Github, Facebook, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavyButton from '../Components/Buttons';
import logo from '../assets/Gimsoi AI.jpg';

function LoginPage() {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { loginIdentifier, loginPassword });
        // Add authentication logic here
    };

    return (
        <div className="flex min-h-screen bg-indigo-50 items-center justify-center p-4">
            {/* Main Card Container */}
            <div className="flex flex-col md:flex-row w-full max-w-4xl bg-[#f4f4f4] rounded-[40px] shadow-2xl overflow-hidden min-h-[500px]">

                {/* Left Section (The Curve) */}
                <div className="md:w-5/12 bg-[#002D62] text-white flex flex-col justify-center items-center p-12 text-center rounded-br-[150px] md:rounded-br-[250px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#002D62] to-[#011f44] opacity-50"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <img src={logo} alt="Gimsoi AI" className="w-36 h-36 object-contain mb-6 rounded-full " />
                        <h1 className="text-3xl font-bold mb-2">Hello, Welcome!</h1>
                        <p className="text-sm opacity-90 mb-8">Don't have an account?</p>
                        <Link to="/signup">
                            <button className="border-2 border-white rounded-xl px-10 py-2 hover:bg-white hover:text-[#002D62] transition-all font-semibold">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right Section (The Form) */}
                <div className="md:w-7/12 bg-[#f4f4f4] flex flex-col justify-center items-center p-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Login</h2>

                    <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                        {/* Input with Icon on Right */}
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Username or Email"
                                value={loginIdentifier}
                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                className="w-full bg-white rounded-lg px-4 py-3 pr-12 outline-none text-sm border-2 border-transparent focus:border-[#002D62]/20 transition-all shadow-sm"
                                required
                            />
                            {loginIdentifier.includes('gmail') ? (
                                <Mail size={18} className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#002D62] transition-colors" />
                            ) : (
                                <User size={18} className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#002D62] transition-colors" />
                            )}
                        </div>

                        <div className="relative group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-white rounded-lg px-4 py-3 pr-12 outline-none text-sm border-2 border-transparent focus:border-[#002D62]/20 transition-all shadow-sm"
                                required
                            />
                            <Lock size={18} className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#002D62] transition-colors" />
                        </div>

                        <div className="text-right">
                            <a href="#" className="text-xs text-[#002D62] font-semibold hover:underline">Forgot Password?</a>
                        </div>

                        <NavyButton
                            type="submit"
                            className="w-full !rounded-xl shadow-lg"
                        >
                            Login
                        </NavyButton>
                    </form>

                    <div className="mt-8 text-center w-full max-w-sm">
                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase font-medium">or login with</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                        <div className="flex justify-center mt-2">
                            <button className="flex items-center gap-3 px-6 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-all shadow-sm group">
                                <img
                                    src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                <span className="text-[#002D62] font-bold text-sm">Google</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
