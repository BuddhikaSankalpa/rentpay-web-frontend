import api from "../utils/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdSchool, MdBadge, MdVpnKey } from "react-icons/md";

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
        if (first_name.trim() === "") return toast.error("First name is required");
        if (last_name.trim() === "") return toast.error("Last name is required");
        if (email.trim() === "") return toast.error("Email is required");
        if (password.trim() === "") return toast.error("Password is required");

        setLoading(true);

        try {
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
            toast.success("Registration successful! Welcome to Nevermore.");

        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed! Please check your data.");
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const InputField = ({ icon: Icon, label, ...props }) => (
        <div className="w-full">
            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-bold mb-2 ml-1 block">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />}
                <input 
                    className={`w-full h-[50px] bg-[#161121]/50 border border-white/[0.05] rounded-xl ${Icon ? 'pl-12' : 'pl-4'} pr-4 text-white placeholder-gray-600 outline-none focus:border-[#A58ED4] focus:bg-[#161121] focus:ring-1 focus:ring-[#A58ED4]/50 transition-all`}
                    {...props} 
                />
            </div>
        </div>
    );

    return (
        <div className="relative w-full min-h-screen bg-[#070510] flex justify-center items-center font-sans py-12 px-4 overflow-hidden">
            
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none fixed"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none fixed"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15] pointer-events-none fixed"></div>

            <div className="relative z-10 w-full max-w-4xl bg-[#0a0815]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-3xl flex flex-col p-8 md:p-12">
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif text-white tracking-wide">Enrollment Form</h1>
                    <p className="text-[#A58ED4] text-xs tracking-widest uppercase mt-3">Join the Nevermore Boarding</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                    
                    <div className="md:col-span-2 border-b border-white/[0.05] pb-2 mb-2">
                        <h2 className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase">Personal Details</h2>
                    </div>

                    <InputField icon={MdPerson} label="First Name *" type="text" placeholder="Wednesday" value={first_name} onChange={(e) => setFirstName(e.target.value)} />
                    <InputField icon={MdPerson} label="Last Name *" type="text" placeholder="Addams" value={last_name} onChange={(e) => setLastName(e.target.value)} />
                    <InputField icon={MdEmail} label="Email Address *" type="email" placeholder="wednesday@nevermore.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField icon={MdVpnKey} label="Password *" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <InputField icon={MdPhone} label="Phone Number" type="text" placeholder="07X XXX XXXX" value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} />
                    <InputField icon={MdBadge} label="NIC Number" type="text" placeholder="2000XXXXXXX" value={nic_number} onChange={(e) => setNicNumber(e.target.value)} />
                    
                    <div className="w-full md:col-span-2">
                        <InputField icon={MdLocationOn} label="Permanent Address" type="text" placeholder="123, Main Street, City" value={permanent_address} onChange={(e) => setPermanentAddress(e.target.value)} />
                    </div>

                    <div className="md:col-span-2 border-b border-white/[0.05] pb-2 mt-4 mb-2">
                        <h2 className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase">Academic & Guardian Details</h2>
                    </div>

                    <InputField icon={MdSchool} label="University" type="text" placeholder="Nevermore Academy" value={university} onChange={(e) => setUniversity(e.target.value)} />
                    <InputField icon={MdSchool} label="Faculty" type="text" placeholder="Outcasts" value={faculty} onChange={(e) => setFaculty(e.target.value)} />
                    <InputField icon={MdBadge} label="Student ID" type="text" placeholder="NBRD-XXXX" value={student_id} onChange={(e) => setStudentId(e.target.value)} />
                    <div className="hidden md:block"></div> 

                    <InputField icon={MdPerson} label="Guardian Name" type="text" placeholder="Gomez Addams" value={guardian_name} onChange={(e) => setGuardianName(e.target.value)} />
                    <InputField icon={MdPhone} label="Guardian Phone" type="text" placeholder="07X XXX XXXX" value={guardian_phone} onChange={(e) => setGuardianPhone(e.target.value)} />
                </div>

                <div className="w-full flex flex-col items-center gap-5 pt-4 border-t border-white/[0.05]">
                    <button 
                        className={`w-full md:w-1/2 h-[50px] rounded-xl text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 flex justify-center items-center gap-3
                        ${loading 
                            ? "bg-white/10 cursor-not-allowed opacity-70 text-gray-400 border border-white/10" 
                            : "bg-gradient-to-r from-[#4A235A] to-[#7B1FA2] hover:from-[#5B2C6F] hover:to-[#8E24AA] text-white shadow-lg shadow-purple-900/20 active:scale-[0.98]"
                        }`}
                        disabled={loading}
                        onClick={handleRegister}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            "Submit Application"
                        )}
                    </button>

                    <p className="text-gray-500 text-xs text-center mt-2">
                        Already enrolled? <Link to="/login" className="font-bold text-[#A58ED4] hover:text-white transition-colors ml-1 uppercase tracking-wider">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}