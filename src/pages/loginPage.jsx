import api from "../utils/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/loader"; 

import { useState } from "react";
import { MdEmail } from "react-icons/md";
import { BiKey } from "react-icons/bi";
import { BsGoogle } from "react-icons/bs";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleLogin(){
        setLoading(true);
        try{
            const res = await api.post("/users/login",{
                email : email,
                password : password
            });
            console.log("Login Response Data: ", res.data);
            toast.success(res.data.message || "Login Successful!");
            localStorage.setItem("token" , res.data.token);
            localStorage.setItem("userEmail", email);
            const isAdminUser = res.data.user?.is_admin || res.data.is_admin || res.data.user?.isAdmin || res.data.isAdmin; 
            if(isAdminUser){
                localStorage.setItem("userRole", "admin");
                navigate("/admin");
            } else {
                localStorage.setItem("userRole", "student");
                navigate("/");
            }
        } catch(err){
            toast.error(err?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false); 
        }
    }

    const handleGoogleSuccess = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const res = await api.post("/users/google", {
                    access_token: tokenResponse.access_token
                });
                toast.success(res.data.message || "Google Login Successful!");
                localStorage.setItem("token" , res.data.token);
                localStorage.setItem("userEmail", res.data.user.email);
                const isAdminUser = res.data.user?.is_admin || res.data.user?.isAdmin; 
                if(isAdminUser){
                    localStorage.setItem("userRole", "admin");
                    navigate("/admin");
                } else {
                    localStorage.setItem("userRole", "student");
                    navigate("/");
                }
            } catch(err) {
                toast.error(err?.response?.data?.message || "Google Login failed");
            } finally {
                setLoading(false);
            }
        },
        onError: () => toast.error("Google Login failed")
    });

    return (
        <div className="relative w-full h-screen flex justify-center items-center font-sans overflow-hidden">
            
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('/bgPicture.jpg')] bg-cover bg-center bg-no-repeat blur-[6px] scale-105"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15] pointer-events-none"></div>

            {/* Main Container - Two Panel Layout */}
            <div className="relative z-10 w-full max-w-[900px] flex rounded-3xl overflow-hidden shadow-[0_8px_64px_0_rgba(0,0,0,0.6)] border border-white/[0.06] mx-4">

                {/* ── LEFT PANEL: Login Form ── */}
                <div className="w-full md:w-[420px] flex-shrink-0 bg-[#0a0815]/70 backdrop-blur-xl flex flex-col p-10">
                    
                    <div className="text-center mb-10">
                        <img src="/logo.png" alt="Nevermore Logo" className="h-16 mx-auto mb-4 opacity-90" 
                             onError={(e) => e.target.style.display = 'none'} />
                        <h1 className="text-3xl font-serif text-white tracking-wide">Welcome Back</h1>
                        <p className="text-gray-500 text-xs tracking-widest uppercase mt-2">Enter the shadows</p>
                    </div>

                    {/* Email Field */}
                    <div className="w-full mb-6">
                        <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-2 ml-1 block">
                            Email Address
                        </label>
                        <div className="relative">
                            <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
                            <input 
                                className="w-full h-[50px] bg-[#161121]/50 border border-white/[0.05] rounded-xl pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-[#A58ED4] focus:bg-[#161121] focus:ring-1 focus:ring-[#A58ED4]/50 transition-all" 
                                type="email" 
                                placeholder="wednesday@nevermore.edu" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="w-full mb-4">
                        <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-2 ml-1 block">
                            Password
                        </label>
                        <div className="relative">
                            <BiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
                            <input 
                                className="w-full h-[50px] bg-[#161121]/50 border border-white/[0.05] rounded-xl pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-[#A58ED4] focus:bg-[#161121] focus:ring-1 focus:ring-[#A58ED4]/50 transition-all" 
                                type="password" 
                                placeholder="•••••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-6 mt-2">
                        <Link to="/forget-password" className="text-gray-500 text-xs text-right hover:text-[#A58ED4] transition-colors">
                            Lost your key?
                        </Link>

                        <button 
                            className={`w-full h-[50px] rounded-xl text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 flex justify-center items-center gap-3
                            ${loading 
                                ? "bg-white/10 cursor-not-allowed opacity-70 text-gray-400 border border-white/10" 
                                : "bg-gradient-to-r from-[#4A235A] to-[#7B1FA2] hover:from-[#5B2C6F] hover:to-[#8E24AA] text-white shadow-lg shadow-purple-900/20 active:scale-[0.98]"
                            }`}
                            disabled={loading}
                            onClick={handleLogin}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        <p className="text-gray-500 text-xs text-center mt-2">
                            New to Nevermore? <Link to="/register" className="font-bold text-[#A58ED4] hover:text-white transition-colors ml-1 uppercase tracking-wider">Enroll Now</Link>
                        </p>
                    </div>

                    <div className="flex items-center my-6 opacity-50">
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-gray-500"></div>
                        <span className="px-4 text-gray-400 text-[10px] uppercase font-bold tracking-widest">OR</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-gray-500"></div>
                    </div>

                    <div className="w-full flex justify-center mt-auto">
                        <button
                            onClick={() => handleGoogleSuccess()}
                            disabled={loading}
                            className="flex items-center justify-center w-full max-w-[420px] h-[50px] rounded-xl border border-[#3b354b] hover:border-[#675f7e] bg-[#1a1525] hover:bg-[#251e33] transition-all text-gray-200 font-bold text-[11px] tracking-[0.15em] uppercase gap-3 shadow-[0_2px_10px_0_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <BsGoogle className="text-white text-lg" />
                            Continue with Google
                        </button>
                    </div>
                </div>

                {/* ── RIGHT PANEL: Wednesday-themed Info Panel ── */}
                <div className="hidden md:flex flex-col flex-1 relative bg-[#07040f]/80 backdrop-blur-2xl overflow-hidden border-l border-white/[0.05]">
                    
                    {/* Decorative corner ravens / gothic flourish */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {/* Top decorative bar */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7B1FA2]/60 to-transparent"></div>
                        {/* Subtle grid texture */}
                        <div className="absolute inset-0 opacity-[0.04]"
                             style={{
                                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(165,142,212,0.3) 39px, rgba(165,142,212,0.3) 40px),
                                                  repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(165,142,212,0.3) 39px, rgba(165,142,212,0.3) 40px)`
                             }}>
                        </div>
                        {/* Radial glow center */}
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-900/20 blur-[80px]"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full p-10 justify-between">
                        
                        {/* Top: School crest area */}
                        <div className="flex flex-col items-center text-center">
                            {/* Gothic divider */}
                            <div className="flex items-center gap-3 mb-8 w-full">
                                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#4A235A]/60"></div>
                                <span className="text-[#7B1FA2]/80 text-xs tracking-[0.4em] uppercase font-bold">Nevermore boarding</span>
                                <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#4A235A]/60"></div>
                            </div>

                            {/* Main quote */}
                            <blockquote className="font-serif text-white/90 text-2xl leading-relaxed mt-50 tracking-wide">
                                "Normal is an illusion.<br/>
                                <span className="text-[#A58ED4]">What is normal for the spider</span><br/>
                                is chaos for the fly."
                            </blockquote>
                            <cite className="text-gray-500 text-[11px] tracking-widest uppercase not-italic">— Wednesday Addams</cite>
                        </div>

                      
                        {/* Bottom: School motto */}
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center gap-3 mb-4 w-full">
                                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#4A235A]/60"></div>
                                <span className="text-[#4A235A] text-lg">✦</span>
                                <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#4A235A]/60"></div>
                            </div>
                            <p className="text-[#7B1FA2]/70 text-[10px] tracking-[0.5em] uppercase font-bold">
                                Nevermore Academy
                            </p>
                            <p className="text-gray-600 text-[9px] tracking-[0.3em] uppercase mt-1">
                                Jericho, Vermont · Est. 1885
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {loading && <Loader />}
        </div>
    );
}