import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid, ArrowRightLeft, Wallet, ScanLine, CheckCircle,
  LogOut, X, Clock, Menu, Loader, Zap, PlusCircle, Camera, UploadCloud, Bell,
  Users, TrendingUp, Award, Gift, Copy, ChevronDown, ChevronUp, User, Key, AlertCircle,
  ArrowRight,Info,
  HelpCircle,
  Share2,
  CreditCard
} from "lucide-react";

import {
  getWallets, getTransactions, createDeposit, transferCashback,
  getActivePaymentMethods, requestToPay, getActiveRequests,
  acceptRequest, submitPayment, confirmRequest,
} from "../services/apiService";
import { 
  getReferralStats, 
  getTeamCashbackSummary, 
  activateWallet, 
  getActivationStatus, 
  getTodayTeamStats
} from "../services/authService";
import toast from 'react-hot-toast';
import { Html5Qrcode } from "html5-qrcode";
import QRCode from 'react-qr-code';
import API_BASE from "../services/api";
import HelpPage from "../components/HelpPage";
import ChatBot from "../components/ChatBot";
import jsQR from "jsqr";

import { QRCodeCanvas } from "qrcode.react";
import { DepositScreenshotModal } from "./DepositScreenshotModal";
import ProfilePage from "./ProfilePage";
// Add this configuration at the top of your file, after imports
const toastOptions = {
  duration: 1000, // 1 second
  position: "top-right",
  style: {
    background: '#0A1F1A',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  success: {
    duration: 1000,
    icon: '✅',
    style: {
      background: '#0A1F1A',
      border: '1px solid #00F5A0/30',
    },
  },
  error: {
    duration: 1000,
    icon: '❌',
    style: {
      background: '#0A1F1A',
      border: '1px solid #ef4444/30',
    },
  },
  loading: {
    duration: 1000,
    style: {
      background: '#0A1F1A',
      border: '1px solid #f59e0b/30',
    },
  },
};

export default function UserDashboard() {
  const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user")) || { 
    userId: "User",
    _id: ""
  };

// Referral data state - Level 21 पर्यंत
const [referralData, setReferralData] = useState({
  referralCode: "",
  totalReferrals: 0,
  referralEarnings: { 
    total: 0, 
    level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
    level6: 0, level7: 0, level8: 0, level9: 0, level10: 0,
    level11: 0, level12: 0, level13: 0, level14: 0, level15: 0,
    level16: 0, level17: 0, level18: 0, level19: 0, level20: 0,
    level21: 0
  },
  cashbackBalance: 0,
  referralTree: { 
    level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
    level6: 0, level7: 0, level8: 0, level9: 0, level10: 0,
    level11: 0, level12: 0, level13: 0, level14: 0, level15: 0,
    level16: 0, level17: 0, level18: 0, level19: 0, level20: 0,
    level21: 0
  },
  earningsByLevel: { 
    level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
    level6: 0, level7: 0, level8: 0, level9: 0, level10: 0,
    level11: 0, level12: 0, level13: 0, level14: 0, level15: 0,
    level16: 0, level17: 0, level18: 0, level19: 0, level20: 0,
    level21: 0, total: 0
  }
});

  const [teamStats, setTeamStats] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data State
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  
  // Refs for notifications
  const prevActiveCount = useRef(0);
  const prevWalletsRef = useRef({});
  const prevTransactionsRef = useRef([]);
  
  // Form States
  const [depositData, setDepositData] = useState({ amount: "", network: "TRC20" });
  const [uploadAmount, setUploadAmount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [depositScreenshot, setDepositScreenshot] = useState(null);
  const [qrData, setQrData] = useState("");
  const [amount, setAmount] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  
  // Timer related states
  const [requestTimer, setRequestTimer] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  // Redeem states
  const [redeemAmount, setRedeemAmount] = useState("");
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [isRedeemMode, setIsRedeemMode] = useState(false);

  // Terms and conditions states
  const [createTermsAccepted, setCreateTermsAccepted] = useState(false);
  const [acceptTermsAccepted, setAcceptTermsAccepted] = useState(false);

// Daily limit states
const [dailyAcceptLimit, setDailyAcceptLimit] = useState(""); // ✅ Actual limit (used after confirmation)
const [localInputLimit, setLocalInputLimit] = useState(""); // ✅ Local input for modal
const [todayAcceptedTotal, setTodayAcceptedTotal] = useState(0);
const [walletActivated, setWalletActivated] = useState(false);
const [showActivationModal, setShowActivationModal] = useState(false);
const [activationAmount, setActivationAmount] = useState(0);
const [activationStatus, setActivationStatus] = useState({
  activated: false,
  dailyLimit: 1000,
  todayAccepted: 0,
  remaining: 1000
});

// Timer states for deposit verification - moved to parent for persistence
const [showDepositTimer, setShowDepositTimer] = useState(false);
const [depositTimeLeft, setDepositTimeLeft] = useState(300); // 5 minutes
const [depositVerifying, setDepositVerifying] = useState(false);


// Deposit management states
const [myDeposits, setMyDeposits] = useState([]);
const [selectedDeposit, setSelectedDeposit] = useState(null);
const [showDepositScreenshotModal, setShowDepositScreenshotModal] = useState(false);
const [depositUpdateReason, setDepositUpdateReason] = useState("");
const walletExpiryToastShown = useRef(false);
const [upiLink, setUpiLink] = useState("");
const [scannerSubTab, setScannerSubTab] = useState("pay"); // "pay" or "accept"
  
    // Helper function to check if request is expired
  const isRequestExpired = (request) => {
    if (request.status !== "ACTIVE") return false;
    if (request.acceptedBy) return false;
    
    const createdTime = new Date(request.createdAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - createdTime) / 1000);
    return elapsedSeconds >= 600; // 10 minutes = 600 seconds
  };

  
  // // Calculate counts - FIXED to handle expired requests properly
  // const activeRequestsCount = scanners.filter(s => 
  //   s.status === "ACTIVE" && 
  //   String(s.user?._id) !== String(user.id || user._id) &&
  //   !isRequestExpired(s) // Only count non-expired requests
  // ).length;
  
  // const myActiveRequestsCount = scanners.filter(s => 
  //   s.status === "ACTIVE" && 
  //   String(s.user?._id) === String(user.id || user._id) && 
  //   !s.acceptedBy &&
  //   !isRequestExpired(s) // Only count non-expired requests
  // ).length;

// Update activeRequestsCount
const activeRequestsCount = scanners.filter(s => 
  s.status === "ACTIVE" && 
  String(s.user?._id) !== String(user.id || user._id) &&
  !isRequestExpired(s) &&
  s.status !== "COMPLETED" && // Add this
  s.status !== "EXPIRED"      // Add this
).length;

const myActiveRequestsCount = scanners.filter(s => 
  s.status === "ACTIVE" && 
  String(s.user?._id) === String(user.id || user._id) && 
  !s.acceptedBy &&
  !isRequestExpired(s) &&
  s.status !== "COMPLETED" && // Add this
  s.status !== "EXPIRED"      // Add this
).length;

  // Play notification sound
  const playNotificationSound = (type = 'new') => {
    const sounds = {
      new: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
      cashback: "https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3"
    };
    const audio = new Audio(sounds[type] || sounds.new);
    audio.play().catch(err => console.log("Audio play blocked by browser"));
  };

  // Check for new active requests
  useEffect(() => {
    if (activeRequestsCount > prevActiveCount.current) {
      playNotificationSound('new');
      toast.success(
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-[#00F5A0]" />
          <div>
            <div className="font-bold">New Pay Request! 🎯</div>
            <div className="text-xs text-gray-400">{activeRequestsCount} requests available</div>
          </div>
        </div>,
        { 
          duration: 1000,
          style: {
            background: '#0A1F1A',
            color: 'white',
            border: '1px solid #00F5A0/20'
          }
        }
      );
    }
    prevActiveCount.current = activeRequestsCount;
  }, [activeRequestsCount]);

  // Check for wallet changes (cashback, credits, debits)
  useEffect(() => {
    if (wallets.length > 0) {
      wallets.forEach(wallet => {
        const prevBalance = prevWalletsRef.current[wallet.type] || 0;
        const currentBalance = wallet.balance;
        
        if (currentBalance > prevBalance && prevBalance !== 0) {
          const difference = (currentBalance - prevBalance).toFixed(2);
          
          if (wallet.type === 'CASHBACK') {
            playNotificationSound('cashback');
            toast.success(
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-[#00F5A0]" />
                <div>
                  <div className="font-bold">Cashback Received! 🎉</div>
                  <div className="text-xs text-[#00F5A0]">+₹{difference} added</div>
                </div>
              </div>,
              { 
                duration: 1000,
                style: {
                  background: '#0A1F1A',
                  color: 'white',
                  border: '1px solid #00F5A0/20'
                }
              }
            );
          } else if (wallet.type === 'INR') {
            playNotificationSound('success');
            toast.success(
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-green-500" />
                <div>
                  <div className="font-bold">INR Wallet Updated</div>
                  <div className="text-xs text-green-500">+₹{difference} credited</div>
                </div>
              </div>,
              { duration: 1000 }
            );
          } else if (wallet.type === 'USDT') {
            playNotificationSound('success');
            toast.success(
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-blue-500" />
                <div>
                  <div className="font-bold">USDT Wallet Updated</div>
                  <div className="text-xs text-blue-500">+{difference} USDT</div>
                </div>
              </div>,
              { duration: 1000 }
            );
          }
        }
        
        prevWalletsRef.current[wallet.type] = currentBalance;
      });
    }
  }, [wallets]);

  const [activeSlot, setActiveSlot] = useState("ALL");

const slots = [
  { id: "1-99", label: "₹1 - ₹99", min: 1, max: 99 }, // ⭐ NEW SLOT
  { id: "100-999", label: "₹100 - ₹999", min: 100, max: 999 },
  { id: "1000-9999", label: "₹1000 - ₹9999", min: 1000, max: 10000},
];

const filteredRequests = scanners
  .filter((s) => String(s.user?._id) !== String(user.id || user._id)) // ✅ Fix
  .filter((s) => {
    if (activeSlot === "ALL") return true;

    const slot = slots.find((slot) => slot.id === activeSlot);
    if (!slot) return true;

    return s.amount >= slot.min && s.amount <= slot.max;
  });

   // ✅ Add this function to calculate 7-day total from scanners
  const calculateSevenDayTotal = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const sevenDayTotal = scanners
      .filter(s => 
        s.status === "ACCEPTED" && 
        new Date(s.acceptedAt) >= sevenDaysAgo &&
        String(s.acceptedBy?._id) === String(user._id)
      )
      .reduce((sum, request) => sum + (request.amount || 0), 0);
    
    // console.log("📊 7-day total calculated:", sevenDayTotal);
    return sevenDayTotal;
  };

  // ✅ Update the useEffect that calculates todayAcceptedTotal
  useEffect(() => {
    const calculateAcceptedTotal = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // First try to get from activation status
      if (activationStatus?.sevenDayTotal > 0) {
        setTodayAcceptedTotal(activationStatus.sevenDayTotal);
        return;
      }
      
      // Otherwise calculate from scanners
      const total = calculateSevenDayTotal();
      setTodayAcceptedTotal(total);
    };
    
    calculateAcceptedTotal();
  }, [scanners, user._id, activationStatus.sevenDayTotal]);



  // // Check for new transactions
  // useEffect(() => {
  //   if (transactions.length > prevTransactionsRef.current.length) {
  //     const newTransactions = transactions.slice(0, transactions.length - prevTransactionsRef.current.length);
      
  //     newTransactions.forEach(tx => {
  //       if (tx.type === 'CREDIT' || tx.type === 'DEBIT' || tx.type === 'TEAM_CASHBACK') {
  //         playNotificationSound('success');
  //         toast(
  //           <div className="flex items-center gap-2">
  //             {tx.type === 'TEAM_CASHBACK' ? (
  //               <Users size={20} className="text-purple-500" />
  //             ) : tx.type === 'CREDIT' ? (
  //               <ArrowRightLeft size={20} className="text-green-500" />
  //             ) : (
  //               <ArrowRightLeft size={20} className="text-red-500" />
  //             )}
  //             <div>
  //               <div className="font-bold">{tx.type === 'TEAM_CASHBACK' ? 'Team Cashback' : tx.type} </div>
  //               <div className="text-xs">₹{tx.amount} • {tx.fromWallet || 'System'} → {tx.toWallet || 'CASHBACK'}</div>
  //             </div>
  //           </div>,
  //           { 
  //             duration: 2000,
  //             style: {
  //               background: '#0A1F1A',
  //               color: 'white',
  //               border: '1px solid rgba(255,255,255,0.1)'
  //             }
  //           }
  //         );
  //       }
  //     });
  //   }
  //   prevTransactionsRef.current = transactions;
  // }, [transactions]);

// Calculate today's accepted total - QUICK FIX
useEffect(() => {
  const calculateTodayAccepted = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // ✅ Activation status वरून थेट value घ्या
    if (activationStatus.todayAccepted > 0) {
      // console.log("📊 Using activation status value:", activationStatus.todayAccepted);
      setTodayAcceptedTotal(activationStatus.todayAccepted);
      return;
    }
    
    // नाहीतर scanners वरून calculate करा
    const todayTotal = scanners
      .filter(s => 
        s.status === "ACCEPTED" && 
        new Date(s.acceptedAt) >= today &&
        String(s.acceptedBy?._id) === String(user._id)
      )
      .reduce((sum, request) => sum + (request.amount || 0), 0);
    
    // console.log("📊 Calculated from scanners:", todayTotal);
    setTodayAcceptedTotal(todayTotal);
  };
  
  calculateTodayAccepted();
}, [scanners, user._id, activationStatus.todayAccepted]);

// Add this with other useEffects
// Load pending deposit from localStorage on mount
useEffect(() => {
  const savedDeposit = localStorage.getItem("pendingDeposit");
  if (savedDeposit) {
    const deposit = JSON.parse(savedDeposit);
    const elapsedSeconds = Math.floor((Date.now() - deposit.timestamp) / 1000);
    const remaining = Math.max(0, 300 - elapsedSeconds);
    
    if (remaining > 0) {
      setShowDepositTimer(true);
      setDepositTimeLeft(remaining);
      setDepositVerifying(true);
    } else {
      localStorage.removeItem("pendingDeposit");
    }
  }
}, []);

  // ✅ Update loadActivationStatus to properly set values
  const loadActivationStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const status = await getActivationStatus(token);
      
      // console.log("📊 Activation status loaded:", status);
      
      setActivationStatus(status);
      setWalletActivated(status.activated);
      
      // Set 7-day limit
      if (status.dailyLimit && status.activated) {
        setDailyAcceptLimit(status.dailyLimit);
      } else {
        setDailyAcceptLimit("");
      }
      
      // Set 7-day total
      if (status.sevenDayTotal !== undefined) {
        setTodayAcceptedTotal(status.sevenDayTotal);
      } else {
        // Calculate from scanners if not in status
        const total = calculateSevenDayTotal();
        setTodayAcceptedTotal(total);
      }
      
      // Store expiry info
      if (status.expiryDate) {
        localStorage.setItem("walletExpiry", status.expiryDate);
      }
      
  // ✅ नवीन code (हा टाका)
if (status.activated && status.remainingDays <= 2 && status.remainingDays > 0 && !walletExpiryToastShown.current) {
  walletExpiryToastShown.current = true;
  toast(
    <div className="flex items-center gap-2">
      <AlertCircle size={20} className="text-yellow-500" />
      <div>
        <div className="font-bold text-yellow-500">Wallet Expiring Soon!</div>
        <div className="text-xs">{status.remainingDays} days remaining</div>
      </div>
    </div>,
    { duration: 1000 }
  );
}
      
    } catch (error) {
      // console.error("Error loading activation status:", error);
    }
  };

const loadAllData = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      // console.warn("Sync aborted: No token found");
      return;
    }

    const [w, t, s, pm, ref, team] = await Promise.all([
      getWallets(),
      getTransactions(),
      getActiveRequests(),
      getActivePaymentMethods(),
      getReferralStats(token),
      getTeamCashbackSummary(token)
    ]);

    setWallets(Array.isArray(w) ? w : []);
    setTransactions(t || []);

    // ✅ FIX: Filter out COMPLETED and EXPIRED requests from backend
    const backend = (s || []).filter(req => 
      req.status !== "COMPLETED" && 
      req.status !== "EXPIRED"
    );
    
    // ✅ FIX: Merge only non-completed/non-expired requests
    setScanners(prev => {
      const merged = [...backend];
      
      // prev मध्ये जे requests आहेत पण backend मध्ये नाहीत आणि COMPLETED/EXPIRED नाहीत, ते add करा
      prev.forEach(req => {
        // Skip if request is already completed or expired
        if (req.status === "COMPLETED" || req.status === "EXPIRED") {
          return;
        }
        
        const exists = merged.find(b => b._id === req._id);
        if (!exists) {
          merged.push(req);
        }
      });
      
      return merged;
    });

    setPaymentMethods(pm || []);

    if (ref?.success && ref?.data) {
      setReferralData({
        referralCode: ref.data.referralCode || "",
        totalReferrals: ref.data.totalTeam || 0,
        referralEarnings: { total: ref.data.totalEarnings || 0 },
        cashbackBalance: 0,
        referralTree: {},
        earningsByLevel: {}
      });
    }

    setTeamStats(team);

  } catch (err) {
    // console.error("Sync Error:", err);
  } finally {
    setLoading(false);
  }
};

const cleanupCompletedRequests = () => {
  setScanners(prev => {
    const now = new Date();
    const filtered = prev.filter(s => 
      s.status !== "COMPLETED" && 
      s.status !== "EXPIRED" &&
      !(s.status === "ACTIVE" && new Date(s.expiresAt) < now)
    );
    
    if (filtered.length !== prev.length) {
      console.log(`✅ Cleaned up ${prev.length - filtered.length} completed/expired requests`);
    }
    
    return filtered;
  });
};

// Add this useEffect for auto-cleanup
useEffect(() => {
  const cleanupInterval = setInterval(() => {
    cleanupCompletedRequests();
  }, 5000); // Clean every 5 seconds
  
  return () => clearInterval(cleanupInterval);
}, []);

