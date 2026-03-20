import React, { useState, useEffect } from "react";
import {
  User, Mail, Key, Copy, CheckCircle, Eye, EyeOff,
  Save, AlertCircle, Shield, Clock, Edit3, Loader
} from "lucide-react";
import toast from "react-hot-toast";
import { getProfile, updateEmail, updatePin } from "../services/authService";

export default function ProfilePage({ onBack }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPin, setEditingPin] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");

  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [copiedId, setCopiedId] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  // ========== LOAD USER DATA ==========
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getProfile(token);
        if (data?.success && data?.user) {
          setUserData(data.user);
        } else {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          setUserData(storedUser);
        }
      } catch (err) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setUserData(storedUser);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // ========== COPY USER ID ==========
  const copyUserId = () => {
    navigator.clipboard.writeText(userData?.userId || "");
    setCopiedId(true);
    toast.success("User ID copied!", { duration: 2000 });
    setTimeout(() => setCopiedId(false), 2000);
  };

  // ========== UPDATE EMAIL ==========
  const handleUpdateEmail = async () => {
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (newEmail === userData?.email) {
      toast.error("This is already your current email");
      return;
    }

    setSavingEmail(true);
    try {
      const token = localStorage.getItem("token");
      const data = await updateEmail(token, newEmail);

      if (data?.success) {
        setUserData(prev => ({ ...prev, email: newEmail }));
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, email: newEmail }));
        toast.success("Email updated successfully! ✅");
        setEditingEmail(false);
        setNewEmail("");
      } else {
        toast.error(data?.message || "Failed to update email");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingEmail(false);
    }
  };

  // ========== UPDATE PIN ==========
  const handleUpdatePin = async () => {
    if (!currentPin || currentPin.length !== 6) {
      toast.error("Enter your current 6-digit PIN");
      return;
    }
    if (!newPin || newPin.length !== 6) {
      toast.error("New PIN must be 6 digits");
      return;
    }
    if (newPin !== confirmNewPin) {
      toast.error("New PINs do not match");
      return;
    }
    if (currentPin === newPin) {
      toast.error("New PIN must be different from current PIN");
      return;
    }

    setSavingPin(true);
    try {
      const token = localStorage.getItem("token");
      const data = await updatePin(token, currentPin, newPin);

      if (data?.success) {
        toast.success("PIN updated successfully! 🔐");
        setEditingPin(false);
        setCurrentPin("");
        setNewPin("");
        setConfirmNewPin("");
      } else {
        toast.error(data?.message || "Failed to update PIN");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingPin(false);
    }
  };

  const cancelEmail = () => { setEditingEmail(false); setNewEmail(""); };
  const cancelPin = () => {
    setEditingPin(false);
    setCurrentPin(""); setNewPin(""); setConfirmNewPin("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#00F5A0]">
        <Loader className="animate-spin" size={36} />
        <p className="text-sm font-bold italic">Loading Profile...</p>
      </div>
    );
  }

  const joinedDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric"
      })
    : "N/A";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in pb-10">

      {/* ===== HEADER CARD ===== */}
      <div className="bg-gradient-to-br from-[#00F5A0] to-[#00d88c] p-8 rounded-[2.5rem] text-[#051510] shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-black/20 flex items-center justify-center text-4xl font-black shadow-inner flex-shrink-0">
            {userData?.email?.charAt(0)?.toUpperCase() || userData?.userId?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black italic truncate">
              {userData?.email?.split("@")[0] || "User"}
            </h2>
            <p className="text-[#051510]/60 text-sm font-bold mt-1 truncate">
              {userData?.email || "No email set"}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] bg-black/20 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                {userData?.role || "user"}
              </span>
              <span className="text-[10px] bg-black/10 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <Clock size={10} /> Joined {joinedDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== USER ID CARD ===== */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-[#00F5A0]" />
          <h3 className="text-sm font-black italic uppercase tracking-wider text-[#00F5A0]">
            Account Identity
          </h3>
        </div>

        <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-3">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
            Your 6-Digit User ID
          </p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black font-mono tracking-[0.2em] text-white">
              {userData?.userId || "------"}
            </span>
            <button
              onClick={copyUserId}
              className="bg-[#00F5A0]/10 hover:bg-[#00F5A0]/20 p-3 rounded-xl transition-all border border-[#00F5A0]/20"
            >
              {copiedId
                ? <CheckCircle size={20} className="text-green-500" />
                : <Copy size={20} className="text-[#00F5A0]" />
              }
            </button>
          </div>
          <p className="text-[9px] text-gray-600 mt-2 flex items-center gap-1">
            <AlertCircle size={9} />
            This is your login ID — keep it safe
          </p>
        </div>

        {userData?.referralCode && (
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
              Referral Code
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black font-mono tracking-widest text-[#00F5A0]">
                {userData.referralCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(userData.referralCode);
                  toast.success("Referral code copied!", { duration: 2000 });
                }}
                className="bg-[#00F5A0]/10 hover:bg-[#00F5A0]/20 p-2.5 rounded-xl transition-all border border-[#00F5A0]/20"
              >
                <Copy size={16} className="text-[#00F5A0]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== EMAIL CARD ===== */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-[#00F5A0]" />
            <h3 className="text-sm font-black italic uppercase tracking-wider text-[#00F5A0]">
              Email Address
            </h3>
          </div>
          {!editingEmail && (
            <button
              onClick={() => { setEditingEmail(true); setNewEmail(userData?.email || ""); }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
            >
              <Edit3 size={12} className="text-[#00F5A0]" />
              Change
            </button>
          )}
        </div>

        {!editingEmail ? (
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 mb-1">Current Email</p>
            <p className="text-base font-bold text-white break-all">
              {userData?.email || "Not set"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">
                New Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00F5A0]/50 transition-all"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={cancelEmail} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-black text-sm transition-all border border-white/10">
                Cancel
              </button>
              <button
                onClick={handleUpdateEmail}
                disabled={savingEmail}
                className="flex-1 bg-[#00F5A0] text-black py-3 rounded-xl font-black text-sm hover:bg-[#00d88c] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingEmail ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Email</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== PIN CHANGE CARD ===== */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-[#00F5A0]" />
            <h3 className="text-sm font-black italic uppercase tracking-wider text-[#00F5A0]">
              Security PIN
            </h3>
          </div>
          {!editingPin && (
            <button
              onClick={() => setEditingPin(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
            >
              <Edit3 size={12} className="text-[#00F5A0]" />
              Change PIN
            </button>
          )}
        </div>

        {!editingPin ? (
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 mb-1">Current PIN</p>
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#00F5A0] rounded-full" />
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-600 mt-3 flex items-center gap-1">
              <Shield size={9} /> PIN is encrypted and never shown
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Current PIN */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">Current PIN</label>
              <div className="relative group">
                <input
                  type={showCurrentPin ? "text" : "password"}
                  value={currentPin}
                  onChange={e => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter current 6-digit PIN"
                  maxLength={6}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white text-center text-xl tracking-[0.3em] font-black outline-none focus:border-[#00F5A0]/50 transition-all"
                />
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" />
                <button type="button" onClick={() => setShowCurrentPin(!showCurrentPin)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#00F5A0] transition-colors">
                  {showCurrentPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New PIN */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">New PIN</label>
              <div className="relative group">
                <input
                  type={showNewPin ? "text" : "password"}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter new 6-digit PIN"
                  maxLength={6}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white text-center text-xl tracking-[0.3em] font-black outline-none focus:border-[#00F5A0]/50 transition-all"
                />
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" />
                <button type="button" onClick={() => setShowNewPin(!showNewPin)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#00F5A0] transition-colors">
                  {showNewPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New PIN */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">Confirm New PIN</label>
              <div className="relative group">
                <input
                  type={showConfirmPin ? "text" : "password"}
                  value={confirmNewPin}
                  onChange={e => setConfirmNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Confirm new 6-digit PIN"
                  maxLength={6}
                  className={`w-full bg-black/40 border rounded-xl py-4 pl-12 pr-12 text-white text-center text-xl tracking-[0.3em] font-black outline-none transition-all ${
                    confirmNewPin && newPin !== confirmNewPin
                      ? "border-red-500/50"
                      : confirmNewPin && newPin === confirmNewPin
                        ? "border-green-500/50"
                        : "border-white/10 focus:border-[#00F5A0]/50"
                  }`}
                />
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00F5A0] transition-colors" />
                <button type="button" onClick={() => setShowConfirmPin(!showConfirmPin)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#00F5A0] transition-colors">
                  {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmNewPin && newPin !== confirmNewPin && (
                <p className="text-[10px] text-red-400 mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10} /> PINs do not match</p>
              )}
              {confirmNewPin && newPin === confirmNewPin && (
                <p className="text-[10px] text-green-400 mt-1 ml-1 flex items-center gap-1"><CheckCircle size={10} /> PINs match</p>
              )}
            </div>

            {/* PIN fill progress */}
            {newPin.length > 0 && (
              <div className="flex gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < newPin.length ? "bg-[#00F5A0]" : "bg-white/10"}`} />
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={cancelPin} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-black text-sm transition-all border border-white/10">
                Cancel
              </button>
              <button
                onClick={handleUpdatePin}
                disabled={savingPin || newPin !== confirmNewPin || newPin.length < 6}
                className="flex-1 bg-[#00F5A0] text-black py-3 rounded-xl font-black text-sm hover:bg-[#00d88c] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPin ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Update PIN</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== ACCOUNT INFO ===== */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-[#00F5A0]" />
          <h3 className="text-sm font-black italic uppercase tracking-wider text-[#00F5A0]">Account Info</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <p className="text-[9px] text-gray-500 mb-1">Account Type</p>
            <p className="text-sm font-bold capitalize text-white">{userData?.role || "user"}</p>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <p className="text-[9px] text-gray-500 mb-1">Member Since</p>
            <p className="text-sm font-bold text-white">{joinedDate}</p>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <p className="text-[9px] text-gray-500 mb-1">Direct Referrals</p>
            <p className="text-sm font-bold text-[#00F5A0]">
              {userData?.directReferralsCount || userData?.legs?.length || 0}
            </p>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <p className="text-[9px] text-gray-500 mb-1">Total Earnings</p>
            <p className="text-sm font-bold text-orange-400">
              ₹{Number(userData?.totalEarnings || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* ===== SECURITY NOTE ===== */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-yellow-500 mb-1">Security Reminder</p>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Never share your User ID, PIN, or referral code with anyone.
              CpayLink will never ask for your PIN via chat or email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}