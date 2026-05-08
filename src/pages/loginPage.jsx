import api from "../utils/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/loader"; 

import { useState } from "react";
import { MdEmail } from "react-icons/md";
import { BiKey } from "react-icons/bi";
import { BsGoogle } from "react-icons/bs";

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    async function handleLogin(){
        setLoading(true)

        try{
            const res = await api.post("/users/login",{
                email : email,
                password : password
            })
            
            // 🔴 මෙන්න මේක අලුතින් දැම්මා! මේකෙන් පෙනෙයි Backend එකෙන් මොනවද එවන්නේ කියලා.
            console.log("Login Response Data: ", res.data);

            toast.success(res.data.message || "Login Successful!")
            
            localStorage.setItem("token" , res.data.token)
            localStorage.setItem("userEmail", email)

            // 🔴 Backend එකෙන් එවන්න පුළුවන් හැම විදිහක්ම මෙතන චෙක් කරනවා
            const isAdminUser = res.data.user?.is_admin || res.data.is_admin || res.data.user?.isAdmin || res.data.isAdmin; 

            if(isAdminUser){
                console.log("Admin කෙනෙක් ලොග් වුණා!"); // Debugging
                localStorage.setItem("userRole", "admin")
                navigate("/admin")
            } else {
                console.log("ළමයෙක් ලොග් වුණා!"); // Debugging
                localStorage.setItem("userRole", "student")
                navigate("/")
            }

        } catch(err){
            toast.error(err?.response?.data?.message || "Login failed")
        } finally {
            setLoading(false) 
        }
    }

    return (
        <div className="w-full h-screen bg-gray-50 flex justify-center items-center font-sans">

            <div className="w-[400px] bg-white shadow-lg border border-gray-200 rounded-2xl flex flex-col p-8">
                
                <h1 className="w-full text-center text-3xl font-bold text-gray-800 mb-8">Login</h1>

                {/* Email Field */}
                <div className="w-full mb-5">
                    <label className="text-gray-700 text-sm font-medium flex items-center gap-2 mb-2 ml-1">
                        <MdEmail className="text-lg text-gray-500" /> Email Address
                    </label>
                    <input 
                        className="w-full h-[45px] rounded-lg px-4 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                        type="email" 
                        placeholder="example@gmail.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password Field */}
                <div className="w-full mb-3">
                    <label className="text-gray-700 text-sm font-medium flex items-center gap-2 mb-2 ml-1">
                        <BiKey className="text-lg text-gray-500" /> Password
                    </label>
                    <input 
                        className="w-full h-[45px] rounded-lg px-4 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                        type="password" 
                        placeholder="•••••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="w-full flex flex-col gap-4">
                    <Link to="/forget-password" underline="none" className="text-gray-500 text-sm text-right hover:text-blue-600 transition-colors">
                        Forget password?
                    </Link>

                    {/* Button eke `disabled={loading}` nisa apahu press karanna ba */}
                    <button 
                        className={`w-full h-[50px] rounded-lg font-bold text-lg transition-all duration-300 flex justify-center items-center gap-2
                        ${loading 
                            ? "bg-gray-400 cursor-not-allowed opacity-70 text-white" 
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95"
                        }`}
                        disabled={loading}
                        onClick={handleLogin}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>

                    <p className="text-gray-600 text-sm text-center mt-2">
                        Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:underline ml-1">Register</Link>
                    </p>
                </div>

                <div className="flex items-center my-6">
                    <div className="flex-1 h-[1px] bg-gray-200"></div>
                    <span className="px-3 text-gray-400 text-xs uppercase font-medium">OR</span>
                    <div className="flex-1 h-[1px] bg-gray-200"></div>
                </div>

                <button className="w-full h-[50px] bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg flex justify-center items-center gap-3 font-semibold shadow-sm active:scale-95 transition-all duration-300 mt-auto">
                    <BsGoogle className="text-red-500 text-lg" />
                    <span>Sign In with Google</span>
                </button>
            </div>

            {loading && <Loader />}
        </div>
    );
}