// ==================== FIX: Load my deposits ====================
const loadMyDeposits = async () => {
  try {
    // Import getMyDeposits from apiService
    const { getMyDeposits } = await import("../services/apiService");
    const deposits = await getMyDeposits();
    
    // ✅ FIX: Ensure deposits is an array
    const depositsArray = Array.isArray(deposits) ? deposits : [];
    setMyDeposits(depositsArray);
    
    // Check for newly rejected deposits (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const justRejected = depositsArray.filter(d => 
      d.status === 'rejected' && 
      new Date(d.updatedAt) > fiveMinutesAgo
    );
    
    justRejected.forEach(deposit => {
      playNotificationSound('new');
      toast.error(
        <div className="flex items-center gap-3 bg-red-500/10 p-3 rounded-xl">
          <div className="bg-red-500/20 p-2 rounded-full">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <div>
            <div className="font-bold text-red-500">Deposit Rejected! ❌</div>
            <div className="text-xs text-gray-300 mt-1">{deposit.rejectReason || "Something wrong. Plz resubmit the transaction details with real screenshots."}</div>
            <button 
              onClick={() => {
                setActiveTab("Deposit");
                // Pre-fill with rejected deposit data
                if (deposit) {
                  setDepositData({ amount: deposit.amount.toString() });
                  setTxHash(deposit.txHash);
                  // You can add logic to select the payment method
                }
              }}
              className="mt-2 text-[10px] bg-red-500 text-white px-3 py-1 rounded-full font-bold"
            >
              RESUBMIT DEPOSIT
            </button>
          </div>
        </div>,
        { 
          duration: 1000,
          style: {
            background: '#0A1F1A',
            color: 'white',
            border: '1px solid #ef4444/20',
            padding: 0
          }
        }
      );
    });
  } catch (error) {
    // console.error("Error loading my deposits:", error);
    setMyDeposits([]); // ✅ FIX: Set empty array on error
  }
};

  useEffect(() => {
    loadAllData();
    loadActivationStatus();
     loadMyDeposits();
    const interval = setInterval(() => {
      loadAllData();
      loadActivationStatus();
      
    }, 10000);
    
    return () => {
      clearInterval(interval);
      if (window.currentScanner) {
        window.currentScanner.stop().catch(() => {});
        window.currentScanner = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (requestTimer) {
        clearTimeout(requestTimer);
      }
    };
  }, [requestTimer]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

// In UserDashboard.jsx - Replace the existing checkActivationDeposit useEffect

// UserDashboard.jsx मध्ये - checkActivationDeposit useEffect मध्ये बदल

// Check if deposit completed for activation - FIXED for increases too
useEffect(() => {
  const checkActivationDeposit = async () => {
    const pending = localStorage.getItem("pendingActivation");
    if (!pending) return;
    
    const pendingData = JSON.parse(pending);
    
    // ✅ IMPORTANT: Check if deposit was actually submitted
    if (pendingData.depositPending) {
      return;
    }
    
    const { dailyLimit, amount, timestamp, isIncrease, previousLimit } = pendingData;
    
    // Check if deposit was completed in last 10 minutes
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      localStorage.removeItem("pendingActivation");
      return;
    }
    
    // ✅ Check if 2 minutes have passed since deposit submission
    if (Date.now() - timestamp < 2 * 60 * 1000) {
      return;
    }
    
    // ✅ First check if wallet is already at new limit (maybe by backend)
    if (isIncrease && dailyAcceptLimit >= dailyLimit) {
      localStorage.removeItem("pendingActivation");
      await loadActivationStatus();
      await loadAllData();
      return;
    } else if (!isIncrease && walletActivated) {
      localStorage.removeItem("pendingActivation");
      await loadActivationStatus();
      await loadAllData();
      return;
    }
    
    // Check if user has USDT wallet with sufficient balance
    const usdtWallet = wallets.find(w => w.type === "USDT");
    
    if (usdtWallet && usdtWallet.balance >= amount) {
      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_BASE}/scanner/activate-wallet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            dailyLimit: dailyLimit,
            activationAmount: amount,
            isIncrease: isIncrease || false
          })
        });
        
        const data = await res.json();
        
        if (res.ok && data.message) {
          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-[#00F5A0]" />
              <div>
                <div className="font-bold">
                  {isIncrease ? 'Limit Increased! 🎉' : 'Wallet Activated! 🎉'}
                </div>
                <div className="text-xs">
                  <span className="text-blue-400">{amount} USDT</span> → 
                  <span className="text-green-400"> ₹{data.inrAmount}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {isIncrease 
                    ? `New limit: ₹${dailyLimit} (was ₹${previousLimit})`
                    : `Daily limit: ₹${dailyLimit}`}
                </div>
              </div>
            </div>,
            { duration: 1000 }
          );
          
          setWalletActivated(true);
          setDailyAcceptLimit(dailyLimit);
          await loadActivationStatus();
          await loadAllData();
          localStorage.removeItem("pendingActivation");
        } else {
          // console.error("Activation failed:", data);
          if (data.message?.includes("already activated") || data.message?.includes("already at")) {
            setWalletActivated(true);
            setDailyAcceptLimit(data.dailyLimit || dailyLimit);
            localStorage.removeItem("pendingActivation");
            toast.success(isIncrease ? "Limit already increased!" : "Wallet already activated!");
            
            await loadActivationStatus();
            await loadAllData();
          } else {
            toast.error(data.message || "Failed to activate wallet");
          }
        }
      } catch (error) {
        // console.error("Activation failed:", error);
        toast.error("Failed to activate wallet");
      }
    } else {
      // console.log("USDT wallet balance not updated yet, waiting...");
    }
  };
  
  checkActivationDeposit();
}, [wallets, walletActivated, dailyAcceptLimit]);

// ✅ Activation amount calculate करा (10% of daily limit in INR, then convert to USDT)
// ✅ Activation amount calculate with minimum deposit check
const calculateActivationAmount = (limit) => {
  // 10% of daily limit in INR
  const inrAmount = limit * 0.1;
  
  // Convert to USDT (1 USDT = ₹95)
  const usdtAmount = inrAmount / 95;
  
  // Return with 2 decimal places
  return Number(usdtAmount.toFixed(2));
};

// ✅ Check if amount meets minimum $50
const isMinimumMet = (amount) => {
  return amount >= 10;
};

// Example:
// dailyLimit = 1000 → inrAmount = 100 → usdtAmount = 100/95 = 1.05 USDT
// dailyLimit = 2000 → inrAmount = 200 → usdtAmount = 200/95 = 2.11 USDT
// dailyLimit = 5000 → inrAmount = 500 → usdtAmount = 500/95 = 5.26 USDT
// In UserDashboard.jsx - Update handleDepositSubmit

const handleDepositSubmit = async () => {
  // Current validation
  if (!depositData.amount || !selectedMethod || !txHash || !depositScreenshot) {
    toast.error("Please fill all fields and upload screenshot");
    return false;
  }
  
  setActionLoading(true);
  const toastId = toast.loading('Submitting deposit...');
  
  try {
    const res = await createDeposit(depositData.amount, txHash, selectedMethod._id, depositScreenshot);
    
    if (res?._id) {
      toast.dismiss(toastId);
     toast.success(
  <div className="flex items-center gap-2">
    <CheckCircle size={14} className="text-[#00F5A0]" />
    <span className="text-xs font-bold">Deposit Submitted!</span>
  </div>,
  { duration: 1000 }
);
      
      // ✅ Update pendingActivation to mark deposit as submitted
      const pending = localStorage.getItem("pendingActivation");
      if (pending) {
        const pendingData = JSON.parse(pending);
        pendingData.depositPending = false;
        pendingData.depositSubmitted = true;
        pendingData.timestamp = Date.now();
        localStorage.setItem("pendingActivation", JSON.stringify(pendingData));
        
        // Start 5-minute timer in DepositPage
        setShowDepositTimer(true);
        setDepositTimeLeft(300); // 5 minutes
        setDepositVerifying(true);
      }
      
      // Clear form
      setDepositData({ amount: "" }); 
      setTxHash(""); 
      setSelectedMethod(null);
      setDepositScreenshot(null);
      
      // Refresh data
      loadAllData();
      
      return true;
      
    } else {
      toast.dismiss(toastId);
      toast.error("Deposit submission failed");
      return false;
    }
  } catch (error) {
    // console.error("Deposit error:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Deposit submission failed");
    return false;
  } finally {
    setActionLoading(false);
  }
};

// In UserDashboard.jsx - Update handleCreateScanner

const handleCreateScanner = async () => {
  // ========== 1. BASIC VALIDATION ==========
if (!uploadAmount) {
toast.error("Please enter amount", {
  duration: 1000,
  style: {
    background: '#0A1F1A',
    border: '1px solid #ef4444/30',
    borderRadius: '12px',
    padding: '8px 12px',
    cursor: 'pointer', // Makes it swipeable
  },
});  return;
}

if (!selectedImage && !upiLink.trim()) {
  toast.error("Please add UPI ID or upload QR code (at least one required)");
  return;
}

  // ========== 2. AMOUNT VALIDATION ==========
  const amountNum = Number(uploadAmount);  // ✅ या line add करा
  
  if (amountNum <= 0) {
    toast.error("Please enter a valid amount");
    return;
  }

  // ✅ ADD THIS - MAX LIMIT CHECK
  if (amountNum > 10000) {
    toast.error(
      <div className="flex items-center gap-2">
        <AlertCircle size={20} className="text-red-500" />
        <div>
          <div className="font-bold">Maximum Amount Exceeded! ❌</div>
          <div className="text-xs">You can only create requests up to ₹10,000</div>
        </div>
      </div>,
      { duration: 1000 }
    );
    return;
  }

  // ========== 3. NO QR DETECTION - सरळ request करा ==========
  setActionLoading(true);
  const toastId = toast.loading("Creating pay request...");

  try {
    const res = await requestToPay(uploadAmount, selectedImage, upiLink);

    if (res?.scanner?._id) {
      const newRequest = {
        ...res.scanner,
        user: {
          _id: user._id,
          name: user.name,
          userId: user.userId
        },
        createdAt: res.scanner.createdAt || new Date().toISOString(),
        expiresAt: res.scanner.expiresAt || new Date(Date.now() + 10*60*1000).toISOString()
      };

      setScanners(prev => [newRequest, ...prev]);

      toast.dismiss(toastId);
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-[#00F5A0]" />
          <div>
            <div className="font-bold">Pay Request Created! 🎉</div>
            <div className="text-xs">Amount: ₹{uploadAmount}</div>
            {res.balance && (
              <div className="text-[10px] text-gray-400 mt-1">
                Remaining Balance: ₹{res.balance.remaining}
              </div>
            )}
          </div>
        </div>,
        { duration: 1000 }
      );

      setUploadAmount("");
      setSelectedImage(null);
      setIsRedeemMode(false);
      setActiveTab("Scanner");
       setUpiLink("");
      loadAllData();

    } else {
      toast.dismiss(toastId);
      toast.error(res?.message || "Failed to create request");
    }

  } catch (error) {
    toast.dismiss(toastId);
    
    // ✅ Handle insufficient balance error
    if (error.response?.data?.requiresDeposit) {
      const data = error.response.data;
      toast.error(
        <div className="flex items-center gap-3 bg-red-500/10 p-3 rounded-xl w-full max-w-md">
          <div className="bg-red-500/20 p-2 rounded-full flex-shrink-0">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-red-500">Insufficient Balance! ❌</div>
            <div className="text-xs text-gray-300 mt-1">
              You have <span className="text-[#00F5A0] font-bold">₹{data.currentBalance}</span> but need <span className="text-red-400 font-bold">₹{data.requiredAmount}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Shortfall: ₹{data.shortfall}
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setActiveTab("Deposit")}
                className="text-[10px] bg-[#00F5A0] text-black px-3 py-1.5 rounded-full font-bold"
              >
                DEPOSIT NOW
              </button>
              <button 
                onClick={() => setUploadAmount("")}
                className="text-[10px] bg-white/10 text-white px-3 py-1.5 rounded-full"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        </div>,
        { duration: 1000 }
      );
    } 
    // ✅ Handle max limit error from backend
    else if (error.response?.data?.maxLimit === 10000) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500" />
          <div>
            <div className="font-bold">Maximum ₹10,000 Only! ❌</div>
            <div className="text-xs">{error.response?.data?.message || "Please enter amount between ₹1 - ₹10,000"}</div>
          </div>
        </div>,
        { duration: 1000 }
      );
    }
    // ✅ Handle other errors
    else {
      toast.error(error.response?.data?.message || error.message || "Failed to create request");
    }
  } finally {
    setActionLoading(false);
  }
};

