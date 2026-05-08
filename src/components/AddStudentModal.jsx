import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

export default function AddStudentModal({ isOpen, onClose, onSuccess }) {
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nic_number, setNicNumber] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [permanent_address, setPermanentAddress] = useState("");
    const [university, setUniversity] = useState("");
    const [faculty, setFaculty] = useState("");
    const [student_id, setStudentId] = useState("");
    const [guardian_name, setGuardianName] = useState("");
    const [guardian_phone, setGuardianPhone] = useState("");

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleRegister(e) {
        e.preventDefault(); // Form submit වෙද්දි page refresh වෙන එක නවත්තන්න

        // Basic validations
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

            toast.success("Student registered successfully!");
            
            // Register උනාට පස්සේ form එක clear කරලා modal එක වහන්න
            resetForm();
            onSuccess(); // UserManagement එකේ data refresh කරන්න මේක කෝල් කරනවා
            onClose();

        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed! Please check your data.");
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const resetForm = () => {
        setFirstName(""); setLastName(""); setEmail(""); setPassword("");
        setNicNumber(""); setPhoneNumber(""); setPermanentAddress("");
        setUniversity(""); setFaculty(""); setStudentId("");
        setGuardianName(""); setGuardianPhone("");
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            {/* Modal Box */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Register New Student</h3>
                        <p className="text-sm text-gray-500 mt-1">Add a new student to the system</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-3xl transition-colors">&times;</button>
                </div>

                {/* Body (Scrollable if content is too long) */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="register-form" onSubmit={handleRegister}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                            
                            {/* First Name */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">First Name *</label>
                                <input required value={first_name} onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="John" />
                            </div>

                            {/* Last Name */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Last Name *</label>
                                <input required value={last_name} onChange={(e) => setLastName(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="Doe" />
                            </div>

                            {/* Email */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Email Address *</label>
                                <input required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="email" placeholder="example@gmail.com" />
                            </div>

                            {/* Password */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Temporary Password *</label>
                                <input required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="password" placeholder="••••••••" />
                            </div>

                            {/* Phone Number */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Phone Number</label>
                                <input value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="07X XXX XXXX" />
                            </div>

                            {/* NIC Number */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">NIC Number</label>
                                <input value={nic_number} onChange={(e) => setNicNumber(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="2000XXXXXXX" />
                            </div>

                            {/* Permanent Address */}
                            <div className="w-full md:col-span-2">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Permanent Address</label>
                                <input value={permanent_address} onChange={(e) => setPermanentAddress(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="123, Main Street, City" />
                            </div>

                            {/* University */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">University</label>
                                <input value={university} onChange={(e) => setUniversity(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="UCSC" />
                            </div>

                            {/* Faculty */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Faculty</label>
                                <input value={faculty} onChange={(e) => setFaculty(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="Computing" />
                            </div>

                            {/* Student ID */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Student ID</label>
                                <input value={student_id} onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="STU-XXXX" />
                            </div>

                            <div className="hidden md:block"></div> 

                            {/* Guardian Name */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Guardian Name</label>
                                <input value={guardian_name} onChange={(e) => setGuardianName(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="Guardian Name" />
                            </div>

                            {/* Guardian Phone */}
                            <div className="w-full">
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Guardian Phone</label>
                                <input value={guardian_phone} onChange={(e) => setGuardianPhone(e.target.value)}
                                    className="w-full h-[45px] rounded-lg px-4 border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="07X XXX XXXX" />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="register-form" 
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center min-w-[150px] transition-colors"
                    >
                        {loading ? "Registering..." : "Register Student"}
                    </button>
                </div>

            </div>
        </div>
    );
}