import api from "../utils/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/loader"; 

import { useState } from "react";
import { MdEmail } from "react-icons/md";
import { BiKey } from "react-icons/bi";
import { BsGoogle } from "react-icons/bs";

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
                console.log("Admin කෙනෙක් ලොග් වුණා!");
                localStorage.setItem("userRole", "admin");
                navigate("/admin");
            } else {
                console.log("ළමයෙක් ලොග් වුණා!"); 
                localStorage.setItem("userRole", "student");
                navigate("/");
            }

        } catch(err){
            toast.error(err?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false); 
        }
    }

    return (
        <div className="relative w-full h-screen bg-[#070510] flex justify-center items-center font-sans overflow-hidden">
            
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-[420px] bg-[#0a0815]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-3xl flex flex-col p-10 mx-4">
                
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
                    <Link to="/forget-password" underline="none" className="text-gray-500 text-xs text-right hover:text-[#A58ED4] transition-colors">
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

                <button className="w-full h-[50px] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-gray-300 rounded-xl flex justify-center items-center gap-3 text-[11px] font-bold tracking-widest uppercase active:scale-[0.98] transition-all duration-300 mt-auto">
                    <BsGoogle className="text-lg" />
                    <span>Continue with Google</span>
                </button>
            </div>

            {loading && <Loader />}
        </div>
    );
}