// Helper function to read image file
const readImageFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas to get image data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        resolve({
          data: imageData.data,
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
};

  const downloadQR = (s) => {
    const imageUrl = `https://cpay-link-backend.onrender.com${s.image}`;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `QR-${s.amount}-${s._id.slice(-4)}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Code Downloaded!', {
      duration: 1000,
      icon: '📥',
      style: {
        background: '#00F5A0',
        color: '#051510',
      }
    });
  };

 const handleCancelRequest = async (requestId) => {
  try {
    const toastId = toast.loading('Cancelling request...');
    
    // ✅ Import cancelRequest from apiService
    const { cancelRequest } = await import("../services/apiService");
    const res = await cancelRequest(requestId);
    
    toast.dismiss(toastId);
    
    if (res.message) {
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-[#00F5A0]" />
          <div>
            <div className="font-bold">Request Cancelled! ✅</div>
            <div className="text-xs">Your request has been cancelled</div>
          </div>
        </div>,
        { duration: 1000 }
      );
    }
    
    // Clear any timers
    if (requestTimer) {
      clearTimeout(requestTimer);
      setRequestTimer(null);
    }
    
    setTimerExpired(false);
    
    // Refresh the data
    loadAllData();
    
  } catch (error) {
    toast.dismiss();
    toast.error(
      <div className="flex items-center gap-2">
        <AlertCircle size={20} className="text-red-500" />
        <div>
          <div className="font-bold">Failed to Cancel! ❌</div>
          <div className="text-xs">{error.message || "Something went wrong"}</div>
        </div>
      </div>,
      { duration: 1000 }
    );
  }
};

const handleRedeemCashback = async () => {
  const cashbackWallet = wallets.find(w => w.type === "CASHBACK");
  
  // ✅ Check if cashback is sufficient
  if (!cashbackWallet || cashbackWallet.balance < 1000) {
    toast.error(
      <div className="flex items-center gap-2">
        <AlertCircle size={20} className="text-red-500" />
        <div>
          <div className="font-bold">Insufficient Cashback! ❌</div>
          <div className="text-xs">Need minimum ₹1000 cashback to redeem</div>
          <div className="text-xs text-gray-400 mt-1">
            Current balance: ₹{cashbackWallet?.balance || 0}
          </div>
        </div>
      </div>,
      { duration: 1000 }
    );
    return;
  }

  setShowRedeemModal(true);
};

  const confirmRedeem = async () => {
    if (!redeemAmount || Number(redeemAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const cashbackWallet = wallets.find(w => w.type === "CASHBACK");
    
    if (Number(redeemAmount) > cashbackWallet.balance) {
      toast.error("Insufficient cashback balance");
      return;
    }

    setShowRedeemModal(false);
    const toastId = toast.loading('Processing cashback redemption...');
    
    try {
      const res = await transferCashback(Number(redeemAmount));
      
      if (res) {
        toast.dismiss(toastId);
        toast.success(
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-[#00F5A0]" />
            <div>
              <div className="font-bold">Cashback Redeemed! 🎉</div>
              <div className="text-sm">₹{redeemAmount} transferred to INR wallet</div>
            </div>
          </div>,
          { duration: 1000 }
        );
        playNotificationSound('cashback');
        loadAllData();
        
        // Automatically switch to Scanner tab and set amount
        setActiveTab("Scanner");
        setUploadAmount(redeemAmount);
        setIsRedeemMode(true);
        setRedeemAmount("");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to redeem cashback");
    }
  };

// In UserDashboard.jsx - Update these functions

const handleActivateWallet = () => {
  // Reset local input
  setLocalInputLimit("");
  
  // ✅ Check current limit to suggest higher amount
  const currentLimit = dailyAcceptLimit || activationStatus.dailyLimit || 0;
  if (currentLimit > 0) {
    // Suggest current limit + 1000 or any reasonable increment
    setLocalInputLimit(currentLimit + 1000);
  }
  
  setShowActivationModal(true);
};

// const confirmActivation = async () => {
//   setShowActivationModal(false);
  
//   // Get current limit
//   const currentLimit = Number(dailyAcceptLimit || activationStatus.dailyLimit || 0);
  
//   // Calculate required amount based on whether it's new activation or increase
//   let requiredAmount;
//   let limitToSet;
//   let isIncrease = false;
  
//   if (walletActivated) {
//     // For increase: only pay for the difference
//     const additionalLimit = localInputLimit - currentLimit;
//     requiredAmount = calculateActivationAmount(additionalLimit);
//     limitToSet = localInputLimit; // New total limit
//     isIncrease = true;
//   } else {
//     // For new activation: pay for full limit
//     requiredAmount = calculateActivationAmount(localInputLimit);
//     limitToSet = localInputLimit;
    
//     // ✅ CHECK MINIMUM FOR FIRST TIME
//     if (requiredAmount < 50) {
//       toast.error("Minimum deposit for first activation is $50 USDT");
//       setLocalInputLimit("");
//       return;
//     }
//   }
  
//   // ✅ Store pending activation with proper info
//   localStorage.setItem("pendingActivation", JSON.stringify({
//     dailyLimit: limitToSet,
//     amount: requiredAmount,
//     timestamp: Date.now(),
//     depositPending: true,
//     depositSubmitted: false,
//     isIncrease: isIncrease,
//     previousLimit: isIncrease ? currentLimit : null
//   }));
  
//   // Redirect to Deposit tab with pre-filled amount
//   setActiveTab("Deposit");
  
//   // Set deposit amount to required amount
//   setDepositData({ 
//     amount: requiredAmount.toFixed(2), 
//     network: "TRC20" 
//   });
  
//   // Show appropriate message
//   toast.success(
//     <div className="flex items-center gap-2">
//       <ArrowRight size={20} className="text-[#00F5A0]" />
//       <div>
//         <div className="font-bold">
//           {walletActivated ? 'Please Deposit Additional ' : 'Please Deposit '}
//           {requiredAmount} USDT
//         </div>
//         <div className="text-xs">
//           {walletActivated 
//             ? `For increasing limit from ₹${currentLimit.toLocaleString()} to ₹${localInputLimit.toLocaleString()}`
//             : `For ₹${localInputLimit.toLocaleString()} daily limit`}
//         </div>
//         <div className="text-xs text-gray-400 mt-1">
//           After deposit submission, wallet will update in 5 minutes ⏱️
//         </div>
//       </div>
//     </div>,
//     { duration: 6000 }
//   );
  
//   // Reset local input
//   setLocalInputLimit("");
// };



// In UserDashboard.jsx - Update confirmActivation function

const confirmActivation = async () => {
  setShowActivationModal(false);
  
  // Get current limit
  const currentLimit = Number(dailyAcceptLimit || activationStatus.dailyLimit || 0);
  
  // Calculate required amount based on whether it's new activation or increase
  let requiredAmount;
  let limitToSet;
  let isIncrease = false;
  
  if (walletActivated) {
    // ✅ FOR INCREASE: No minimum check needed
    const additionalLimit = localInputLimit - currentLimit;
    requiredAmount = calculateActivationAmount(additionalLimit);
    limitToSet = localInputLimit; // New total limit
    isIncrease = true;
    
    // ❌ REMOVE MINIMUM CHECK FOR INCREASE
    // Only check if amount is valid (not zero or negative)
    if (requiredAmount <= 0) {
      toast.error("Please enter a valid limit increase");
      setLocalInputLimit("");
      return;
    }
    
  } else {
    // ✅ FOR FIRST ACTIVATION: Need $10 minimum
    requiredAmount = calculateActivationAmount(localInputLimit);
    limitToSet = localInputLimit;
    
    // ✅ CHECK MINIMUM ONLY FOR FIRST TIME
    if (requiredAmount < 10) {
      toast.error("Minimum deposit for first activation is $10 USDT");
      setLocalInputLimit("");
      return;
    }
  }
  
  // ✅ Store pending activation with proper info
  localStorage.setItem("pendingActivation", JSON.stringify({
    dailyLimit: limitToSet,
    amount: requiredAmount,
    timestamp: Date.now(),
    depositPending: true,
    depositSubmitted: false,
    isIncrease: isIncrease,
    previousLimit: isIncrease ? currentLimit : null
  }));
  
  // Redirect to Deposit tab with pre-filled amount
  setActiveTab("Deposit");
  
  // Set deposit amount to required amount
  setDepositData({ 
    amount: requiredAmount.toFixed(2), 
    network: "TRC20" 
  });
  
  // Show appropriate message
  toast.success(
    <div className="flex items-center gap-2">
      <ArrowRight size={20} className="text-[#00F5A0]" />
      <div>
        <div className="font-bold">
          {walletActivated ? 'Please Deposit Additional ' : 'Please Deposit '}
          {requiredAmount} USDT
        </div>
        <div className="text-xs">
          {walletActivated 
            ? `For increasing limit from ₹${currentLimit.toLocaleString()} to ₹${localInputLimit.toLocaleString()}`
            : `For ₹${localInputLimit.toLocaleString()} daily limit`}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          After deposit submission, wallet will update in 5 minutes ⏱️
        </div>
      </div>
    </div>,
    { duration: 1000 }
  );
  
  // Reset local input
  setLocalInputLimit("");
};
  const handleConfirmPayment = async () => {
    if (!paymentScreenshot) {
      toast.error("Please upload screenshot");
      return;
    }
    
    setActionLoading(true);
    const toastId = toast.loading('Submitting proof...');
    
    const res = await submitPayment(selectedScanner, paymentScreenshot);
    if (res) {
      toast.dismiss(toastId);
      toast.success(
        <div>
          <div className="font-bold">Proof Submitted! 📸</div>
          <div className="text-sm text-[#00F5A0] mt-1">
            Waiting for confirmation
          </div>
        </div>,
        { duration: 1000 }
      );
      
      setSelectedScanner(null); 
      setPaymentScreenshot(null);
      loadAllData();
    } else {
      toast.dismiss(toastId);
      toast.error("Failed to submit proof");
    }
    setActionLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#051510] flex flex-col items-center justify-center text-[#00F5A0] font-black italic">
      <Loader className="animate-spin mb-4" size={40} />
      SYNCING...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col md:flex-row font-sans overflow-x-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A1F1A] border-b border-white/5 sticky top-0 z-[100]">
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-[#00F5A0]" /><span className="font-bold text-xl italic">CpayLink</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg relative">
          <Menu className="text-[#00F5A0]" />
          {activeRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* SIDEBAR / MOBILE DRAWER */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[200] transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsSidebarOpen(false)} />
      
      <aside className={`fixed md:relative inset-y-0 left-0 z-[210] w-72 bg-[#051510] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 transform md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 px-2">
            <div className="bg-[#00F5A0] p-1.5 rounded-lg text-[#051510]"><Zap size={20} /></div>
            <span className="text-2xl font-black italic">CpayLink</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarLink 
            icon={<LayoutGrid size={20} />} 
            label="Dashboard" 
            active={activeTab === "Dashboard"} 
            onClick={() => { setActiveTab("Dashboard"); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<ScanLine size={20} />} 
            label="Scanner Queue" 
            active={activeTab === "Scanner"} 
            badge={activeRequestsCount}
            highlight={activeRequestsCount > 0}
            onClick={() => { setActiveTab("Scanner"); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<Wallet size={20} />} 
            label="Deposit" 
            active={activeTab === "Deposit"} 
            onClick={() => { setActiveTab("Deposit"); setIsSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<ArrowRightLeft size={20} />} 
            label="History" 
            active={activeTab === "History"} 
            onClick={() => { setActiveTab("History"); setIsSidebarOpen(false); }} 
          />
          <SidebarLink
            icon={<Zap size={20} />}
            label="Referral"
            active={activeTab === "Referral"}
            onClick={() => { setActiveTab("Referral"); setIsSidebarOpen(false); }}
          />
          <SidebarLink
  icon={<User size={20} />}
  label="Profile"
  active={activeTab === "Profile"}
  onClick={() => { setActiveTab("Profile"); setIsSidebarOpen(false); }}
/>
          <SidebarLink 
  icon={<HelpCircle size={20} />} 
  label="Help" 
  active={activeTab === "Help"} 
  onClick={() => { setActiveTab("Help"); setIsSidebarOpen(false); }} 
/>

          <div className="pt-10 border-t border-white/5 mt-10">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold italic transition-all hover:bg-red-500/10 rounded-xl">
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
        {/* DESKTOP HEADER */}
        <header className="hidden md:flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            {activeTab === "Scanner" ? "Scanner Queue" : activeTab}
          </h1>
          <div className="flex items-center gap-4">
            {activeRequestsCount > 0 && activeTab !== "Scanner" && (
              <button 
                onClick={() => setActiveTab("Scanner")}
                className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-xs font-bold animate-pulse"
              >
                <Bell size={14} />
                {activeRequestsCount} New Request{activeRequestsCount > 1 ? 's' : ''}
              </button>
            )}
            <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-full border border-white/10">
              <div>
                <p className="text-[8px] text-[#00F5A0] font-black italic uppercase tracking-widest">
                  ID: {user.userId || user._id?.slice(-6)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === "Dashboard" && (
          <OverviewPage 
            wallets={wallets} 
            transactions={transactions} 
            setActiveTab={setActiveTab} 
            onRedeem={handleRedeemCashback} 
          />
        )}

{activeTab === "Scanner" && (
  <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
    {/* Stats Row - With better labels */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#0A1F1A] border border-white/10 p-4 rounded-2xl">
        <p className="text-[10px] text-gray-500 font-bold">Available to Accept</p>
        <h3 className="text-2xl font-black text-[#00F5A0]">{activeRequestsCount}</h3>
        <p className="text-[8px] text-gray-600 mt-1">Valid for 10 minutes each</p>
      </div>
      <div className="bg-[#0A1F1A] border border-white/10 p-4 rounded-2xl">
        <p className="text-[10px] text-gray-500 font-bold">My Active Requests</p>
        <h3 className="text-2xl font-black text-orange-500">{myActiveRequestsCount}</h3>
        <p className="text-[8px] text-gray-600 mt-1">Waiting for acceptance</p>
      </div>
    </div>

    {/* 7-DAY LIMIT STATUS - FIXED */}
    <div className="bg-[#0A1F1A] border border-white/10 p-4 rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
        <span className="text-xs text-gray-400">7-Day Limit Status</span>
        {walletActivated && activationStatus?.expiryDate && (
          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
            Expires: {new Date(activationStatus.expiryDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Total 7-Day Limit - CORRECT: dailyLimit */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400">Total 7-Day Limit</span>
        <span className="text-sm font-bold text-[#00F5A0]">
          ₹{Number(dailyAcceptLimit || activationStatus.dailyLimit || 0).toLocaleString()}
        </span>
      </div>
      
      {/* Used in Last 7 Days - CORRECT: sevenDayTotal */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400">Used (Last 7 Days)</span>
        <span className="text-sm font-bold text-orange-500">
          ₹{Number(activationStatus.sevenDayTotal || todayAcceptedTotal || 0).toLocaleString()}
        </span>
      </div>
      
      {/* Remaining for 7 Days - CORRECT: remaining */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
        <span className="text-xs text-gray-400">Remaining for 7 Days</span>
        <span className="text-sm font-bold text-[#00F5A0]">
          ₹{Number(activationStatus.remaining || 
              (dailyAcceptLimit - todayAcceptedTotal) || 0).toLocaleString()}
          {(dailyAcceptLimit || activationStatus.dailyLimit) > 0 && (
            <span className="text-[10px] text-gray-500 ml-2">
              ({Math.round((Number(todayAcceptedTotal || 0) / Number(dailyAcceptLimit || activationStatus.dailyLimit)) * 100)}% used)
            </span>
          )}
        </span>
      </div>

      {/* ACTIVATION BUTTON - जर wallet activated नसेल तर */}
      {!walletActivated && (
        <button
          onClick={() => setActiveTab("Deposit")}
          className="w-full bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black py-4 rounded-xl font-black italic text-sm hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all mb-3 animate-pulse"
        >
          ⚡ ACTIVATE WALLET FIRST - GO TO DEPOSIT
        </button>
      )}
      
      {/* Change Limit Button */}
      {walletActivated && (
        <button
          onClick={handleActivateWallet}
          className="w-full bg-blue-500/20 text-blue-500 py-2 rounded-xl font-black text-xs hover:bg-blue-500/30 transition-all border border-blue-500/20 mb-3"
        >
          Change 7-Day Limit (Pay Additional Amount)
        </button>
      )}
      
      {/* Wallet Active Message - CORRECT: remaining */}
      {walletActivated && (
        <div className="bg-green-500/10 text-green-500 p-3 rounded-xl text-xs font-bold text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle size={14} />
            <span>Wallet Active for 7 Days</span>
          </div>
          <div className="text-[10px] text-gray-400">
            ₹{Number(activationStatus.remaining || 
                (dailyAcceptLimit - todayAcceptedTotal) || 0).toLocaleString()} remaining this week
          </div>
        </div>
      )}
    </div>

    {/* TAB COMPONENT - New Tabbed Interface */}
    <div className="space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-2 bg-[#0A1F1A] p-2 rounded-2xl border border-white/10">
        <button
          onClick={() => setScannerSubTab("pay")}
          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            scannerSubTab === "pay"
              ? "bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <UploadCloud size={18} />
          Pay My Bill
          {myActiveRequestsCount > 0 && scannerSubTab !== "pay" && (
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {myActiveRequestsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setScannerSubTab("accept")}
          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            scannerSubTab === "accept"
              ? "bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Zap size={18} />
          Accept Bill Payments
          {activeRequestsCount > 0 && scannerSubTab !== "accept" && (
            <span className="bg-[#00F5A0] text-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
              {activeRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* PAY MY BILL TAB CONTENT */}
      {scannerSubTab === "pay" && (
        <div className="space-y-6">
          {/* Create Pay Request */}
          <div className="bg-[#0A1F1A] border border-white/10 p-6 rounded-[2rem]">
            <h2 className="text-xl font-black text-[#00F5A0] mb-6 italic flex items-center gap-2">
              <UploadCloud size={20} /> Pay My Bill
            </h2>

            {/* Redeem Mode Indicator */}
            {isRedeemMode && (
              <div className="mb-4 p-3 bg-[#00F5A0]/10 border border-[#00F5A0]/20 rounded-xl">
                <p className="text-[10px] text-[#00F5A0] font-bold flex items-center gap-1">
                  <Zap size={12} />
                  Redeemed Cashback Mode: Amount fixed at ₹{uploadAmount}
                </p>
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-2">
              <input
                type="number"
                placeholder="Enter Amount (₹1 - ₹10,000)"
                value={uploadAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setUploadAmount("");
                    return;
                  }
                  const num = Number(value);
                  if (num > 10000) {
                    toast.error("Maximum amount is ₹10,000 per request");
                    return;
                  }
                  if (num < 1) {
                    toast.error("Minimum amount is ₹1");
                    return;
                  }
                  setUploadAmount(value);
                }}
                disabled={isRedeemMode}
                min="1"
                max="10000"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 font-bold outline-none text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              {/* Min/Max Indicator */}
              <div className="flex justify-between items-center mt-2 px-2">
                <span className="text-[10px] text-gray-500">Min: ₹1</span>
                <span className="text-[10px] text-orange-400 font-bold">Max: ₹10,000</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">UPI ID/Payment Link(Optional)</label>
              <input
                type="text"
                placeholder="Enter UPI ID or payment link(e.g.merchant@upi)"
                value={upiLink}
                onChange={(e) => setUpiLink(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 font-bold outline-none text-xs"
              />
              <p className="text-[8px] text-gray-500 mt-1">
                This will help users make payment directly via UPI
              </p>
            </div>
            
            {/* QR Code Upload Options */}
            <div className="space-y-3 mb-4">
              <label className="block bg-black/40 border border-white/10 rounded-xl py-4 text-center cursor-pointer font-bold text-sm hover:bg-black/60 transition-all group">
                <Camera size={18} className="inline mr-2 text-[#00F5A0] group-hover:scale-110 transition-transform" /> 
                Take Photo
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  capture="environment" 
                  onChange={(e) => setSelectedImage(e.target.files[0])} 
                  className="hidden" 
                />
              </label>
              
              <label className="block bg-black/40 border border-white/10 rounded-xl py-4 text-center cursor-pointer font-bold text-sm hover:bg-black/60 transition-all group">
                <UploadCloud size={18} className="inline mr-2 text-[#00F5A0] group-hover:scale-110 transition-transform" /> 
                Upload from Gallery
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview */}
            {selectedImage && (
              <div className="mb-4">
                <div className="relative inline-block">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    className="w-full max-w-[180px] mx-auto rounded-xl border-2 border-[#00F5A0] object-cover aspect-square"
                    alt="preview"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-center text-xs text-[#00F5A0] mt-2 truncate">
                  {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}

            {/* Disclaimer and Terms */}
            <div className="mb-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-gray-400 mb-3 font-bold">DISCLAIMER:</p>
                <ul className="text-[10px] text-gray-500 list-disc list-inside mb-3 space-y-1.5">
                  <li>You are creating a pay request for <span className="text-[#00F5A0]">₹{uploadAmount || '0'}</span></li>
                  <li>Maximum amount per request: <span className="text-orange-400 font-bold">₹10,000</span></li>
                  <li>This request will expire in <span className="text-yellow-500">10 minutes</span> if not accepted</li>
                  <li>You must have sufficient <span className="text-[#00F5A0]">INR balance</span> to create request</li>
<li className="text-yellow-500">⚠️ Add UPI ID or upload Merchant QR code (at least one required)</li>
                </ul>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createTermsAccepted}
                    onChange={(e) => setCreateTermsAccepted(e.target.checked)}
                    className="w-4 h-4 accent-[#00F5A0]"
                  />
                  <span className="text-xs text-gray-300">I agree to the terms and conditions</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleCreateScanner}
disabled={actionLoading || !uploadAmount || (!selectedImage && !upiLink.trim()) || !createTermsAccepted}
             className={`w-full py-4 rounded-2xl font-black italic ${
  actionLoading || !uploadAmount || (!selectedImage && !upiLink.trim()) || !createTermsAccepted
    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
    : "bg-[#00F5A0] text-black hover:bg-[#00d88c] active:scale-95 transition-all"
}`}
            >
              {actionLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  PROCESSING...
                </span>
              ) : (
                "POST TO BILL PAYMENTS"
              )}
            </button>
          </div>

          {/* My Bill Payments Section */}
          <div>
            <h2 className="text-lg font-black text-white/70 italic mb-4 flex items-center gap-2">
              My Bill Payments
              {myActiveRequestsCount > 0 && (
                <span className="bg-orange-500/10 text-orange-500 text-[10px] px-2 py-1 rounded-full">
                  {myActiveRequestsCount} active
                </span>
              )}
              {scanners.filter((s) => {
                const ownerId = typeof s.user === "object" ? s.user?._id : s.user;
                return String(ownerId) === String(user.id || user._id) && s.status !== "ACTIVE";
              }).length > 0 && (
                <span className="bg-gray-500/10 text-gray-400 text-[10px] px-2 py-1 rounded-full">
                  {
                    scanners.filter((s) => {
                      const ownerId = typeof s.user === "object" ? s.user?._id : s.user;
                      return String(ownerId) === String(user.id || user._id) && s.status !== "ACTIVE";
                    }).length
                  } completed/expired
                </span>
              )}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scanners
                .filter((s) => {
                  const ownerId = typeof s.user === "object" ? s.user?._id : s.user;
                  return String(ownerId) === String(user.id || user._id);
                })
                .map((s) => (
                  <RequestCard
                    key={s._id}
                    s={s}
                    user={user}
                    loadAllData={loadAllData}
                    setSelectedScanner={setSelectedScanner}
                    handleCancelRequest={handleCancelRequest}
                    walletActivated={walletActivated}
                    acceptTermsAccepted={acceptTermsAccepted}
                    onActivateWallet={handleActivateWallet}
                  />
                ))}

              {scanners.filter((s) => {
                const ownerId = typeof s.user === "object" ? s.user?._id : s.user;
                return String(ownerId) === String(user.id || user._id);
              }).length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-600 font-black italic">No Bill Payments Created</p>
                  <p className="text-[10px] text-gray-700 mt-2">
                    Create your first payment request above
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACCEPT BILL PAYMENTS TAB CONTENT */}
      {scannerSubTab === "accept" && (
        <div>
          {/* SLOT FILTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 mb-6">
            {slots.map((slot) => {
              const hasRequestsInSlot = scanners
                .filter((s) => String(s.user?._id) !== String(user.id || user._id))
                .some((s) => s.amount >= slot.min && s.amount <= slot.max);
              
              return (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlot(slot.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all relative ${
                    activeSlot === slot.id
                      ? "bg-[#00F5A0] text-black border-[#00F5A0]"
                      : hasRequestsInSlot
                        ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        : "bg-white/5 text-gray-400 border-white/10 hover:border-[#00F5A0]/30"
                  }`}
                >
                  {slot.label}
                  {hasRequestsInSlot && activeSlot !== slot.id && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  )}
                  {hasRequestsInSlot && (
                    <span className="ml-1 text-[8px] bg-red-500 text-white px-1 rounded-full">
                      {scanners
                        .filter((s) => String(s.user?._id) !== String(user.id || user._id))
                        .filter((s) => s.amount >= slot.min && s.amount <= slot.max).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Accept Terms */}
          {activeRequestsCount > 0 && (
            <div className="mb-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-gray-400 mb-3 font-bold">BEFORE ACCEPTING:</p>
                <ul className="text-[10px] text-gray-500 list-disc list-inside mb-3 space-y-1">
                  <li>You have 10 minutes to complete the payment after accepting</li>
                  <li>Upload clear screenshot of payment proof</li>
                  <li>Wallet must be activated to accept requests</li>
                  <li>Each request expires in 10 minutes if not accepted</li>
                  <li className="text-orange-400 font-bold">Maximum acceptance amount: ₹10,000 per request</li>
                </ul>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTermsAccepted}
                    onChange={(e) => setAcceptTermsAccepted(e.target.checked)}
                    className="w-4 h-4 accent-[#00F5A0]"
                  />
                  <span className="text-xs text-gray-300">
                    I agree to the terms and conditions
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* REQUEST GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom">
            {filteredRequests.map((s) => (
              <RequestCard
                key={s._id}
                s={s}
                user={user}
                loadAllData={loadAllData}
                setSelectedScanner={setSelectedScanner}
                handleCancelRequest={handleCancelRequest}
                walletActivated={walletActivated}
                acceptTermsAccepted={acceptTermsAccepted}
                onActivateWallet={handleActivateWallet}
              />
            ))}

            {filteredRequests.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-600 font-black italic uppercase">
                  No Requests In This Slot
                </p>
                <p className="text-[10px] text-gray-700 mt-2">
                  Try another amount range
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
)}

{activeTab === "Deposit" && (
  <DepositPage 
    paymentMethods={paymentMethods} 
    selectedMethod={selectedMethod} 
    setSelectedMethod={setSelectedMethod} 
    depositData={depositData} 
    setDepositData={setDepositData} 
    txHash={txHash} 
    setTxHash={setTxHash} 
    setDepositScreenshot={setDepositScreenshot} 
    handleDepositSubmit={handleDepositSubmit} 
    actionLoading={actionLoading} 
    setActiveTab={setActiveTab}
    loadAllData={loadAllData}
    // Timer props
    showDepositTimer={showDepositTimer}
    depositTimeLeft={depositTimeLeft}
    depositVerifying={depositVerifying}
    setShowDepositTimer={setShowDepositTimer}
    setDepositTimeLeft={setDepositTimeLeft}
    setDepositVerifying={setDepositVerifying}
  />
)}
        
{activeTab === "History" && <HistoryPage transactions={transactions} />}
        
        {activeTab === "Referral" && (
          <ReferralPage 
            referralData={referralData}
            teamStats={teamStats}
          />
        )}
        {activeTab === "Profile" && <ProfilePage />}

        {activeTab === "Help" && (
  <HelpPage />
)}

        <div className="h-20 md:hidden" />
      </main>

      {/* MODAL - Submit Transaction Proof */}
      {selectedScanner && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[300] p-4 backdrop-blur-sm">
          <div className="bg-[#0A1F1A] p-6 md:p-8 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-xl font-black text-[#00F5A0] mb-6 italic">Submit Transaction Proof</h3>
            <input type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files[0])} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 mb-6 text-sm" />
            <div className="flex gap-4">
              <button onClick={() => setSelectedScanner(null)} className="flex-1 bg-white/5 py-4 rounded-2xl font-black">CANCEL</button>
              <button onClick={handleConfirmPayment} disabled={actionLoading} className="flex-1 bg-[#00F5A0] text-black py-4 rounded-2xl font-black">SUBMIT</button>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Cashback Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[400] p-4 backdrop-blur-sm">
          <div className="bg-[#0A1F1A] p-6 md:p-8 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-xl font-black text-[#00F5A0] mb-4 italic">Redeem Cashback</h3>
            
            <div className="mb-6">
              <p className="text-gray-400 mb-2 text-sm">Available Cashback:</p>
              <p className="text-2xl font-black text-[#00F5A0]">
                ₹{wallets.find(w => w.type === "CASHBACK")?.balance.toLocaleString() || 0}
              </p>
            </div>
            
            <input
              type="number"
              placeholder="Enter amount to redeem"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-4 font-bold outline-none text-lg"
            />
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-6">
              <p className="text-yellow-500 text-xs font-bold flex items-center gap-2">
                <Clock size={14} />
                This amount will be used to create a pay request automatically.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemAmount("");
                }} 
                className="flex-1 bg-white/5 py-4 rounded-2xl font-black hover:bg-white/10 transition-all"
              >
                CANCEL
              </button>
              <button 
                onClick={confirmRedeem} 
                className="flex-1 bg-[#00F5A0] text-black py-4 rounded-2xl font-black hover:bg-[#00d88c] transition-all"
              >
                REDEEM
              </button>
            </div>
          </div>
        </div>
      )}

{/* Wallet Activation Modal - CORRECTED with Minimum Deposit */}
{/* Wallet Activation Modal */}
{showActivationModal && (
  <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[400] p-4 backdrop-blur-sm">
    <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] w-full max-w-md border border-white/10 shadow-2xl">
      <h3 className="text-xl font-black text-[#00F5A0] mb-4 italic">
        {walletActivated ? 'Increase 7-Day Limit' : 'Activate Wallet for 7 Days'}
      </h3>
      
      <p className="text-gray-400 mb-4 text-sm">
        {walletActivated 
          ? 'Enter your new 7-day accept limit. Additional payment required for increase.'
          : 'Enter your 7-day accept limit. Valid for 7 days from activation.'}
      </p>

      <div className="mb-6">
        <label className="text-xs text-gray-500 mb-2 block">7-Day Accept Limit (₹)</label>
        <input
          type="number"
          min={walletActivated ? (Number(dailyAcceptLimit || activationStatus.dailyLimit || 0) + 1) : 1}
          value={localInputLimit}
          onChange={(e) => {
            const newLimit = e.target.value === "" ? "" : Number(e.target.value);
            setLocalInputLimit(newLimit);
          }}
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-lg outline-none focus:border-[#00F5A0]"
          placeholder={walletActivated ? "Enter higher limit (e.g. 50000)" : "Enter 7-day limit (e.g. 35000)"}
        />
        <p className="text-xs text-gray-500 mt-1">
          {walletActivated 
            ? `Current limit: ₹${Number(dailyAcceptLimit || activationStatus.dailyLimit || 0).toLocaleString()}`
            : 'You can change this limit anytime by paying additional amount'}
        </p>
        
        {localInputLimit && localInputLimit > 0 ? (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
            {/* Show calculation */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-400">Your New 7-Day Limit:</p>
              <p className="text-sm font-bold text-white">₹{localInputLimit.toLocaleString()}</p>
            </div>
            
            {/* For increase: show additional limit */}
            {walletActivated && (
              <div className="flex justify-between items-center mb-2 pt-2 border-t border-blue-500/20">
                <p className="text-xs text-gray-400">Additional Limit:</p>
                <p className="text-sm font-bold text-green-400">
                  +₹{(localInputLimit - Number(dailyAcceptLimit || activationStatus.dailyLimit || 0)).toLocaleString()}
                </p>
              </div>
            )}
            
            {/* 10% in INR */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-400">10% in INR:</p>
              <p className="text-sm font-bold text-orange-400">
                ₹{(localInputLimit * 0.1).toFixed(2)}
              </p>
            </div>
            
            {/* Exchange Rate */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-400">Exchange Rate:</p>
              <p className="text-sm font-bold text-[#00F5A0]">1 USDT = ₹95</p>
            </div>
            
            {/* Amount to pay in USDT */}
            <div className="flex justify-between items-center pt-2 border-t border-blue-500/20">
              <p className="text-xs text-gray-400">
                {walletActivated ? 'Additional Payment:' : 'Activation Amount:'}
              </p>
              <p className="text-lg font-black text-[#00F5A0]">
                ${calculateActivationAmount(
                  walletActivated 
                    ? localInputLimit - Number(dailyAcceptLimit || activationStatus.dailyLimit || 0)
                    : localInputLimit
                )} USDT
              </p>
            </div>
            
            {/* ✅ MINIMUM DEPOSIT WARNING - SHOW ONLY FOR FIRST TIME */}
            {!walletActivated && calculateActivationAmount(localInputLimit) < 10 && (
              <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle size={12} />
                  Minimum deposit for first activation is $10 USDT
                </p>
                <p className="text-[8px] text-red-400/70 mt-1">
                  Current: ${calculateActivationAmount(localInputLimit)} USDT
                </p>
              </div>
            )}
            
            {/* ✅ SHOW MESSAGE FOR INCREASE - NO MINIMUM */}
            {walletActivated && (
              <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                  <CheckCircle size={12} />
                  No minimum deposit required for limit increase
                </p>
                <p className="text-[8px] text-green-400/70 mt-1">
                  Pay any amount to increase your limit
                </p>
              </div>
            )}
            
            {/* Calculation Explanation */}
            <p className="text-[10px] text-gray-500 mt-2 text-center bg-black/20 p-2 rounded-lg">
              ⚡ {(localInputLimit * 0.1).toFixed(2)} INR ÷ 95 = {calculateActivationAmount(
                walletActivated 
                  ? localInputLimit - Number(dailyAcceptLimit || activationStatus.dailyLimit || 0)
                  : localInputLimit
              )} USDT
            </p>
            
            {/* Validity Period */}
            <p className="text-[10px] text-green-500 mt-2 text-center">
              ✅ Valid for 7 days from activation
            </p>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-gray-500/10 rounded-xl border border-gray-500/20">
            <p className="text-xs text-gray-400 text-center">
              {walletActivated 
                ? 'Enter your new 7-day limit to see additional payment required'
                : 'Enter your 7-day limit to see activation amount'}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-6">
        <p className="text-yellow-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={14} />
          {walletActivated 
            ? 'After successful additional deposit, your 7-day limit will be increased automatically'
            : 'After successful deposit, your wallet will be activated for 7 days automatically'}
        </p>
        {/* ✅ Show different messages for first time vs increase */}
        {!walletActivated && (
          <p className="text-[8px] text-yellow-500/70 mt-1">
            ⚡ First activation requires minimum $10 USDT deposit
          </p>
        )}
        {walletActivated && (
          <p className="text-[8px] text-yellow-500/70 mt-1">
            💰 No minimum deposit required for limit increase
          </p>
        )}
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={() => {
            setShowActivationModal(false);
            setLocalInputLimit("");
          }} 
          className="flex-1 bg-white/5 py-4 rounded-2xl font-black hover:bg-white/10 transition-all"
        >
          CANCEL
        </button>
        <button 
          onClick={confirmActivation}
          disabled={
            !localInputLimit || 
            localInputLimit <= 0 || 
            (walletActivated && localInputLimit <= Number(dailyAcceptLimit || activationStatus.dailyLimit || 0)) ||
            // ✅ Disable only for first time if amount < $10
            (!walletActivated && calculateActivationAmount(localInputLimit) < 10)
          }
          className={`flex-1 py-4 rounded-2xl font-black transition-all ${
            !localInputLimit || 
            localInputLimit <= 0 || 
            (walletActivated && localInputLimit <= Number(dailyAcceptLimit || activationStatus.dailyLimit || 0)) ||
            (!walletActivated && calculateActivationAmount(localInputLimit) < 10)
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#00F5A0] text-black hover:bg-[#00d88c]"
          }`}
        >
          {walletActivated ? 'PROCEED TO ADDITIONAL PAYMENT' : 'PROCEED TO DEPOSIT'}
        </button>
      </div>
    </div>
  </div>
)}



 {/* <ChatBot /> */}
    </div>
  );
}



// SidebarLink Component
const SidebarLink = ({ icon, label, active, onClick, badge, highlight }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-base relative ${
      active 
        ? "bg-[#00F5A0]/10 text-[#00F5A0]" 
        : highlight && badge > 0
          ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 animate-pulse"
          : "text-gray-400 hover:text-white"
    }`}
  >
    <div className="flex items-center gap-4">
      {icon} <span>{label}</span>
    </div>
    {badge > 0 && (
      <span className={`${
        highlight ? 'bg-orange-500 text-white' : 'bg-[#00F5A0] text-[#051510]'
      } text-[10px] px-2 py-0.5 rounded-full font-black shadow-[0_0_10px_#00F5A0]`}>
        {badge}
      </span>
    )}
    {highlight && badge > 0 && !active && (
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
    )}
  </button>
);

const OverviewPage = ({ wallets, transactions, setActiveTab, onRedeem }) => {
  const usdt = wallets.find(w => w.type === "USDT")?.balance || 0;
  const inrWallet = wallets.find(w => w.type === "INR");
  const inr = inrWallet?.balance || 0;
  const heldINR = inrWallet?.heldBalance || 0;
  const availableINR = inrWallet?.availableBalance ?? inr;
  const nextRelease = inrWallet?.nextReleaseAt;
  const cb = wallets.find(w => w.type === "CASHBACK")?.balance || 0;
  
  // ✅ Check if cashback is sufficient for redemption (minimum ₹1000)
  const canRedeemCashback = cb >= 1000;

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* USDT Wallet */}
        <WalletCard
          label="USDT Wallet"
          val={`$${usdt.toFixed(2)}`}
          sub={`≈ ₹${(usdt * 95).toLocaleString()}`}
        />

        {/* INR Wallet - held balance सहित */}
        <div className="p-6 md:p-8 rounded-[2rem] bg-[#00F5A0] text-black shadow-[0_10px_30px_rgba(0,245,160,0.2)]">
          <p className="text-[10px] font-black uppercase mb-2 text-black/50">INR Wallet</p>
          <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter">
            ₹{availableINR.toLocaleString()}
          </h3>
          <p className="text-[10px] font-bold opacity-60 italic">Available to spend</p>

          {heldINR > 0 && (
            <div className="mt-3 bg-black/10 rounded-xl p-3">
              <p className="text-[11px] font-black flex items-center gap-1.5">
                <Clock size={11} />
                ₹{heldINR.toLocaleString()} Unlocking Shortly
              </p>
              <p className="text-[9px] opacity-70 mt-0.5">
                New deposit — 12hr Cooling Period
                {nextRelease && (
                  <span className="block">
                    Releases: {new Date(nextRelease).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Cashback Wallet - Only show redeem button if balance >= 1000 */}
        <WalletCard
          label="Cashback"
          val={`₹${cb.toLocaleString()}`}
          sub={cb >= 1000 ? "Ready to redeem" : "Need atleast ₹1000 to redeem"}
          showRedeem={cb >= 1000}  // ✅ Only show redeem if balance >= 1000
          onRedeem={onRedeem}
        />
      </div>

      <div className="flex gap-4">
        <ActionButton icon={<PlusCircle />} label="Deposit" onClick={() => setActiveTab("Deposit")} />
        <ActionButton icon={<ScanLine />} label="Scanner Queue" primary onClick={() => setActiveTab("Scanner")} />
      </div>

      {/* Super Hours Banner */}
      <SuperHoursBanner />

      <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] p-6 md:p-8">
        <h3 className="font-black italic mb-6">Recent Ledger</h3>
        <div className="space-y-2">
          {transactions.slice(0, 5).map(tx => (
            <TransactionRow
              key={tx._id}
              merchant={tx.type}
              date={new Date(tx.createdAt).toLocaleDateString()}
              amt={tx.amount}
              status="SUCCESS"
              type={tx.type}
              meta={tx.meta || {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Add this component near the top of the file (outside OverviewPage):
const SuperHoursBanner = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  
  const h = now.getHours(), m = now.getMinutes();
  const totalMin = h * 60 + m;
  const inWindow1 = totalMin >= 720 && totalMin < 900;  // 12pm-3pm
  const inWindow2 = totalMin >= 1080 && totalMin < 1260; // 6pm-9pm
  const isActive = inWindow1 || inWindow2;

  const nextWindow = () => {
    if (totalMin < 720) return "12:00 PM";
    if (totalMin < 1080) return "6:00 PM";
    return "12:00 PM tomorrow";
  };

  return (
    <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
      isActive 
        ? "bg-yellow-500/10 border-yellow-500/30 animate-pulse" 
        : "bg-white/5 border-white/10"
    }`}>
      <Zap size={20} className={isActive ? "text-yellow-400" : "text-gray-500"} />
      <div className="flex-1">
        <p className="text-xs font-bold">
          {isActive 
            ? "⚡ SUPER HOURS ACTIVE NOW!" 
            : `Super Hours: 12pm–3pm & 6pm–9pm`}
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5">
          {isActive 
            ? `Window: ${inWindow1 ? "12:00 PM – 3:00 PM" : "6:00 PM – 9:00 PM"}` 
            : `Next: ${nextWindow()}`}
        </p>
      </div>
      {isActive && (
        <span className="text-[10px] bg-yellow-500 text-black px-2 py-1 rounded-full font-black">LIVE</span>
      )}
    </div>
  );
};

const RequestCard = ({ s, user, loadAllData, setSelectedScanner, handleCancelRequest, walletActivated, acceptTermsAccepted, onActivateWallet }) => {
  // ✅ System request असल्यास (user = null) isOwner false
  // const isOwner = s.user ? String(s.user?._id) === String(user._id) : false;

const getUserId = (u) => {
  if (!u) return null;
  if (typeof u === "string") return u;
  return u._id;
};

// ✅ user.id वापरा
const isOwner = String(getUserId(s.user)) === String(user.id || user._id);
  const isSystemRequest = !s.user;
  // const isSystemRequest = !s.user; // user = null म्हणजे system request
  const isAutoRequest = s.isAutoRequest || false;
  const [timeLeft, setTimeLeft] = useState(600);
  const [isExpired, setIsExpired] = useState(false);

  // ✅ NEW: Screenshot management states (added without affecting existing)
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [screenshots, setScreenshots] = useState([]);
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);
  const [updateReason, setUpdateReason] = useState("");
  const [uploading, setUploading] = useState(false);
  // Timer for ACCEPTED requests (time left to submit proof)
const [acceptTimeLeft, setAcceptTimeLeft] = useState(600); // 10 minutes default
const [isAcceptExpired, setIsAcceptExpired] = useState(false);

  // ✅ NEW: State to track if proof has been viewed
  const [proofViewed, setProofViewed] = useState(false);

  // ✅ NEW: Function to handle proof view
  const handleViewProof = () => {
    setProofViewed(true);
    window.open(`https://cpay-link-backend.onrender.com${s.paymentScreenshot}`);
  };

  // ✅ NEW: Fetch screenshots function
  const fetchScreenshots = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/scanner/screenshots/${s._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.screenshots) {
        setScreenshots(data.screenshots);
      }
    } catch (error) {
      // console.error("Error fetching screenshots:", error);
    }
  };

  // ✅ NEW: Handle screenshot update
  const handleUpdateScreenshot = async (file, index) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("scannerId", s._id);
    formData.append("screenshotIndex", index);
    formData.append("reason", updateReason || "Screenshot updated");
    formData.append("screenshot", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/scanner/update-screenshot`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Screenshot updated successfully!");
        fetchScreenshots();
        loadAllData();
        setUpdateReason("");
      } else {
        toast.error(data.message || "Failed to update screenshot");
      }
    } catch (error) {
      // console.error("Error updating screenshot:", error);
      toast.error("Failed to update screenshot");
    } finally {
      setUploading(false);
    }
  };

  // ✅ NEW: Open screenshot modal
  const openScreenshotModal = async () => {
    await fetchScreenshots();
    setShowScreenshotModal(true);
  };
  
  // Generate random user ID for system requests
  const getRandomUserId = () => {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${result}`;
  };

  useEffect(() => {
  if (s.utrRequested && String(s.acceptedBy?._id) === String(user._id)) {
    toast(
      <div>
        <div className="font-bold text-yellow-400">
          UTR Screenshot Requested
        </div>
        <div className="text-xs text-gray-400">
          Please upload your UTR payment screenshot
        </div>
      </div>,
      { duration: 1000 }
    );
  }
}, [s.utrRequested]);
  
  useEffect(() => {
    if (s.status === "ACTIVE" && !s.acceptedBy) {
      
      // ✅ Use expiresAt from backend instead of createdAt
      const expiryTime = new Date(s.expiresAt).getTime();
      const currentTime = new Date().getTime();
      let remaining = Math.floor((expiryTime - currentTime) / 1000);

      if (!remaining || remaining < 0) {
        remaining = 600; // fallback 10 min
      }
      setTimeLeft(remaining);
      setIsExpired(remaining === 0);

      if (remaining > 0) {
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsExpired(true);
              loadAllData();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }

    } else {
      setTimeLeft(0);

      setIsExpired(
        s.status === "EXPIRED" ||
        (s.status === "ACTIVE" &&
          !s.acceptedBy &&
          new Date(s.expiresAt).getTime() < new Date().getTime())
      );
    }

  }, [s.expiresAt, s.status, s.acceptedBy]);

  if (s.status === "COMPLETED") {
    return null;
  }

  if (s.status === "EXPIRED") {
    return null;
  }

  // ✅ Timer for ACCEPTED requests (time left to submit proof)
useEffect(() => {
  if (s.status === "ACCEPTED" && s.acceptedAt) {
    // Add 10 minutes to acceptedAt time
    const acceptedTime = new Date(s.acceptedAt).getTime();
    const expiryTime = acceptedTime + (10 * 60 * 1000); // 10 minutes from acceptance
    const currentTime = new Date().getTime();
    let remaining = Math.floor((expiryTime - currentTime) / 1000);

    if (remaining < 0) {
      setIsAcceptExpired(true);
      setAcceptTimeLeft(0);
    } else {
      setAcceptTimeLeft(remaining);
      setIsAcceptExpired(false);
    }

    if (remaining > 0) {
      const timer = setInterval(() => {
        setAcceptTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsAcceptExpired(true);
            loadAllData();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }
}, [s.acceptedAt, s.status, loadAllData]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    switch(s.status) {
      case "ACCEPTED":
        return { text: "ACCEPTED ⚡", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20" };
      case "PAYMENT_SUBMITTED":
        return { text: "PROOF SUBMITTED 📸", color: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" };
      default:
        return { text: "ACTIVE", color: "bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20" };
    }
  };

  const statusDisplay = getStatusDisplay();

  const downloadQR = () => {
    const imageUrl = `https://cpay-link-backend.onrender.com${s.image}`;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `QR-${s.amount}-${s._id.slice(-4)}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Code Downloaded!', {
      duration: 1000,
      icon: '📥',
      style: {
        background: '#00F5A0',
        color: '#051510',
      }
    });
  };

  // Card style - सगळ्यासाठी same
  const getCardStyle = () => {
    return "border border-white/10"; // सगळ्यासाठी समान style
  };

  const notifyUploader = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/scanner/request-utr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        scannerId: s._id
      })
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Notification sent to uploader");
    } else {
      toast.error(data.message || "Failed to send request");
    }
  } catch (err) {
    toast.error("Something went wrong");
  }
};
  const handleAccept = async () => {
    if (isExpired) {
      toast.error(
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-red-500" />
          <div>
            <div className="font-bold">Request Expired!</div>
            <div className="text-xs">This request is no longer available</div>
          </div>
        </div>,
        { duration: 1000 }
      );
      return;
    }

      // ✅ Add this - Check if amount exceeds ₹10,000
  if (s.amount > 10000) {
    toast.error(
      <div className="flex items-center gap-2">
        <AlertCircle size={20} className="text-red-500" />
        <div>
          <div className="font-bold">Cannot Accept! ❌</div>
          <div className="text-xs">Maximum acceptance amount is ₹10,000</div>
        </div>
      </div>,
      { duration: 1000 }
    );
    return;
  }

    if (!walletActivated) {
      toast(
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
          onClick={() => {
            toast.dismiss();
            onActivateWallet();
          }}
        >
          <div className="bg-yellow-500/20 p-2 rounded-full">
            <AlertCircle size={24} className="text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-yellow-500">Wallet Not Activated!</div>
            <div className="text-xs text-gray-400 mt-1">Click here to activate your wallet now</div>
          </div>
          <div className="bg-yellow-500/20 p-2 rounded-full">
            <ArrowRight size={20} className="text-yellow-500" />
          </div>
        </div>,
        { 
          duration: 1000,
          style: {
            background: '#0A1F1A',
            color: 'white',
            border: '1px solid #eab308/20',
            padding: '12px',
          },
          icon: null
        }
      );
      return;
    }

    if (!acceptTermsAccepted) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500" />
          <div>
            <div className="font-bold">Terms Not Accepted!</div>
            <div className="text-xs">Please accept the terms and conditions first</div>
          </div>
        </div>,
        { 
          duration: 1000,
          style: {
            background: '#0A1F1A',
            color: 'white',
            border: '1px solid #ef4444/20'
          }
        }
      );
      return;
    }
    
    try {
      const result = await acceptRequest(s._id);
      
      // System request साठी special message नको, normal message पाठवा
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-[#00F5A0]" />
          <div>
            <div className="font-bold">Request Accepted! 🎯</div>
            <div className="text-xs">You have 10 minutes to complete the payment</div>
          </div>
        </div>,
        { duration: 1000 }
      );
      
      loadAllData();
    } catch (error) {
      // console.error("Error accepting request:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500" />
          <div>
            <div className="font-bold">Failed to Accept!</div>
            <div className="text-xs">{error.message || "Something went wrong"}</div>
          </div>
        </div>,
        { duration: 1000 }
      );
    }
  };

  // Get created by text - system request साठी random user ID
  const getCreatedByText = () => {
    if (isSystemRequest) {
      return `${getRandomUserId()}`;
    }
    return s.user?.userId || `${s.user?._id?.slice(-6)}`;
  };

const isAcceptedByCurrentUser = () => {
  if (!s.acceptedBy) return false;
  
  // ✅ user.id वापरा, user._id नाही!
  const currentUserId = String(user.id || user._id);
  
  if (typeof s.acceptedBy === 'object' && s.acceptedBy !== null) {
    if (s.acceptedBy._id) {
      return String(s.acceptedBy._id) === currentUserId;
    }
  }
  
  return String(s.acceptedBy) === currentUserId;
};

  return (
    <div className={`bg-[#0A1F1A] ${getCardStyle()} p-5 rounded-[2rem] relative flex flex-col h-full hover:border-white/20 transition-all`}>
      
      {/* Status Badge and Timer */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${statusDisplay.color}`}>
          {statusDisplay.text}
        </div>
        
        {s.status === "ACTIVE" && !s.acceptedBy && (
          <div className={`${timeLeft < 60 ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'} text-[8px] font-black px-2 py-1.5 rounded-full flex items-center gap-1 border border-yellow-500/20`}>
            <Clock size={10} />
            {formatTime(timeLeft)}
          </div>
        )}

        {/* Timer for ACCEPTED requests */}
{s.status === "ACCEPTED" && isAcceptedByCurrentUser() && (
  <div className={`${acceptTimeLeft < 60 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-orange-500/20 text-orange-400'} text-[8px] font-black px-2 py-1.5 rounded-full flex items-center gap-1 border border-orange-500/20`}>
    <Clock size={10} />
    Submit Proof: {formatTime(acceptTimeLeft)}
    {acceptTimeLeft < 60 && (
      <span className="ml-1 text-[8px] font-bold">⚠️ HURRY!</span>
    )}
  </div>
)}
      </div>
      
      {/* QR Code Image */}
      <div className="relative mb-3">
        <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-lg">
          <img 
            src={`https://cpay-link-backend.onrender.com${s.image}`} 
            className="w-28 h-28 md:w-32 md:h-32 object-contain" 
            alt="QR" 
          />
        </div>
      </div>
      
      {/* Download QR Button */}
      <button
        onClick={downloadQR}
        className="mb-4 w-full bg-white/5 hover:bg-[#00F5A0]/10 border border-white/10 rounded-xl py-2 px-3 flex items-center justify-center gap-2 transition-all group"
      >
        <UploadCloud size={16} className="text-[#00F5A0] group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold text-gray-400 group-hover:text-[#00F5A0]">DOWNLOAD QR</span>
      </button>
      
      {/* Amount */}
      <h3 className="text-2xl font-black text-center mb-1 text-white">
        ₹{s.amount}
      </h3>
{s.upiLink && (
  <div className="mb-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
    <p className="text-[10px] text-blue-400 font-bold mb-1 flex items-center gap-1">
      <CreditCard size={12} /> UPI ID / Payment Link:
    </p>
    <div className="flex items-center gap-2">
      <p className="text-xs text-white font-mono break-all flex-1">
        {s.upiLink}
      </p>
      <button
        onClick={() => {
          navigator.clipboard.writeText(s.upiLink);
          toast.success("UPI ID copied!", { duration: 1000 });
        }}
        className="bg-blue-500/20 p-1.5 rounded-lg hover:bg-blue-500/30 transition-colors"
      >
        <Copy size={14} className="text-blue-400" />
      </button>
    </div>
    <p className="text-[8px] text-gray-500 mt-2">
      ⚡ Use this UPI ID to make payment
    </p>
  </div>
)}
      
      {/* Created By - सगळ्यांसाठी एकसारखं दिसेल */}
      <p className="text-center text-[10px] text-gray-500 font-bold mb-3 italic uppercase bg-white/5 py-1.5 px-3 rounded-full mx-auto">
        Created by: {getCreatedByText()}
      </p>

      {/* Auto Confirm Info - फक्त auto request साठी */}
      {s.status === "PAYMENT_SUBMITTED" && isAutoRequest && (
        <div className="mb-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
          
        </div>
      )}

      {/* ✅ NEW: Screenshot Preview - Show if multiple screenshots */}
      {s.paymentScreenshots && s.paymentScreenshots.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-2">
            <Camera size={12} className="text-[#00F5A0]" />
            <span className="text-[8px] text-gray-400">
              {s.paymentScreenshots.filter(ss => ss.isActive).length} Screenshot(s)
            </span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {s.paymentScreenshots.filter(ss => ss.isActive).map((ss, idx) => (
              <div 
                key={idx} 
                className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-[#00F5A0] transition-all"
                onClick={() => window.open(`https://cpay-link-backend.onrender.com${ss.url}`)}
              >
                <img 
                  src={`https://cpay-link-backend.onrender.com${ss.url}`} 
                  alt={`screenshot-${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted By Section */}
      {s.acceptedBy && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
          <p className="text-center text-[10px] text-blue-400 font-bold uppercase mb-2 tracking-wider">
            ⚡ ACCEPTED BY
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
              {s.acceptedBy.name?.charAt(0) || s.acceptedBy.userId?.charAt(0) || (typeof s.acceptedBy === 'string' ? s.acceptedBy.charAt(0) : '?')}
            </div>
            <div>
              <p className="text-sm font-bold text-blue-400">
                {s.acceptedBy.name || s.acceptedBy.userId || (typeof s.acceptedBy === 'string' ? s.acceptedBy : `User ${s.acceptedBy._id?.slice(-6)}`)}
              </p>
              <p className="text-[8px] text-gray-500">Accepted at: {new Date(s.acceptedAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* UTR Request Indicator - Only visible to acceptor */}
{s.utrRequested && isAcceptedByCurrentUser() && s.status === "PAYMENT_SUBMITTED" && (
  <div className="mb-3 p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30 animate-pulse">
    <div className="flex items-center gap-2 mb-2">
      <AlertCircle size={16} className="text-yellow-400" />
      <span className="text-xs font-bold text-yellow-400">📩 UTR NUMBER REQUESTED!</span>
    </div>
    <p className="text-[10px] text-gray-300">
      The bill creator has requested the UTR number screenshot. Please upload the UTR screenshot immediately.
    </p>
    <button
      onClick={() => {
        // Open screenshot modal for UTR upload
        openScreenshotModal();
      }}
      className="mt-2 w-full bg-yellow-500/30 text-yellow-400 py-2 rounded-lg text-[10px] font-bold hover:bg-yellow-500/40 transition-all flex items-center justify-center gap-2"
    >
      <UploadCloud size={12} />
      UPLOAD UTR SCREENSHOT NOW
    </button>
  </div>
)}

      {/* Action Buttons */}
      <div className="mt-auto space-y-2">
        {isOwner ? (

          
          s.status === "PAYMENT_SUBMITTED" ? (
            
            <div className="space-y-2">
              {/* ✅ VIEW PROOF button - click केल्याशिवाय confirm button disable */}
              {s.status === "PAYMENT_SUBMITTED" && isOwner && (
  <button
    onClick={() => notifyUploader()}
    className="w-full bg-yellow-500/20 text-yellow-400 py-2 rounded-xl font-bold text-xs hover:bg-yellow-500/30 transition-all border border-yellow-500/20"
  >
    📩 PLZ UPLOAD UTR NUMBER SCREENSHOT
  </button>
)}
              <button 
                onClick={handleViewProof}
                className="w-full text-[#00F5A0] text-xs font-bold underline py-2 hover:text-[#00d88c] transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={16} />
                VIEW PROOF
                {!proofViewed && (
                  <span className="bg-red-500/20 text-red-400 text-[8px] px-2 py-0.5 rounded-full animate-pulse">
                    Required
                  </span>
                )}
              </button>
              
           {/* ✅ CONFIRM RECEIPT button - INSTANT confirmation */}
{!isAutoRequest && (
  <button 
    onClick={async () => {
      if (!proofViewed) {
        toast.error("Please view proof first");
        return;
      }
      
      try {
        // Disable button to prevent double click
        const btn = event.target;
        btn.disabled = true;
        btn.innerText = "⏳ CONFIRMING...";
        
        await confirmRequest(s._id);
        
        toast.success("Payment confirmed successfully! 🎉");
        
        // Immediately refresh data
        await loadAllData();
        
        btn.innerText = "✅ CONFIRMED";
        setTimeout(() => {
          if (btn) btn.disabled = false;
        }, 1000);
      } catch (error) {
        toast.error("Failed to confirm: " + error.message);
        btn.disabled = false;
        btn.innerText = "✅ CONFIRM RECEIPT";
      }
    }}
    disabled={!proofViewed}
    className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
      proofViewed 
        ? "bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black hover:shadow-lg hover:shadow-[#00F5A0]/20 cursor-pointer" 
        : "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
    }`}
  >
    {proofViewed ? "✅ CONFIRM RECEIPT" : "🔒 VIEW PROOF FIRST"}
  </button>
)}
            </div>
          ) : s.status === "ACTIVE" && !s.acceptedBy ? (
            <button 
              onClick={() => handleCancelRequest(s._id)}
              className="w-full bg-red-500/20 text-red-500 py-3 rounded-xl font-black text-sm hover:bg-red-500/30 transition-all border border-red-500/20"
            >
              ✕ CANCEL REQUEST
            </button>
          ) : null
        ) : (
          <>
            {s.status === "ACTIVE" && !isOwner && (
              <button 
                onClick={handleAccept}
                className={`w-full bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black py-3 rounded-xl font-black italic text-sm hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all ${
                  (!walletActivated || !acceptTermsAccepted) ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!walletActivated || !acceptTermsAccepted}
              >
                ⚡ ACCEPT & PAY
              </button>
            )}
          </>
        )}
        
        {/* ✅ FIXED: UPLOAD SCREENSHOT button - now works with both string and object acceptedBy */}
        {isAcceptedByCurrentUser() && s.status === "ACCEPTED" && (
          <button 
            onClick={() => setSelectedScanner(s._id)} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            📸 UPLOAD SCREENSHOT
          </button>
        )}

        {/* ✅ FIXED: UPDATE SCREENSHOT button - now works with both string and object acceptedBy */}
        {isAcceptedByCurrentUser() && s.status === "PAYMENT_SUBMITTED" && (
          <button 
            onClick={openScreenshotModal}
            className="w-full bg-yellow-500/20 text-yellow-500 py-2 rounded-xl font-black text-xs hover:bg-yellow-500/30 transition-all border border-yellow-500/20 flex items-center justify-center gap-2"
          >
            <Camera size={14} />
            UPDATE SCREENSHOT
          </button>
        )}
      </div>

      {/* ✅ NEW: Screenshot Management Modal */}
      {showScreenshotModal && (
        <ScreenshotModal
          scanner={s}
          screenshots={screenshots}
          onClose={() => setShowScreenshotModal(false)}
          onUpdate={handleUpdateScreenshot}
          uploading={uploading}
          updateReason={updateReason}
          setUpdateReason={setUpdateReason}
          fetchScreenshots={fetchScreenshots}
        />
      )}
    </div>
  );
};

// ✅ NEW: Screenshot Modal Component (place this outside RequestCard, before SidebarLink component)
const ScreenshotModal = ({ scanner, screenshots, onClose, onUpdate, uploading, updateReason, setUpdateReason, fetchScreenshots }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large! Max 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdate = () => {
    if (!selectedFile) {
      toast.error("Please select a new screenshot");
      return;
    }
    onUpdate(selectedFile, selectedIndex);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[500] p-4 backdrop-blur-sm">
      <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0A1F1A] p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-black text-[#00F5A0]">Manage Screenshots</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Screenshot Gallery */}
          <div>
            <h4 className="text-sm font-bold mb-3">Uploaded Screenshots</h4>
            <div className="grid grid-cols-3 gap-3">
              {screenshots.filter(s => s.isActive).map((ss, idx) => (
                <div 
                  key={idx}
                  className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedIndex === idx ? 'border-[#00F5A0]' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <img 
                    src={`https://cpay-link-backend.onrender.com${ss.url}`}
                    alt={`screenshot-${idx}`}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-black/60 text-[8px] px-1 rounded">
                    {new Date(ss.uploadedAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {screenshots.filter(s => s.isActive).length === 0 && (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No screenshots uploaded yet
                </div>
              )}
            </div>
          </div>

          {/* Update Form */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-sm font-bold mb-3">Update Screenshot</h4>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!previewUrl ? (
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full border-2 border-dashed border-white/10 rounded-xl py-8 text-center hover:border-[#00F5A0]/30 transition-all group"
              >
                <Camera size={32} className="mx-auto mb-2 text-gray-500 group-hover:text-[#00F5A0]" />
                <p className="text-sm text-gray-400">Click to select new screenshot</p>
                <p className="text-[8px] text-gray-600 mt-1">Max 5MB (JPEG, PNG)</p>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-48 object-contain bg-black/40 rounded-xl border border-[#00F5A0]"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Reason for update (optional)"
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00F5A0]"
                />

                <button
                  onClick={handleUpdate}
                  disabled={uploading}
                  className="w-full bg-[#00F5A0] text-black py-3 rounded-xl font-black text-sm hover:bg-[#00d88c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      UPDATING...
                    </span>
                  ) : (
                    "UPDATE SCREENSHOT"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
            <p className="text-blue-400 text-xs font-bold mb-2">📸 Screenshot Guidelines:</p>
            <ul className="text-[10px] text-gray-400 list-disc list-inside space-y-1">
              <li>You can upload multiple screenshots</li>
              <li>Update any screenshot by selecting it and uploading a new one</li>
              <li>All previous versions are saved in history</li>
              <li>Make sure the screenshot is clear and shows the payment details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==================== FIXED DepositPage COMPONENT ====================

const DepositPage = ({ 
  paymentMethods, 
  selectedMethod, 
  setSelectedMethod, 
  depositData, 
  setDepositData, 
  txHash, 
  setTxHash, 
  setDepositScreenshot, 
  handleDepositSubmit, 
  actionLoading,
  setActiveTab, 
  loadAllData,
  // Timer props
  showDepositTimer,
  depositTimeLeft,
  depositVerifying,
  setShowDepositTimer,
  setDepositTimeLeft,
  setDepositVerifying
}) => {
  const usdtMethods = paymentMethods.filter(m => m.method?.includes("USDT"));
  
  // ==================== Define these states inside DepositPage ====================
  const [myDeposits, setMyDeposits] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDepositScreenshotModal, setShowDepositScreenshotModal] = useState(false);
  const [depositUpdateReason, setDepositUpdateReason] = useState("");
  
  // Local state for timer
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // ==================== loadMyDeposits function ====================
  const loadMyDeposits = async () => {
    try {
      // Dynamically import getMyDeposits
      const apiModule = await import("../services/apiService");
      const { getMyDeposits } = apiModule;
      
      const deposits = await getMyDeposits();
      setMyDeposits(Array.isArray(deposits) ? deposits : []);
    } catch (error) {
      console.error("Error loading deposits:", error);
      setMyDeposits([]);
    }
  };
  
  // ==================== Load deposits on mount ====================
  useEffect(() => {
    loadMyDeposits();
  }, []);
  
  // ==================== screenshot update handler ====================
  const handleUpdateDepositScreenshot = async (depositId, file, reason) => {
    try {
      // Dynamically import updateDepositScreenshot
      const apiModule = await import("../services/apiService");
      const { updateDepositScreenshot } = apiModule;
      
      const res = await updateDepositScreenshot(depositId, file, reason);
      if (res && res.message) {
        toast.success("Screenshot updated successfully!");
        loadMyDeposits();
        setShowDepositScreenshotModal(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating screenshot:", error);
      toast.error("Failed to update screenshot");
      return false;
    }
  };
  
  // Timer effect - counts down from 300 to 0
  useEffect(() => {
    let timerInterval;
    
    if (showTimer && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setIsVerifying(false);
            setShowPendingMessage(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [showTimer]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = ((300 - timeLeft) / 300) * 100;

  // Handle file selection with validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setSelectedFile(null);
      setSelectedFileName("");
      setPreviewUrl(null);
      setDepositScreenshot(null);
      return;
    }

    // File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large! Maximum size is 5MB", {
        duration: 1000,
        icon: '⚠️',
        style: { background: '#0A1F1A', border: '1px solid #ef4444/20' }
      });
      e.target.value = "";
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file (JPEG, PNG, etc.)", {
        duration: 1000,
        icon: '📸',
        style: { background: '#0A1F1A', border: '1px solid #ef4444/20' }
      });
      e.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setDepositScreenshot(file);
    
    toast.success(`Selected: ${file.name}`, { 
      duration: 1000,
      icon: '✅',
      style: { background: '#0A1F1A', border: '1px solid #00F5A0/20' }
    });
  };

  // ==================== handleSubmit function ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    const errors = [];
    
    if (!depositData.amount || Number(depositData.amount) <= 0) {
      errors.push("Valid amount is required");
    }
    
    if (!selectedMethod) {
      errors.push("Please select a payment method");
    }
    
    if (!txHash || txHash.trim() === "") {
      errors.push("Transaction hash is required");
    }
    
    if (!selectedFile) {
      errors.push("Payment screenshot is required");
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(error, {
          duration: 1000,
          style: { background: '#0A1F1A', border: '1px solid #ef4444/20' }
        });
      });
      return;
    }

    const success = await handleDepositSubmit();
    
    if (success) {
      setShowTimer(true);
      setTimeLeft(300);
      setIsVerifying(true);
      setShowPendingMessage(false);
      setDepositSubmitted(true);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
      setSelectedFileName("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      toast.success("Deposit submitted! Admin will verify within 5 minutes.", {
        duration: 1000,
        icon: '⏱️',
        style: { background: '#0A1F1A', border: '1px solid #00F5A0/20' }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* DEPOSIT FORM */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-[#0A1F1A] border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
        <h2 className="text-xl font-black italic text-[#00F5A0] mb-8 uppercase tracking-widest">Add Funds</h2>
        
        {/* Payment Methods Selection */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {usdtMethods.length > 0 ? (
            usdtMethods.map(m => (
              <button 
                type="button"
                key={m._id} 
                onClick={() => setSelectedMethod(m)} 
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedMethod?._id === m._id 
                    ? "border-[#00F5A0] bg-[#00F5A0]/10" 
                    : "border-white/10 bg-black/20 hover:bg-black/40"
                }`}
                disabled={showTimer}
              >
                <p className="font-bold text-sm">{m.method}</p>
                {m.details?.network && (
                  <p className="text-[10px] text-gray-500 mt-1">Network: {m.details.network}</p>
                )}
              </button>
            ))
          ) : (
            <div className="p-4 bg-yellow-500/10 rounded-xl text-yellow-500 text-xs text-center">
              No payment methods available
            </div>
          )}
        </div>

        {/* Selected Method Details */}
        {selectedMethod && selectedMethod.method.includes("USDT") && (
          <div className="p-4 bg-white/5 rounded-xl mb-6 border border-white/5">
            <p className="text-[#00F5A0] font-black mb-3 uppercase text-xs">Payment Details:</p>
            <div className="mb-4 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <p className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                <AlertCircle size={12} />
                Minimum Deposit: $10 USDT
              </p>
            </div>
            
          {/* QR Code */}
<div className="flex justify-center mb-4">
  <div className="bg-white p-3 rounded-xl">
    <QRCodeCanvas
  value={selectedMethod.details.address}
  size={150}
  bgColor="#ffffff"
  fgColor="#000000"
  level="H"
/>
  </div>
</div>
            
            {/* Address with Copy */}
            <div className="mb-3">
              <p className="text-[10px] text-gray-500 mb-1">Address:</p>
              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg">
                <p className="text-xs text-white/80 font-mono break-all flex-1">
                  {selectedMethod.details.address}
                </p>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMethod.details.address);
                    toast.success("Address copied!", { duration: 1000 });
                  }}
                  className="bg-[#00F5A0]/10 p-2 rounded-lg hover:bg-[#00F5A0]/20 transition-colors flex-shrink-0"
                >
                  <Copy size={16} className="text-[#00F5A0]" />
                </button>
              </div>
            </div>
            
            {/* Network */}
            <div className="mb-3">
              <p className="text-[10px] text-gray-500 mb-1">Network:</p>
              <p className="text-xs text-white/80 bg-black/40 p-2 rounded-lg">
                {selectedMethod.details.network}
              </p>
            </div>
            
            {/* Rate Display */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Rate:</span>
                <span className="font-bold text-[#00F5A0]">1 USDT = ₹95</span>
              </div>
              {depositData.amount && (
                <div className="flex justify-between items-center mt-2 text-base">
                  <span className="text-gray-400">You'll get:</span>
                  <span className="font-black text-white">
                    ₹{(Number(depositData.amount) * 95).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ⏱️ 5-MINUTE TIMER DISPLAY */}
        {showTimer && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isVerifying && timeLeft > 0 ? (
                  <Loader size={16} className="animate-spin text-yellow-500" />
                ) : showPendingMessage ? (
                  <Clock size={16} className="text-orange-500" />
                ) : (
                  <CheckCircle size={16} className="text-green-500" />
                )}
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                  {timeLeft > 0 
                    ? "AWAITING ADMIN APPROVAL" 
                    : showPendingMessage 
                      ? "PENDING ADMIN APPROVAL"
                      : "PROCESSING COMPLETE"}
                </span>
              </div>
              {timeLeft > 0 && (
                <div className="bg-yellow-500/20 px-3 py-1 rounded-full">
                  <span className="text-sm font-black text-yellow-500 font-mono">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>
            
            {/* PROGRESS BAR */}
            {timeLeft > 0 && (
              <>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2 text-center">
                  ⏱️ Admin will verify within {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} minutes
                </p>
              </>
            )}
            
            {/* PENDING MESSAGE AFTER 5 MINUTES */}
            {showPendingMessage && (
              <div className="mt-3 p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <p className="text-xs text-orange-400 font-bold text-center flex items-center justify-center gap-2">
                  <Clock size={16} />
                  Your deposit is still pending. Admin approval will take some more time.
                </p>
                <p className="text-[10px] text-orange-400/70 text-center mt-2">
                  You'll be notified once approved. Check back later.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Amount (USDT) *</label>
          <input 
            type="number" 
            value={depositData.amount} 
            onChange={e => {
              const value = e.target.value;
              setDepositData({ ...depositData, amount: value });
              if (value && Number(value) < 10) {
                toast.error("Minimum deposit is $10 USDT", {
                  duration: 1000,
                  icon: '⚠️'
                });
              }
            }} 
            placeholder="Enter amount in USDT" 
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-lg outline-none focus:border-[#00F5A0] transition-all" 
            disabled={showTimer}
            min="10"
            step="0.01"
            required
          />
          
          <div className="flex justify-between items-center mt-2 px-2">
            <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
              <AlertCircle size={10} />
              Minimum: $10 USDT
            </span>
          </div>
          
          {depositData.amount && Number(depositData.amount) >= 10 && (
            <div className="mt-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-[10px] text-blue-400 flex items-center gap-1">
                <Zap size={10} />
                You will receive: ₹{(Number(depositData.amount) * 95).toLocaleString()} INR
              </p>
            </div>
          )}
          
          {depositData.amount && Number(depositData.amount) < 10 && (
            <div className="mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-[10px] text-red-400 flex items-center gap-1">
                <AlertCircle size={10} />
                Minimum deposit amount is $10 USDT
              </p>
            </div>
          )}
        </div>
        
        {/* Transaction Hash Input */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Transaction Hash / TXID *</label>
          <input 
            type="text" 
            value={txHash} 
            onChange={e => setTxHash(e.target.value)} 
            placeholder="Enter transaction hash" 
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold outline-none focus:border-[#00F5A0] transition-all" 
            disabled={showTimer}
            required
          />
        </div>
        
        {/* File Upload with Preview */}
        <div className="mb-6">
          <label className="text-xs text-gray-500 mb-1 block">Payment Screenshot *</label>
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            onChange={handleFileChange} 
            className="hidden" 
            id="screenshot-upload"
            disabled={showTimer}
          />
          
          <label 
            htmlFor="screenshot-upload"
            className={`block border-2 border-dashed rounded-xl py-6 text-center cursor-pointer font-bold text-sm transition-all ${
              selectedFile 
                ? "border-[#00F5A0] bg-[#00F5A0]/10" 
                : "border-white/10 bg-black/40 hover:bg-black/60"
            }`}
          >
            <UploadCloud size={32} className="mx-auto mb-2 text-[#00F5A0]" />
            {selectedFileName || "Click to upload payment screenshot"}
            <p className="text-[8px] text-gray-500 mt-1">Max file size: 5MB (JPEG, PNG)</p>
          </label>
          
          {previewUrl && (
            <div className="mt-3">
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-[#00F5A0]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedFileName("");
                    setPreviewUrl(null);
                    setDepositScreenshot(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-[#00F5A0] mt-1">
                {selectedFileName} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit"
          className={`w-full py-5 rounded-2xl font-black italic transition-all ${
            showTimer 
              ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
              : "bg-[#00F5A0] text-black hover:bg-[#00d88c] active:scale-95"
          }`}
          disabled={actionLoading || showTimer}
        >
          {actionLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader size={16} className="animate-spin" />
              PROCESSING...
            </span>
          ) : showTimer ? (
            <span className="flex items-center justify-center gap-2">
              <Clock size={16} />
              {timeLeft > 0 ? `AWAITING ADMIN (${formatTime(timeLeft)})` : "PENDING ✓"}
            </span>
          ) : (
            "SUBMIT DEPOSIT"
          )}
        </button>
        
        <p className="text-[10px] text-gray-500 text-center mt-4">
          ⏱️ Deposits are manually verified by admin within 5 minutes
        </p>
      </form>
      
      {/* MY DEPOSITS LIST SECTION */}
      {myDeposits.length > 0 && (
        <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-[#00F5A0]" />
            My Recent Deposits
          </h3>
          <div className="space-y-3">
            {myDeposits.slice(0, 3).map(deposit => (
              <div key={deposit._id} className="bg-black/40 border border-white/5 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                      deposit.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                      deposit.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {deposit.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-bold">${deposit.amount} USDT</span>
                </div>
                <p className="text-[10px] text-gray-500 mb-2">TX: {deposit.txHash.slice(0, 20)}...</p>
                
                {/* Screenshot gallery preview */}
                {deposit.paymentScreenshots && deposit.paymentScreenshots.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {deposit.paymentScreenshots.filter(s => s.isActive).slice(0, 3).map((ss, idx) => (
                      <div 
                        key={idx}
                        className="w-8 h-8 rounded overflow-hidden border border-white/10 cursor-pointer"
                        onClick={() => window.open(`https://cpay-link-backend.onrender.com${ss.url}`)}
                      >
                        <img src={`https://cpay-link-backend.onrender.com${ss.url}`} alt="screenshot" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show update button for pending deposits */}
                {deposit.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedDeposit(deposit);
                      setShowDepositScreenshotModal(true);
                    }}
                    className="mt-2 w-full bg-yellow-500/20 text-yellow-500 py-2 rounded-lg text-xs font-bold hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Camera size={14} />
                    UPDATE SCREENSHOT
                  </button>
                )}

                {/* Show reject reason for rejected deposits */}
                {deposit.status === 'rejected' && deposit.rejectReason && (
                  <div className="mt-2 p-2 bg-red-500/10 rounded-lg">
                    <p className="text-[10px] text-red-400">
                      <span className="font-bold">Reason:</span> {deposit.rejectReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEPOSIT SCREENSHOT MODAL - Now using the component defined above */}
     {showDepositScreenshotModal && selectedDeposit && (
  <DepositScreenshotModal
    deposit={selectedDeposit}
    onClose={() => {
      setShowDepositScreenshotModal(false);
      setSelectedDeposit(null);
      setDepositUpdateReason("");
    }}
    onUpdate={handleUpdateDepositScreenshot}
    uploading={actionLoading}
    updateReason={depositUpdateReason}
    setUpdateReason={setDepositUpdateReason}
  />
)}
    </div>
  );
};



// HistoryPage Component - FIXED with proper currency symbols
const HistoryPage = ({ transactions }) => (
  <div className="bg-[#0A1F1A] border border-white/10 p-4 md:p-8 rounded-[2rem]">
    <h2 className="text-xl font-bold mb-6 italic">Transaction History</h2>
    <div className="space-y-3">
      {transactions.map(tx => {
        // Determine which currency symbol to use
        let currencySymbol = "₹"; // Default INR
        
        // ✅ Case 1: DEPOSIT always in USD
        if (tx.type === 'DEPOSIT') {
          currencySymbol = "$";
        }
        // ✅ Case 2: WALLET_ACTIVATION always in USD
        else if (tx.type === 'WALLET_ACTIVATION') {
          currencySymbol = "$";
        }
        // ✅ Case 3: CONVERSION - original in USD, final in INR (हाताळले meta मध्ये)
        // ✅ CREDIT, DEBIT, CASHBACK नेहमी ₹ मध्ये
        
        return (
          <div key={tx._id} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-[#00F5A0]/20 transition-all">
            <div className="min-w-0 flex-1 mr-4">
              <p className="font-bold text-sm truncate flex items-center gap-2">
                {/* Icons based on transaction type */}
                {tx.type === 'TEAM_CASHBACK' && <Users size={14} className="text-purple-500" />}
                {tx.type === 'DEPOSIT' && <Wallet size={14} className="text-blue-500" />}
                {tx.type === 'WALLET_ACTIVATION' && <Zap size={14} className="text-[#00F5A0]" />}
                {tx.type === 'CASHBACK' && <Award size={14} className="text-orange-500" />}
                {tx.type === 'CREDIT' && <ArrowRightLeft size={14} className="text-green-500" />}
                {tx.type === 'DEBIT' && <ArrowRightLeft size={14} className="text-red-500" />}
                {tx.type === 'CONVERSION' && <ArrowRightLeft size={14} className="text-yellow-500" />}
                
                {/* Transaction type display */}
                {tx.type === 'TEAM_CASHBACK' ? 'Team Cashback' : 
                 tx.type === 'DEPOSIT' ? 'USDT Deposit' : 
                 tx.type === 'WALLET_ACTIVATION' ? 'Wallet Activation' : 
                 tx.type === 'CONVERSION' ? 'USDT → INR Conversion' :
                 tx.type === 'CREDIT' ? 'Credit' :
                 tx.type === 'DEBIT' ? 'Debit' :
                 tx.type === 'CASHBACK' ? 'Cashback' :
                 tx.type}
              </p>
              <p className="text-[10px] text-gray-500 font-bold">
                {new Date(tx.createdAt).toLocaleString()}
                {tx.meta?.type && (
                  <span className="ml-2 text-[8px] bg-white/5 px-2 py-0.5 rounded-full">
                    {tx.meta.type.replace(/_/g, ' ')}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="font-black italic text-sm">
                {currencySymbol}{tx.amount.toFixed(2)}
                
                {/* Show USDT for DEPOSIT and WALLET_ACTIVATION */}
                {(tx.type === 'DEPOSIT' || tx.type === 'WALLET_ACTIVATION') && (
                  <span className="block text-[8px] text-gray-500">USDT</span>
                )}
                
                {/* Show conversion details for WALLET_ACTIVATION */}
                {tx.type === 'WALLET_ACTIVATION' && tx.meta?.inrAmount && (
                  <span className="block text-[8px] text-gray-500">
                    ≈ ₹{tx.meta.inrAmount}
                  </span>
                )}
                
                {/* Show conversion details for CONVERSION */}
                {tx.type === 'CONVERSION' && tx.meta && (
                  <span className="block text-[8px] text-gray-500">
                    ${tx.meta.originalAmount} → ₹{tx.amount}
                  </span>
                )}
              </p>
              <p className="text-[8px] text-[#00F5A0] font-black uppercase tracking-widest italic">
                {tx.type === 'WALLET_ACTIVATION' ? 'ACTIVATED' : tx.status || 'SUCCESS'}
              </p>
              
              {/* Show wallet movement */}
              {tx.fromWallet && tx.toWallet && (
                <p className="text-[7px] text-gray-600 mt-1">
                  {tx.fromWallet || 'System'} → {tx.toWallet}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {transactions.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-600 font-bold">No Transactions Found</p>
          <p className="text-[10px] text-gray-700 mt-2">Your transactions will appear here</p>
        </div>
      )}
    </div>
  </div>
);

const ReferralPage = ({ referralData: propReferralData, teamStats: propTeamStats }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showTeamCashback, setShowTeamCashback] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [expandedMember, setExpandedMember] = useState(null);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [expandedLeg, setExpandedLeg] = useState(null);
  const [expandedLegDetails, setExpandedLegDetails] = useState({});
  const [statsFilter, setStatsFilter] = useState('total');
  const [showAllLegs, setShowAllLegs] = useState(false);
  const [expandedLegLevel, setExpandedLegLevel] = useState({}); 
  
  // ========== LOCAL STATE FOR REFERRAL DATA ==========
  const [localReferralData, setLocalReferralData] = useState({
    referralCode: '',
    directReferrals: 0,
    totalReferrals: 0,
    referralEarnings: { total: 0 }
  });
  
  const [legStatus, setLegStatus] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [memberDetails, setMemberDetails] = useState({});
  const [loadingMember, setLoadingMember] = useState(false);
  const [legBreakdown, setLegBreakdown] = useState(null);
  const [levelWiseMembers, setLevelWiseMembers] = useState({});
  const [loadingLevelUsers, setLoadingLevelUsers] = useState(false);
  const [missedCommissions, setMissedCommissions] = useState(null);
  const [fomoNotifications, setFomoNotifications] = useState([]);
  const [showFomoModal, setShowFomoModal] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [todayStats, setTodayStats] = useState({
    teamBusiness: 0,
    yourCommission: 0,
    teamMembers: 0
  });
  const [totalStats, setTotalStats] = useState({
  teamBusiness: 0,
  yourCommission: 0,
  teamMembers: 0
});
  // Add these with your other useState declarations (around line where other states are declared)
const [levelUsersCache, setLevelUsersCache] = useState({});
const [loadingLevels, setLoadingLevels] = useState({});
const [pendingRequests, setPendingRequests] = useState({});
const [legsPerPage, setLegsPerPage] = useState(20); // Add this too if missing
  
// ========== USE PROP DATA IF PROVIDED, OTHERWISE USE LOCAL ==========
const referralData = propReferralData || { ...localReferralData }; // Spread operator वापरा
const teamStats = propTeamStats || { ...teamStatsLocal }; // जर teamStatsLocal असेल तर  const teamStats = propTeamStats || {};

  // API Base URL
  const API_BASE = 'https://cpay-link-backend.onrender.com/api';
  // const API_BASE = "http://localhost:5000/api";

// ========== FETCH REFERRAL STATS - CLEAN VERSION ==========
useEffect(() => {
  let isMounted = true;
  
  const fetchReferralStats = async () => {
    try {
      const token = localStorage.getItem("token");
      // console.log("Fetching referral stats with token:", token ? "exists" : "missing");
      
      const response = await fetch(`${API_BASE}/auth/referral`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      // console.log("Referral API response:", data);
      
      if (data?.success && data?.data && isMounted) {
        // console.log("Setting referral data:", data.data.referralCode);
        setLocalReferralData({
          referralCode: data.data.referralCode || 'N/A',
          directReferrals: data.data.directReferrals || 0,
          totalReferrals: data.data.totalTeam || 0,
          referralEarnings: { total: data.data.totalEarnings || 0 }
        });
      }
    } catch (error) {
      // console.error("Error fetching referral stats:", error);
      if (isMounted) {
        setLocalReferralData(prev => ({
          ...prev,
          referralCode: 'Error loading'
        }));
      }
    }
  };

  fetchReferralStats();
  
  return () => {
    isMounted = false;
  };
}, []); // Empty dependency array - run only once

  // ========== HELPER FUNCTIONS ==========
const getHorizontalRequirement = (level) => {
  return level; // Level N साठी N directs हवेत
};

  const getRequiredLevels = (level) => {
    const requirements = {
      4: [1, 2, 3],
      5: [2, 3, 4],
      6: [3, 4, 5],
      7: [4, 5, 6],
      8: [5, 6, 7],
      9: [6, 7, 8],
      10: [7, 8, 9],
      11: [8, 9, 10],
      12: [9, 10, 11],
      13: [10, 11, 12],
      14: [11, 12, 13],
      15: [12, 13, 14],
      16: [13, 14, 15],
      17: [14, 15, 16],
      18: [15, 16, 17],
      19: [16, 17, 18],
      20: [17, 18, 19],
      21: [18, 19, 20]
    };
    return requirements[level] || [];
  };

  // ========== OPTIMIZED FETCH FOR LEG-LEVEL USERS ==========
  const fetchLegLevelUsers = useCallback(async (legNumber, level) => {
    const cacheKey = `${legNumber}-${level}`;
    
    // Check if already loaded or loading
    if (levelUsersCache[cacheKey] || pendingRequests[cacheKey]) {
      return;
    }
    
    // Mark as pending
    setPendingRequests(prev => ({ ...prev, [cacheKey]: true }));
    setLoadingLevels(prev => ({ ...prev, [cacheKey]: true }));
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/auth/leg-users/${legNumber}/${level}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setLevelUsersCache(prev => ({
          ...prev,
          [cacheKey]: data.data.users || []
        }));
      } else {
        setLevelUsersCache(prev => ({
          ...prev,
          [cacheKey]: []
        }));
      }
    } catch (error) {
      console.error(`Error fetching leg ${legNumber} level ${level} users:`, error);
      setLevelUsersCache(prev => ({
        ...prev,
        [cacheKey]: []
      }));
    } finally {
      setLoadingLevels(prev => ({ ...prev, [cacheKey]: false }));
      setPendingRequests(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, [API_BASE, levelUsersCache, pendingRequests]);

  // ========== PRELOAD POPULAR LEVELS ==========
  const preloadPopularLevels = useCallback(async (legs) => {
    if (!legs || legs.length === 0) return;
    
    const preloadLimit = Math.min(legs.length, 5);
    
    for (let i = 0; i < preloadLimit; i++) {
      const leg = legs[i];
      for (let level = 1; level <= 3; level++) {
        const cacheKey = `${leg.legNumber}-${level}`;
        if (!levelUsersCache[cacheKey] && !pendingRequests[cacheKey]) {
          fetchLegLevelUsers(leg.legNumber, level).catch(console.error);
        }
      }
    }
  }, [levelUsersCache, pendingRequests, fetchLegLevelUsers]);

// ========== LOAD LEG STATUS - SIMPLIFIED VERSION (NO MISSED COMMISSIONS) ==========
useEffect(() => {
  let isMounted = true;
  let isFetching = false;
  
  const fetchLegStatus = async () => {
    if (isFetching || dataLoaded) return;
    isFetching = true;
    
    try {
      const token = localStorage.getItem("token");
      const { 
        getLegUnlockingStatus, 
        getNextLevelRequirement,
        getLegBreakdown
      } = await import("../services/authService");
      
      // Get leg status
      const status = await getLegUnlockingStatus(token);
      if (isMounted) setLegStatus(status);
      
      // Get next level requirement
      const next = await getNextLevelRequirement(token);
      if (isMounted && next?.success) {
        setNextLevel(next.data);
      }
      
      // Get leg breakdown
      const breakdown = await getLegBreakdown(token);
      if (isMounted) {
        setLegBreakdown(breakdown);
        if (breakdown?.legs) {
          preloadPopularLevels(breakdown.legs).catch(console.error);
        }
      }
      
      // MISSED COMMISSIONS AND FOMO ARE REMOVED - they don't exist in new logic
      // setMissedCommissions(null);
      // setFomoNotifications([]);
      
      if (isMounted) setDataLoaded(true);
      
    } catch (error) {
      console.error("Error fetching leg status:", error);
    } finally {
      isFetching = false;
    }
  };
  
  fetchLegStatus();
  
  return () => {
    isMounted = false;
  };
}, [dataLoaded, preloadPopularLevels]);

  // ========== LOAD LEVEL-WISE MEMBERS ==========
  useEffect(() => {
    let isMounted = true;
    
    const fetchLevelMembers = async () => {
      if (!teamStats || !dataLoaded) return;
      
      try {
        const token = localStorage.getItem("token");
        const { getLevelUsers } = await import("../services/authService");
        
        const levelUsersData = {};
        for (let level = 1; level <= 21; level++) {
          if (teamStats[`level${level}`]?.users > 0) {
            try {
              const users = await getLevelUsers(level, token);
              if (isMounted) {
                levelUsersData[`level${level}`] = users;
              }
            } catch (e) {
              console.log(`Error fetching level ${level} users:`, e);
            }
          }
        }
        if (isMounted) {
          setLevelWiseMembers(levelUsersData);
        }
      } catch (error) {
        console.error("Error fetching level members:", error);
      }
    };
    
    fetchLevelMembers();
    
    return () => {
      isMounted = false;
    };
  }, [teamStats, dataLoaded]);

  // ========== LOAD TODAY'S STATS ==========
  useEffect(() => {
    let isMounted = true;
    
    const fetchTodayStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { getTodayTeamStats } = await import("../services/authService");
        const data = await getTodayTeamStats(token);
        
if (isMounted && data?.success) {
  setTodayStats({
    teamBusiness: data.data?.teamBusiness || 0,  // data.data वापर
    yourCommission: data.data?.yourCommission || 0,
    teamMembers: data.data?.teamMembers || 0
  });
}
      } catch (error) {
        console.error("Error fetching today stats:", error);
      }
    };
    
    fetchTodayStats();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
  let isMounted = true;

  const fetchTotalStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const { getTotalTeamStats } = await import("../services/authService");

      const data = await getTotalTeamStats(token);

      if (isMounted && data?.success) {
        setTotalStats({
          teamBusiness: data.data?.teamBusiness || 0,
          yourCommission: data.data?.yourCommission || 0,
          teamMembers: data.data?.teamMembers || 0
        });
      }
    } catch (err) {
      console.error("Total stats error:", err);
    }
  };

  fetchTotalStats();

  return () => { isMounted = false; };
}, []);

  // ========== FETCH MEMBER DETAILS ==========
  const fetchMemberDetails = async (memberId) => {
    if (memberDetails[memberId]) return;
    
    setLoadingMember(true);
    try {
      const token = localStorage.getItem("token");
      const { getMemberDetails } = await import("../services/authService");
      
      const response = await getMemberDetails(memberId, token);
      
      if (response && response.success && response.data) {
        setMemberDetails(prev => ({
          ...prev,
          [memberId]: response.data
        }));
      } else {
        setMemberDetails(prev => ({
          ...prev,
          [memberId]: {
            userId: memberId,
            totalEarnings: 0,
            teamCashback: 0,
            directReferrals: 0,
            totalTeam: 0,
            levelEarnings: {},
            downlineCount: {},
            recentActivity: []
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
      setMemberDetails(prev => ({
        ...prev,
        [memberId]: {
          userId: memberId,
          totalEarnings: 0,
          teamCashback: 0,
          directReferrals: 0,
          totalTeam: 0,
          levelEarnings: {},
          downlineCount: {},
          recentActivity: []
        }
      }));
    } finally {
      setLoadingMember(false);
    }
  };

const markNotificationsAsRead = async (commissionIds = []) => {
  console.log("Notifications feature not implemented yet");
  // TODO: implement when backend ready
};

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    toast.success('Referral code copied!', { duration: 1000 });
  };

  const copyReferralLink = () => {
  const link = `https://cpaylink.io/auth?ref=${referralData.referralCode}`;
  navigator.clipboard.writeText(link);
  toast.success('Referral link copied!', { duration: 1000 });
};

  // ========== COMMISSION RATES ==========
  const levels = useMemo(() => [
    { level: 1, rate: "30%", color: "from-yellow-500 to-orange-500" },
    { level: 2, rate: "15%", color: "from-blue-500 to-cyan-500" },
    { level: 3, rate: "10%", color: "from-green-500 to-emerald-500" },
    { level: 4, rate: "5%", color: "from-purple-500 to-pink-500" },
    { level: 5, rate: "30%", color: "from-red-500 to-rose-500" },
    { level: 6, rate: "3%", color: "from-indigo-500 to-purple-500" },
    { level: 7, rate: "4%", color: "from-pink-500 to-red-500" },
    { level: 8, rate: "3%", color: "from-teal-500 to-green-500" },
    { level: 9, rate: "3%", color: "from-cyan-500 to-blue-500" },
    { level: 10, rate: "30%", color: "from-orange-500 to-red-500" },
    { level: 11, rate: "3%", color: "from-lime-500 to-green-500" },
    { level: 12, rate: "3%", color: "from-amber-500 to-orange-500" },
    { level: 13, rate: "3%", color: "from-emerald-500 to-teal-500" },
    { level: 14, rate: "3%", color: "from-sky-500 to-blue-500" },
    { level: 15, rate: "3%", color: "from-violet-500 to-purple-500" },
    { level: 16, rate: "5%", color: "from-fuchsia-500 to-pink-500" },
    { level: 17, rate: "10%", color: "from-rose-500 to-red-500" },
    { level: 18, rate: "15%", color: "from-amber-500 to-orange-500" },
    { level: 19, rate: "30%", color: "from-emerald-500 to-teal-500" },
    { level: 20, rate: "30%", color: "from-blue-500 to-indigo-500" },
    { level: 21, rate: "63%", color: "from-purple-500 to-pink-500" }
  ], []);

  // ========== CALCULATE TOTAL TEAM MEMBERS ==========
  const totalTeamMembersAllLegs = useMemo(() => {
    if (!legBreakdown?.legs) return 0;
    return legBreakdown.legs.reduce((total, leg) => {
      return total + (leg.stats?.totalUsers || leg.totalUsers || 0);
    }, 0);
  }, [legBreakdown]);

  // ========== LEG WISE MEMBERS COUNT ==========
  const legWiseMembers = useMemo(() => {
    if (!legBreakdown?.legs) return [];
    return legBreakdown.legs.map(leg => ({
      legNumber: leg.legNumber,
      members: leg.stats?.totalUsers || leg.totalUsers || 0,
      rootUser: leg.rootUser?.userId || leg.rootUser?.toString().slice(-6) || 'N/A',
      isActive: leg.isActive !== false
    }));
  }, [legBreakdown]);


  // ========== PAGINATED LEGS ==========
  const paginatedLegs = useMemo(() => {
    if (!legBreakdown?.legs) return [];
    const start = 0;
    const end = showAllLegs ? legBreakdown.legs.length : legsPerPage;
    return legBreakdown.legs.slice(start, end);
  }, [legBreakdown, showAllLegs, legsPerPage]);

  // ========== LEVEL MEMBERS LIST COMPONENT ==========
  const LevelMembersList = React.memo(({ level, levelStats }) => {
    if (!levelStats) {
      return (
        <div className="text-center py-4 bg-black/20 rounded-lg">
          <p className="text-xs text-gray-500">No data for Level {level}</p>
        </div>
      );
    }

    if (!levelStats.usersList || levelStats.usersList.length === 0) {
      return (
        <div className="text-center py-4 bg-black/20 rounded-lg">
          <p className="text-xs text-gray-500">No members in Level {level}</p>
          <p className="text-[8px] text-gray-600 mt-1">
            Total users: {levelStats.users || 0}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-2">
        {levelStats.usersList.map((member, idx) => {
          const isExpanded = expandedMember === member.userId;
          const details = memberDetails[member.userId];
          
          return (
            <div key={idx} className="bg-black/30 rounded-xl overflow-hidden border border-white/5 hover:border-[#00F5A0]/20 transition-all">
              
              {/* Member Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => {
                  if (isExpanded) {
                    setExpandedMember(null);
                  } else {
                    setExpandedMember(member.userId);
                    fetchMemberDetails(member.userId);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {member.userId?.charAt(0).toUpperCase() || '?'}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-bold text-white">{member.userId}</p>
                        <span className="text-[8px] bg-[#00F5A0]/20 text-[#00F5A0] px-2 py-0.5 rounded-full">
                          Level {level}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#00F5A0]">
                          ₹{Number(member.earnings || 0).toFixed(2)} earned
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-orange-400">
                          ₹{Number(member.teamCashback || 0).toFixed(2)} team
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="text-[#00F5A0] p-2 hover:bg-white/5 rounded-lg transition-all">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Member Details */}
              {isExpanded && (
                <div className="p-4 border-t border-white/10 bg-black/40">
                  {loadingMember && !details && (
                    <div className="flex items-center justify-center py-6">
                      <Loader size={24} className="animate-spin text-[#00F5A0]" />
                      <span className="ml-2 text-xs text-gray-400">Loading member details...</span>
                    </div>
                  )}

                  {details && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-black/40 p-3 rounded-lg text-center">
                          <p className="text-[8px] text-gray-500 mb-1">Total Earnings</p>
                          <p className="text-sm font-bold text-[#00F5A0]">
                            ₹{Number(details.totalEarnings || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg text-center">
                          <p className="text-[8px] text-gray-500 mb-1">Team Cashback</p>
                          <p className="text-sm font-bold text-orange-400">
                            ₹{Number(details.teamCashback || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg text-center">
                          <p className="text-[8px] text-gray-500 mb-1">Direct Referrals</p>
                          <p className="text-sm font-bold text-blue-400">{details.directReferrals || 0}</p>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg text-center">
                          <p className="text-[8px] text-gray-500 mb-1">Total Team</p>
                          <p className="text-sm font-bold text-purple-400">{details.totalTeam || 0}</p>
                        </div>
                      </div>

                      {details.downlineCount && (
                        <div className="bg-black/40 p-3 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                            <Users size={12} className="text-[#00F5A0]" />
                            Member's Downline
                          </p>
                          <div className="grid grid-cols-7 gap-1">
                            {[1,2,3,4,5,6,7].map(lvl => {
                              const count = details.downlineCount[`level${lvl}`] || 0;
                              return (
                                <div key={lvl} className="text-center">
                                  <span className="text-[7px] text-gray-500">L{lvl}</span>
                                  <p className={`text-[9px] font-bold ${count > 0 ? 'text-[#00F5A0]' : 'text-gray-600'}`}>
                                    {count}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {details.recentActivity && details.recentActivity.length > 0 && (
                        <div className="bg-black/40 p-3 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                            <Clock size={12} className="text-[#00F5A0]" />
                            Recent Activity
                          </p>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {details.recentActivity.map((activity, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[10px] bg-black/60 p-2 rounded">
                                <span className="text-gray-400">{activity.date}</span>
                                <span className="text-[#00F5A0]">₹{Number(activity.amount).toFixed(2)}</span>
                                <span className="text-gray-500">{activity.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  });

// ========== UPDATED LEG CARD COMPONENT ==========
const LegCard = React.memo(({ 
  leg, 
  expandedLeg, 
  setExpandedLeg,
  expandedLevel,      // ← prop म्हणून घ्या
  setExpandedLevel,   // ← prop म्हणून घ्या
  levelUsersCache,
  loadingLevels,
  pendingRequests,
  fetchLegLevelUsers,
  setExpandedMember,
  fetchMemberDetails
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const clickInProgress = useRef(false);
  
  // Calculate leg statistics
const unlockedLevels = leg.unlockedLevels || legBreakdown?.unlockedLevelsInEachLeg || 0;
const totalEarningsInLeg = leg.totalEarnings || leg.stats?.totalEarnings || 0;
const totalUsersInLeg = leg.totalUsers || leg.stats?.totalUsers || 0;
  const isActive = leg.isActive !== false;
  
  const isExpanded = expandedLeg === leg.legNumber;

const handleHeaderClick = (e) => {
  e.stopPropagation();
  e.preventDefault();
  
  // level-grid-item वरून आलेला click पूर्णपणे ignore कर
  if (e.target.closest('.level-grid-item')) return;
  // expanded level panel वरून आलेला click पण ignore कर
  if (e.target.closest('.level-users-panel')) return;
  
  setExpandedLeg(prev => prev === leg.legNumber ? null : leg.legNumber);
};
  
const handleLevelClick = (e, level) => {
  e.stopPropagation();
  e.preventDefault();
  
  if (clickInProgress.current) return;
  clickInProgress.current = true;
  
  const newLevel = expandedLevel === level ? null : level;
  setExpandedLevel(newLevel);  // parent state update
  
  if (newLevel !== null) {
    setLocalLoading(true);
    fetchLegLevelUsers(leg.legNumber, newLevel)
      .catch(console.error)
      .finally(() => setLocalLoading(false));
  }
  
  setTimeout(() => { clickInProgress.current = false; }, 300);
};
  
  const handleCloseLevel = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedLevel(null);
  };
  
  const handleSelectMember = (e, userId) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedMember(prev => prev === userId ? null : userId);
    fetchMemberDetails(userId);
  };
  
  return (
    <div 
      className={`bg-black/30 border rounded-xl overflow-hidden ${
        isActive ? 'border-[#00F5A0]/30' : 'border-white/10 opacity-70'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Leg Header - same as before */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-all select-none"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
              isActive ? 'from-[#00F5A0] to-green-500' : 'from-gray-500 to-gray-600'
            } flex items-center justify-center text-black font-black text-lg`}>
              {leg.legNumber}
            </div>
            <div>
              <h4 className="text-base font-bold">Directs {leg.legNumber}</h4>
              <p className="text-[10px] text-gray-400">
                Root: {leg.rootUser?.userId || (leg.rootUser?.toString().slice(-6)) || 'N/A'}
              </p>
              <div className="flex gap-2 mt-1">
                <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                  👥 {totalUsersInLeg} users
                </span>
                <span className={`text-[8px] px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {isActive ? `🔓 ${unlockedLevels}/21 levels` : '🔒 INACTIVE'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Directs Earnings</p>
              <p className="text-sm font-bold text-[#00F5A0]">₹{totalEarningsInLeg.toFixed(2)}</p>
            </div>
            {isExpanded ? <ChevronUp size={20} className="text-[#00F5A0]" /> : <ChevronDown size={20} className="text-[#00F5A0]" />}
          </div>
        </div>
      </div>
      
      {/* Expanded Leg Details */}
      {isExpanded && (
        <div 
          className="p-4 border-t border-white/10 bg-black/20"
          onClick={(e) => e.stopPropagation()}
        >
          <h5 className="text-xs font-bold text-[#00F5A0] mb-3">
            Level-wise Users in Directs {leg.legNumber}
          </h5>
          
          {/* Level Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4 max-h-40 overflow-y-auto p-1">
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(level => {
              const levelData = leg.levels?.[`level${level}`];
              const userCount = levelData?.users?.length || 0;
              const isUnlocked = levelData?.isUnlocked || level <= 3;
              const cacheKey = `${leg.legNumber}-${level}`;
              const isLoading = loadingLevels[cacheKey] || (localLoading && expandedLevel === level);
              const hasCachedUsers = levelUsersCache[cacheKey]?.length > 0;
              
              let bgColor = 'bg-gray-800/50';
              let borderColor = 'border-gray-700';
              
              if (isUnlocked) {
                if (userCount > 0 || hasCachedUsers) {
                  bgColor = 'bg-[#00F5A0]/20';
                  borderColor = 'border-[#00F5A0]/30';
                } else {
                  bgColor = 'bg-blue-500/10';
                  borderColor = 'border-blue-500/20';
                }
              }
              
              return (
                <div 
                  key={level}
                  className={`level-grid-item text-center p-2 rounded-lg ${bgColor} border ${borderColor} cursor-pointer hover:scale-105 transition-transform ${
                    expandedLevel === level ? 'ring-2 ring-[#00F5A0]' : ''
                  } ${isLoading ? 'animate-pulse' : ''}`}
                  onClick={(e) => handleLevelClick(e, level)}
                >
                  <span className="text-[8px] text-gray-400 block">L{level}</span>
                  <span className={`text-xs font-bold ${
                    userCount > 0 ? 'text-[#00F5A0]' : 
                    hasCachedUsers ? 'text-[#00F5A0]' :
                    isUnlocked ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {isLoading ? (
                      <Loader size={12} className="animate-spin mx-auto" />
                    ) : (
                      <>
                        {userCount > 0 ? userCount : 
                         hasCachedUsers ? levelUsersCache[cacheKey].length : 
                         (isUnlocked ? '0' : '🔒')}
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Expanded Level Details */}
          {expandedLevel && (
            <div 
              className="mt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <LevelUsersList
                legNumber={leg.legNumber}
                level={expandedLevel}
                users={levelUsersCache[`${leg.legNumber}-${expandedLevel}`] || []}
                isLoading={loadingLevels[`${leg.legNumber}-${expandedLevel}`] || (localLoading && expandedLevel === expandedLevel)}
                onClose={handleCloseLevel}
                onSelectMember={handleSelectMember}
                legLevel={leg.levels?.[`level${expandedLevel}`]}
              />
            </div>
          )}
          
          {/* Leg Statistics Summary */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
            <div className="text-center">
              <p className="text-[8px] text-gray-500">Total Users</p>
              <p className="text-sm font-bold text-[#00F5A0]">{totalUsersInLeg}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-gray-500">Unlocked Levels</p>
              <p className="text-sm font-bold text-green-400">{unlockedLevels}/21</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-gray-500">Directs Earnings</p>
              <p className="text-sm font-bold text-orange-400">₹{totalEarningsInLeg.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ========== LEVEL USERS LIST COMPONENT ==========
const LevelUsersList = ({ legNumber, level, users, isLoading, onClose, onSelectMember, legLevel }) => {
  const handleClose = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClose(e);
  };

  const handleUserClick = (e, userId) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectMember(e, userId);
  };
  
  // Add container click handler
  const handleContainerClick = (e) => {
    e.stopPropagation(); // CRITICAL: Stop any click from reaching parent
  };
  
  if (isLoading) {
    return (
      <div 
        className="mt-4 level-users-panel p-3 bg-black/40 rounded-lg border border-[#00F5A0]/20"
        onClick={handleContainerClick}
      >
        <div className="flex items-center justify-between mb-2">
          <h6 className="text-xs font-bold text-[#00F5A0]">
            Loading Level {level} Users...
          </h6>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
        <div className="text-center py-6">
          <Loader size={24} className="animate-spin text-[#00F5A0] mx-auto" />
          <p className="text-xs text-gray-400 mt-2">Fetching users...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="mt-4 p-3 bg-black/40 rounded-lg border border-[#00F5A0]/20"
      onClick={handleContainerClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h6 className="text-xs font-bold text-[#00F5A0]">
          Level {level} Users in Direct {legNumber}
          <span className="ml-2 text-[8px] bg-[#00F5A0]/20 px-2 py-0.5 rounded-full">
            {users.length} users
          </span>
        </h6>
        <button onClick={handleClose} className="text-gray-400 hover:text-white">
          <X size={14} />
        </button>
      </div>
      
      {users.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {users.map((user, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between bg-black/60 p-3 rounded-lg hover:bg-black/80 cursor-pointer border border-white/5"
              onClick={(e) => handleUserClick(e, user._id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  {user.userId?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user.userId}</p>
                  <p className="text-[8px] text-[#00F5A0] mt-1">
                    Earnings: ₹{user.totalEarnings?.toFixed(2) || '0'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                Level {level}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-black/60 rounded-lg">
          <p className="text-sm text-gray-500">No users in Level {level}</p>
          <p className="text-[10px] text-gray-600 mt-1">This level has 0 users</p>
        </div>
      )}
      
      <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[8px] text-gray-500">
        <span>Total Users: {users.length}</span>
        <span>Status: {legLevel?.isUnlocked ? '✅ Unlocked' : '🔒 Locked'}</span>
      </div>
    </div>
  );
};

  // ========== FOMO NOTIFICATIONS MODAL ==========
  const FomoModal = ({ notifications, onClose, onMarkRead }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    
    const handleMarkSelected = () => {
      onMarkRead(selectedIds);
      setSelectedIds([]);
    };
    
    const handleMarkAll = () => {
      onMarkRead([]);
      setSelectedIds([]);
    };
    
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[500] p-4 backdrop-blur-sm">
        <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-[#0A1F1A] p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-xl font-black text-[#00F5A0] flex items-center gap-2">
              <Bell size={20} />
              Missed Commission Alerts
              {notifications.length > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                  {notifications.length} new
                </span>
              )}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle size={40} className="mx-auto mb-3 text-green-500" />
                <p className="text-gray-400">No missed commissions! 🎉</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={handleMarkSelected}
                      disabled={selectedIds.length === 0}
                      className={`text-[10px] px-3 py-1.5 rounded-full font-bold transition-all ${
                        selectedIds.length > 0
                          ? 'bg-[#00F5A0] text-black'
                          : 'bg-white/5 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Mark Selected as Read
                    </button>
                    <button
                      onClick={handleMarkAll}
                      className="text-[10px] bg-white/5 text-gray-400 px-3 py-1.5 rounded-full font-bold hover:bg-white/10"
                    >
                      Mark All as Read
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    Total Missed: ₹{notifications.reduce((sum, n) => sum + n.amount, 0).toFixed(2)}
                  </span>
                </div>
                
                {notifications.map((notif, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4 hover:border-red-500/30 transition-all">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(notif.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, notif.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== notif.id));
                          }
                        }}
                        className="mt-1 w-4 h-4 accent-[#00F5A0]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-red-400">{notif.title}</h4>
                          <span className="text-[8px] text-gray-500">
                            {new Date(notif.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mb-2">{notif.message}</p>
                        <div className="flex gap-2 text-[10px]">
                          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                            Directs {notif.legNumber}
                          </span>
                          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                            Level {notif.level}
                          </span>
                          <span className="bg-[#00F5A0]/20 text-[#00F5A0] px-2 py-1 rounded-full">
                            ₹{notif.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[8px] text-gray-500 mt-2">{notif.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER ==========
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      
      {/* FOMO Notifications Bell */}
      {fomoNotifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={() => setShowFomoModal(true)}
            className="relative bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 p-3 rounded-full transition-all animate-pulse"
          >
            <Bell size={24} className="text-red-400" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-5 h-5 flex items-center justify-center rounded-full">
              {fomoNotifications.length}
            </span>
          </button>
        </div>
      )}
      
      {/* FOMO Modal */}
      {showFomoModal && (
        <FomoModal
          notifications={fomoNotifications}
          onClose={() => setShowFomoModal(false)}
          onMarkRead={markNotificationsAsRead}
        />
      )}
      
  {/* Referral Code Card */}
<div className="bg-gradient-to-br from-[#00F5A0] to-[#00d88c] p-8 rounded-[2.5rem] text-[#051510] shadow-2xl">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-black italic">Your Referral Code</h2>
    <Gift size={28} className="opacity-60" />
  </div>
  
<div className="flex items-center justify-between bg-black/20 p-4 rounded-xl backdrop-blur-sm">
  <span className="text-3xl font-black tracking-widest">
    {localReferralData.referralCode}
  </span>
  <div className="flex gap-2">
    <button
      onClick={copyReferralCode}
      className="bg-black text-[#00F5A0] p-3 rounded-xl hover:bg-black/80 transition-all"
      title="Copy Code"
    >
      <Copy size={20} />
    </button>
    <button
      onClick={copyReferralLink}
      className="bg-black text-[#00F5A0] p-3 rounded-xl hover:bg-black/80 transition-all"
      title="Copy Link"
    >
      <Share2 size={20} />
    </button>
  </div>
</div>
  
  <p className="text-sm font-bold mt-4 opacity-70">
    Share this code & earn commissions on 21 levels!
  </p>
</div>

      {/* ========== DYNAMIC LEGS STATUS CARD ========== */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-black italic mb-4 flex items-center gap-2">
          <Zap size={20} className="text-[#00F5A0]" />
          Your Referral Network (Dynamic Directs)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-black/40 p-3 rounded-lg text-center">
            <p className="text-[8px] text-gray-500">Direct Referrals</p>
            <p className="text-xl font-black text-[#00F5A0]">
              {legStatus?.directReferrals || referralData.directReferrals || 0}
            </p>
            <p className="text-[6px] text-gray-600">= {legStatus?.directReferrals || 0} Directs</p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg text-center">
            <p className="text-[8px] text-gray-500">Active Directs</p>
            <p className="text-xl font-black text-green-400">
              {legStatus?.activeLegs || legBreakdown?.legs?.length || 0}
            </p>
            <p className="text-[6px] text-gray-600">Total Directs: {legBreakdown?.legs?.length || 0}</p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg text-center">
            <p className="text-[8px] text-gray-500">Total Team</p>
            <p className="text-xl font-black text-blue-400">
              {statsFilter === 'today' 
                ? todayStats.teamMembers 
                : totalTeamMembersAllLegs || referralData.totalReferrals}
            </p>
            <p className="text-[6px] text-gray-600">Across {legBreakdown?.legs?.length || 0} Directs</p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg text-center">
            <p className="text-[8px] text-gray-500">Team Business</p>
            <p className="text-xl font-black text-orange-400">
              ₹{statsFilter === 'today' ? todayStats.teamBusiness.toFixed(2) : statsFilter === 'today' 
  ? todayStats.teamBusiness.toFixed(2)
  : totalStats.teamBusiness.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Missed Commissions Summary */}
        {missedCommissions && missedCommissions.totalMissed > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-xs font-bold text-red-400">Missed Commissions</span>
              </div>
              <span className="text-sm font-bold text-red-400">
                ₹{missedCommissions.totalMissed.toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              You have {missedCommissions.unreadCount} unread missed commission notifications.
              <button onClick={() => setShowFomoModal(true)} className="ml-2 text-[#00F5A0] underline">
                View
              </button>
            </p>
          </div>
        )}

{nextLevel?.nextLevel && (
  <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
    <div className="flex items-center gap-2 mb-2">
      <AlertCircle size={16} className="text-yellow-400" />
      <span className="text-xs font-bold text-yellow-400">Next Level to Unlock</span>
    </div>
    <p className="text-sm font-bold text-white">Level {nextLevel.nextLevel}</p>
    <p className="text-[10px] text-gray-400 mt-1">{nextLevel.message}</p>
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-3">
      <div 
        className="h-full bg-gradient-to-r from-[#00F5A0] to-green-500"
        style={{ width: `${Math.min(100, ((nextLevel.currentDirects || 0) / nextLevel.nextLevel) * 100)}%` }}
      />
    </div>
    <p className="text-[10px] text-gray-500 mt-2">
      {nextLevel.currentDirects}/{nextLevel.nextLevel} directs — {nextLevel.remainingDirects} more needed
    </p>
  </div>
)}
      </div>

   

      {/* ========== LEGS LIST with Pagination ========== */}
      {legBreakdown?.legs && legBreakdown.legs.length > 0 && (
        <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-black italic mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#00F5A0]" />
            Directs-wise Detailed Breakdown ({legBreakdown.legs.length} Total Directs)
            {legBreakdown.legs.length > 20 && (
              <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                Large Network: {legBreakdown.legs.length} Directs
              </span>
            )}
          </h3>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto p-2">
         {/* In your LEGS LIST section, update the LegCard rendering */}
{paginatedLegs.map((leg, index) => (
 <LegCard 
  key={leg.legNumber}
  leg={leg}
  expandedLeg={expandedLeg}
  setExpandedLeg={setExpandedLeg}
  // नवीन props
  expandedLevel={expandedLegLevel[leg.legNumber] || null}
  setExpandedLevel={(level) => setExpandedLegLevel(prev => ({
    ...prev,
    [leg.legNumber]: level
  }))}
  levelUsersCache={levelUsersCache}
  loadingLevels={loadingLevels}
  pendingRequests={pendingRequests}
  fetchLegLevelUsers={fetchLegLevelUsers}
  setExpandedMember={setExpandedMember}
  fetchMemberDetails={fetchMemberDetails}
/>
))}
            
            {legBreakdown.legs.length > legsPerPage && (
              <button
                onClick={() => setShowAllLegs(!showAllLegs)}
                className="w-full py-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-all font-bold"
              >
                {showAllLegs ? `Show Less (${legsPerPage} directs)` : `Show All ${legBreakdown.legs.length} Directs`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========== LEVEL ACCESSIBILITY MAP ========== */}
      {legStatus?.levelAccessibility && (
        <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-black italic mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#00F5A0]" />
            Level Accessibility Map (Across All Directs)
          </h3>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(level => {
              const accessible = legStatus.levelAccessibility[`level${level}`]?.isAccessible || level <= 3;
              const userCount = legStatus.levelAccessibility[`level${level}`]?.usersCount || 0;
              const requiredDirects = getHorizontalRequirement(level);
              const meetsHorizontal = legStatus.directReferrals >= requiredDirects;
              
              let bgColor = 'bg-gray-800/50';
              let borderColor = 'border-gray-700';
              
              if (accessible) {
                if (userCount > 0) {
                  bgColor = 'bg-[#00F5A0]/20';
                  borderColor = 'border-[#00F5A0]/30';
                } else {
                  bgColor = 'bg-blue-500/10';
                  borderColor = 'border-blue-500/20';
                }
              } else if (meetsHorizontal) {
                bgColor = 'bg-yellow-500/10';
                borderColor = 'border-yellow-500/20';
              }
              
              return (
                <div 
                  key={level}
                  className={`text-center p-2 rounded-lg ${bgColor} border ${borderColor}`}
                  title={`Level ${level}: ${userCount} users, Need ${requiredDirects} directs`}
                >
                  <span className="text-[8px] text-gray-400 block">L{level}</span>
                  <span className={`text-xs font-bold ${
                    userCount > 0 ? 'text-[#00F5A0]' : 
                    accessible ? 'text-blue-400' : 
                    meetsHorizontal ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {userCount > 0 ? userCount : (accessible ? '0' : meetsHorizontal ? '⏳' : '🔒')}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between text-[8px] text-gray-500 px-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#00F5A0]/20 rounded-full border border-[#00F5A0]/30"></span> Has Users</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500/10 rounded-full border border-blue-500/20"></span> Accessible (Empty)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500/10 rounded-full border border-yellow-500/20"></span> Needs Directs</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-800 rounded-full border border-gray-700"></span> Locked</span>
          </div>
        </div>
      )}

      {/* ========== STATS GRID ========== */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black italic">Team Statistics Summary</h3>
          <div className="flex gap-2 bg-black/40 p-1 rounded-lg">
            <button
              onClick={() => setStatsFilter('today')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                statsFilter === 'today' ? 'bg-[#00F5A0] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setStatsFilter('total')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                statsFilter === 'total' ? 'bg-[#00F5A0] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Total
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-[#00F5A0]/20 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center">
                <Users size={22} className="text-[#00F5A0]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Team</p>
                <p className="text-2xl font-black text-white">
                  {statsFilter === 'today' 
                    ? todayStats.teamMembers 
                    : totalTeamMembersAllLegs || referralData.totalReferrals || 0}
                </p>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 border-t border-white/5 pt-2">
              <span>{statsFilter === 'today' ? 'Active today' : 'All Directs combined'}</span>
              <span className="text-[#00F5A0]">{legBreakdown?.legs?.length || 0} Directs</span>
            </div>
          </div>

          <div className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-[#00F5A0]/20 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center">
                <TrendingUp size={22} className="text-[#00F5A0]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Team Business</p>
                <p className="text-2xl font-black text-[#00F5A0]">
                  ₹{statsFilter === 'today' ? todayStats.teamBusiness.toFixed(2) : totalStats.teamBusiness.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 border-t border-white/5 pt-2">Total cashback earned by team</p>
          </div>

          <div className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-orange-400/20 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Award size={22} className="text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Your Commission</p>
                <p className="text-2xl font-black text-orange-400">
                  ₹{statsFilter === 'today' 
                    ? todayStats.yourCommission.toFixed(2) 
                    : Number(referralData.referralEarnings?.total || 0).toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 border-t border-white/5 pt-2">Commission from team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const WalletCard = ({ label, val, sub, highlight, showRedeem, onRedeem }) => (
  <div className={`p-6 md:p-8 rounded-[2rem] border ${highlight ? "bg-[#00F5A0] text-black shadow-[0_10px_30px_rgba(0,245,160,0.2)]" : "bg-[#0A1F1A] border-white/10"}`}>
    <p className={`text-[10px] font-black uppercase mb-4 ${highlight ? "text-black/50" : "text-gray-500"}`}>{label}</p>
    <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter">{val}</h3>
    <p className="text-[10px] font-bold opacity-60 italic">{sub}</p>
    
    {showRedeem ? (
      <button 
        onClick={onRedeem} 
        className="mt-4 text-[9px] font-black bg-[#00F5A0] text-black px-3 py-1 rounded-full uppercase hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
      >
        REDEEM CASHBACK
      </button>
    ) : (
      label === "Cashback" && (
        <div className="mt-4 text-[9px] font-bold text-gray-500 bg-black/20 px-3 py-1 rounded-full text-center">
          Need atleast ₹1000 to redeem
        </div>
      )
    )}
  </div>
);

// TransactionRow Component - CORRECTED with proper currency symbols
const TransactionRow = ({ merchant, date, amt, status, type, meta = {} }) => {
  // Determine currency symbol
  let currencySymbol = "₹"; // Default INR
  
  // ✅ Case 1: DEPOSIT always in USD
  if (type === 'DEPOSIT') {
    currencySymbol = "$";
  }
  // ✅ Case 2: WALLET_ACTIVATION always in USD (कारण USDT ने होते)
  else if (type === 'WALLET_ACTIVATION') {
    currencySymbol = "$";
  }
  // ✅ Case 3: CONVERSION shows original in USD, final in INR (हाताळले meta मध्ये)
  // ✅ CREDIT, DEBIT, CASHBACK नेहमी ₹ मध्ये
  
  return (
    <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-2xl transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#00F5A0]/10 flex items-center justify-center text-[#00F5A0]">
          {merchant === 'TEAM_CASHBACK' ? <Users size={14} className="text-purple-500" /> : 
           merchant === 'DEPOSIT' ? <Wallet size={14} className="text-blue-500" /> : 
           merchant === 'WALLET_ACTIVATION' ? <Zap size={14} className="text-[#00F5A0]" /> : 
           merchant === 'CASHBACK' ? <Award size={14} className="text-orange-500" /> :
           merchant === 'CREDIT' ? <ArrowRightLeft size={14} className="text-green-500" /> :
           merchant === 'DEBIT' ? <ArrowRightLeft size={14} className="text-red-500" /> :
           <CheckCircle size={14} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">
            {merchant === 'TEAM_CASHBACK' ? 'Team Cashback' : 
             merchant === 'WALLET_ACTIVATION' ? 'Wallet Activation' : 
             merchant === 'CREDIT' ? 'Credit' :
             merchant === 'DEBIT' ? 'Debit' :
             merchant === 'CASHBACK' ? 'Cashback' :
             merchant}
          </p>
          <p className="text-[9px] text-gray-500 font-bold">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black italic">
          {currencySymbol}{amt}
          {/* Show USDT for DEPOSIT and WALLET_ACTIVATION */}
          {(type === 'DEPOSIT' || type === 'WALLET_ACTIVATION') && (
            <span className="block text-[8px] text-gray-500">USDT</span>
          )}
        </p>
        <p className="text-[8px] text-[#00F5A0] font-black uppercase italic tracking-widest">
          {type === 'WALLET_ACTIVATION' ? 'ACTIVATED' : status}
        </p>
      </div>
    </div>
  );
};
// ActionButton Component
const ActionButton = ({ icon, label, primary, onClick }) => (
  <button onClick={onClick} className={`flex-1 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center gap-3 border transition-all active:scale-95 ${primary ? "bg-[#00F5A0] text-black border-transparent" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
    <div className={primary ? "" : "text-[#00F5A0]"}>{icon}</div>
    <span className="text-xs md:text-sm italic">{label}</span>
  </button>
);

