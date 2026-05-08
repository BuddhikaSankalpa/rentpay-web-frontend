import api from "../utils/api";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RegisterPage() {

    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [nic_number, setNicNumber] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [permanent_address, setPermanentAddress] = useState("");
    const [university, setUniversity] = useState("");
    const [faculty, setFaculty] = useState("");
    const [student_id, setStudentId] = useState("");
    const [guardian_name, setGuardianName] = useState("");
    const [guardian_phone, setGuardianPhone] = useState("");

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleRegister() {
        // Basic validations
        if (first_name.trim() === "") {
            toast.error("First name is required");
            return;
        }
        if (last_name.trim() === "") {
            toast.error("Last name is required");
            return;
        }
        if (email.trim() === "") {
            toast.error("Email is required");
            return;
        }
        if (password.trim() === "") {
            toast.error("Password is required");
            return;
        }

        setLoading(true);

        try {
            // Data go to the Backend
            await api.post("/users/", {
                firstName: first_name,
                lastName: last_name,
                email: email,
                password: password,
                phoneNumber: phone_number,
                nicNumber: nic_number,
                permanentAddress: permanent_address,
                university: university,
                faculty: faculty,
                studentId: student_id,
                guardianName: guardian_name,
                guardianPhone: guardian_phone
            });

            navigate("/login");
            toast.success("Registration successful!");

        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed! Please check your data and try again.");
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 flex justify-center items-center font-sans py-10">

            <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-200 rounded-2xl flex flex-col p-8 mx-4">
                
                <h1 className="w-full text-center text-3xl font-bold text-gray-800 mb-8">Register</h1>

                {/* Form Fields - Grid System (Columns 2k) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    
                    {/* First Name */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">First Name *</label>
                        <input 
                            name="first_name"
                            value={first_name}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="John" 
                        />
                    </div>

                    {/* Last Name */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">Last Name *</label>
                        <input 
                            name="last_name"
                            value={last_name}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="Doe" 
                        />
                    </div>

                    {/* Email */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">Email Address *</label>
                        <input 
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="email" placeholder="example@gmail.com" 
                        />
                    </div>

                    {/* Password */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">Password *</label>
                        <input 
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="password" placeholder="••••••••" 
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">Phone Number</label>
                        <input 
                            name="phone_number"
                            value={phone_number}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="07X XXX XXXX" 
                        />
                    </div>

                    {/* NIC Number */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">NIC Number</label>
                        <input 
                            name="nic_number"
                            value={nic_number}
                            onChange={(e) => setNicNumber(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="2000XXXXXXX" 
                        />
                    </div>

                    {/* Permanent Address */}
                    <div className="w-full md:col-span-2">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">Permanent Address</label>
                        <input 
                            name="permanent_address"
                            value={permanent_address}
                            onChange={(e) => setPermanentAddress(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="123, Main Street, City" 
                        />
                    </div>

                    {/* University */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">University</label>
                        <input 
                            name="university"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="UCSC" 
                        />
                    </div>

                    {/* Faculty */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">Faculty</label>
                        <input 
                            name="faculty"
                            value={faculty}
                            onChange={(e) => setFaculty(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="Computing" 
                        />
                    </div>

                    {/* Student ID */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">Student ID</label>
                        <input 
                            name="student_id"
                            value={student_id}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="STU-XXXX" 
                        />
                    </div>

                    <div className="hidden md:block"></div> 

                    {/* Guardian Name */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">Guardian Name</label>
                        <input 
                            name="guardian_name"
                            value={guardian_name}
                            onChange={(e) => setGuardianName(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="Guardian Name" 
                        />
                    </div>

                    {/* Guardian Phone */}
                    <div className="w-full">
                        <label className="text-gray-700 text-sm font-medium mb-2 block ml-1">Guardian Phone</label>
                        <input 
                            name="guardian_phone"
                            value={guardian_phone}
                            onChange={(e) => setGuardianPhone(e.target.value)}
                            className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            type="text" placeholder="07X XXX XXXX" 
                        />
                    </div>
                </div>

                {/* Register Button & Login Link */}
                <div className="w-full flex flex-col gap-4">
                    <button 
                        className={`w-full h-[50px] rounded-lg font-bold text-lg transition-all duration-300 flex justify-center items-center gap-2
                        ${loading 
                            ? "bg-gray-400 cursor-not-allowed opacity-70 text-white" 
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95"
                        }`}
                        disabled={loading}
                        onClick={handleRegister}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>

                    <p className="text-gray-600 text-sm text-center mt-2">
                        Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline ml-1">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}