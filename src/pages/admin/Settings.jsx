import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  MdSettings, MdAccountBalance, MdSecurity, MdSave, MdLockOutline, MdAdminPanelSettings 
} from 'react-icons/md';
import api from '../../utils/api'; 

// URL එක කෙලින්ම ලියනවා වෙනුවට .env එකෙන් ගන්නවා
const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AdminSettings() {
  // ─────────────────────────────────────────────
  // 1. OWNER AUTHORIZATION STATE
  // ─────────────────────────────────────────────
  const [isOwnerVerified, setIsOwnerVerified] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [ownerToken, setOwnerToken] = useState(null); 
  const [ownerCreds, setOwnerCreds] = useState({
    email: '',
    password: ''
  });

  // ─────────────────────────────────────────────
  // 2. SETTINGS STATES
  // ─────────────────────────────────────────────
  const [generalSettings, setGeneralSettings] = useState({
    lateFineAmount: '',
    gracePeriodDays: '',
  });
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: ''
  });
  const [isSavingBank, setIsSavingBank] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // ─────────────────────────────────────────────
  // 3. FETCH EXISTING SETTINGS (Owner Token එකෙන්)
  // ─────────────────────────────────────────────
  const fetchSettings = async (token) => {
    try {
      // මෙතන API_BASE_URL එක පාවිච්චි කරනවා
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data) {
        setGeneralSettings({
          lateFineAmount: data.late_fine_amount || '',
          gracePeriodDays: data.grace_period_days || ''
        });
        setBankDetails({
          bankName: data.bank_name || '',
          accountName: data.account_name || '',
          accountNumber: data.account_number || '',
          branch: data.branch || ''
        });
      }
    } catch (error) {
      toast.error("Failed to load settings from database");
    }
  };

  // ─────────────────────────────────────────────
  // 4. OWNER VERIFICATION
  // ─────────────────────────────────────────────
  const handleOwnerVerification = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      // මේක public route එකක් නිසා api.post පාවිච්චි කළාට අවුලක් නෑ
      const response = await api.post('/settings/verify-owner', ownerCreds);
      
      if (response.data && response.data.isOwner) {
        toast.success("Identity Verified. Access Granted.");
        setIsOwnerVerified(true);
        setOwnerToken(response.data.ownerToken); 
        fetchSettings(response.data.ownerToken); 
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Verification failed";
      toast.error(msg);
      setOwnerCreds({...ownerCreds, password: ''}); 
    } finally {
      setAuthLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // 5. SAVE FUNCTIONS (fetch පාවිච්චි කරලා)
  // ─────────────────────────────────────────────
  const saveAllSettings = async () => {
    const payload = {
      lateFineAmount: generalSettings.lateFineAmount,
      gracePeriodDays: generalSettings.gracePeriodDays,
      bankName: bankDetails.bankName,
      accountName: bankDetails.accountName,
      accountNumber: bankDetails.accountNumber,
      branch: bankDetails.branch
    };

    // මෙතන API_BASE_URL එක පාවිච්චි කරනවා
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${ownerToken}`, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update settings");
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      await saveAllSettings();
      toast.success("Payment Rules updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      await saveAllSettings();
      toast.success("Bank details updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update bank details");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    
    setIsSavingPassword(true);
    
    try {
      // මෙතන API_BASE_URL එක පාවිච්චි කරනවා
      const response = await fetch(`${API_BASE_URL}/settings/password`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${ownerToken}`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER 1: OWNER VERIFICATION SCREEN
  // ══════════════════════════════════════════════════════════════
  if (!isOwnerVerified) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center pb-10">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-600"></div>
          
          <div className="flex flex-col items-center text-center mb-8 mt-2">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
              <MdLockOutline className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Restricted Area</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              This section contains highly sensitive configurations. Please verify your identity as an <strong className="text-gray-700">Owner</strong> to continue.
            </p>
          </div>

          <form onSubmit={handleOwnerVerification} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email / ID</label>
              <input 
                type="email" 
                required
                value={ownerCreds.email}
                onChange={(e) => setOwnerCreds({...ownerCreds, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                placeholder="owner@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Master Password</label>
              <input 
                type="password" 
                required
                value={ownerCreds.password}
                onChange={(e) => setOwnerCreds({...ownerCreds, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            >
              <MdAdminPanelSettings className="text-xl" /> 
              {authLoading ? 'Verifying...' : 'Authenticate & Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER 2: ACTUAL SETTINGS SCREEN
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="w-full pb-10 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure your boarding house parameters and security.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
            <MdAdminPanelSettings /> OWNER ACCESS
          </span>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <MdSettings className="text-2xl animate-spin-slow" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          
          {/* General Settings Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 p-5 flex items-center gap-3">
              <MdSettings className="text-xl text-indigo-500" />
              <h3 className="font-semibold text-gray-800">Payment Rules & Fines</h3>
            </div>
            
            <form onSubmit={handleSaveGeneral} className="p-6 space-y-5">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Late Fine Amount (Rs.)</label>
                  <input 
                    type="number" 
                    value={generalSettings.lateFineAmount}
                    onChange={(e) => setGeneralSettings({...generalSettings, lateFineAmount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Amount added to the bill if paid late.</p>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (Days)</label>
                  <input 
                    type="number" 
                    value={generalSettings.gracePeriodDays}
                    onChange={(e) => setGeneralSettings({...generalSettings, gracePeriodDays: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Days allowed after due date before fine applies.</p>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" disabled={isSavingGeneral}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium py-2 px-5 rounded-lg transition-colors flex items-center gap-2 text-sm border border-indigo-100 disabled:opacity-50"
                >
                  <MdSave className="text-lg" /> {isSavingGeneral ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 p-5 flex items-center gap-3">
              <MdAccountBalance className="text-xl text-blue-500" />
              <h3 className="font-semibold text-gray-800">Bank Account Details</h3>
            </div>
            
            <form onSubmit={handleSaveBank} className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-4">This information will be displayed to students when they choose to upload a bank slip.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input 
                  type="text" value={bankDetails.bankName} onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                <input 
                  type="text" value={bankDetails.accountName} onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input 
                    type="text" value={bankDetails.accountNumber} onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input 
                    type="text" value={bankDetails.branch} onChange={(e) => setBankDetails({...bankDetails, branch: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" disabled={isSavingBank}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-5 rounded-lg transition-colors flex items-center gap-2 text-sm border border-blue-100 disabled:opacity-50"
                >
                  <MdSave className="text-lg" /> {isSavingBank ? 'Saving...' : 'Save Bank Details'}
                </button>
              </div>
            </form>
          </div>

        </div>

        <div className="flex flex-col gap-8">
          
          {/* Security (Password Change) Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 p-5 flex items-center gap-3">
              <MdSecurity className="text-xl text-green-500" />
              <h3 className="font-semibold text-gray-800">Security & Password</h3>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm"
                />
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} required minLength="6"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} required minLength="6"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" disabled={isSavingPassword}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm w-full disabled:opacity-70"
                >
                  <MdSecurity className="text-lg" /> {isSavingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// email:'buddhika@gmail.com' && password : '123456' 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
