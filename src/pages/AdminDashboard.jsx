import React, { useEffect, useState, useRef } from "react";
import { 
  LayoutDashboard, Users, CreditCard, RefreshCcw, 
  Settings, LogOut, Check, X, ShieldAlert, Menu, Loader2, ArrowRightLeft,
  Zap, Clock, Search, ScanLine, Eye, ListOrdered, TrendingUp, Award,
  ChevronDown, ChevronUp, User, Copy, DollarSign, PieChart, BarChart3,
  Users2, GitBranch, Network, Wallet, Coins, History, Download,
  Filter, ChevronLeft, ChevronRight, AlertCircle, Info, CheckCircle,PlusCircle, Gift,
  Camera
} from "lucide-react";
import { 
  getAllUsers, getAllDeposits, updateDepositStatus, 
  getAllWithdraws, updateWithdrawStatus, updateExchangeRate,
  getAllScanners, getAllTransactions, getSystemStats, getUserDetails 
} from "../services/adminService";
import toast from 'react-hot-toast';
import { LifeBuoy } from "lucide-react";
import { SupportView } from "../components/Adminsupporttab";
import API_BASE from "../services/api";
import { exportSingleUserToPDF, exportToExcel, exportToPDF } from "../utils/exportUtils";
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [exchangeRate, setExchangeRate] = useState("90.00");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [supportUnread, setSupportUnread] = useState(0);
  // Add this state in AdminDashboard component
const [systemRequests, setSystemRequests] = useState([]); // Add this state
const [creatingRequest, setCreatingRequest] = useState(false); // Add this
  
  // Refs for notification tracking
  const prevDepositCount = useRef(0);
  const prevWithdrawCount = useRef(0);

  // Calculate pending counts
  const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdraws = withdraws.filter(w => w.status === 'pending').length;


  const loadData = async () => {
    try {
      const [uData, dData, wData, sData, tData, statsData] = await Promise.all([
        getAllUsers(),
        getAllDeposits(),
        getAllWithdraws(),
        getAllScanners(),
        getAllTransactions(),
        getSystemStats()
      ]);
      
      // Check for new pending deposits
      const newDeposits = (Array.isArray(dData) ? dData : []).filter(d => d.status === 'pending').length;
      if (newDeposits > prevDepositCount.current) {
        playNotificationSound();
      }
      prevDepositCount.current = newDeposits;
      
      // Check for new pending withdraws
      const newWithdraws = (Array.isArray(wData) ? wData : []).filter(w => w.status === 'pending').length;
      if (newWithdraws > prevWithdrawCount.current) {
        playNotificationSound();
      }
      prevWithdrawCount.current = newWithdraws;
      
      setUsers(uData || []);
      setDeposits(Array.isArray(dData) ? dData : []);
      setWithdraws(Array.isArray(wData) ? wData : []);
      setScanners(Array.isArray(sData) ? sData : []);
      setTransactions(Array.isArray(tData) ? tData : []);
      setSystemStats(statsData || null);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Notification sound function
  const playNotificationSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.play().catch(err => console.log("Audio play blocked by browser"));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (type, id, status) => {
    const action = status === 'approved' ? 'approve' : 'reject';
    let res;
    if (type === 'DEPOSIT') res = await updateDepositStatus(id, action);
    else res = await updateWithdrawStatus(id, action);
    if (res) { 
      loadData(); 
      toast.success(`${type} ${status} successfully!`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };
// Update fetchSystemRequests function in AdminDashboard
const fetchSystemRequests = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/admin/system-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    
    // // ✅ ADD DEBUG LOGGING
    // console.log("=== SYSTEM REQUESTS DATA ===");
    // console.log("Raw response:", data);
    // console.log("Grouped requests:", data.groupedRequests);
    // console.log("Single requests:", data.singleRequests);
    
    if (data.success) {
      // ✅ Handle both grouped and single requests
      if (data.groupedRequests && data.groupedRequests.length > 0) {
        // Log each request's status
        data.groupedRequests.forEach(group => {
          console.log(`Group ${group.groupId}:`);
          group.requests?.forEach(req => {
            console.log(`  - User: ${req.createdFor?.userId}, Status: ${req.status}, Has screenshots: ${req.paymentScreenshots?.length || 0}`);
          });
        });
        setSystemRequests(data.groupedRequests);
      } else if (data.singleRequests && data.singleRequests.length > 0) {
        console.log("Single requests:", data.singleRequests);
        // ✅ FIX: Convert single requests to grouped format
        // Each single request becomes its own "group"
        const groupedSingleRequests = data.singleRequests.map(req => ({
          groupId: req._id,
          _id: req._id,
          amount: req.amount,
          createdAt: req.createdAt,
          totalUsers: 1,
          completed: req.status === 'COMPLETED',
          requests: [req],
          status: req.status
        }));
        setSystemRequests(groupedSingleRequests);
      } else if (data.requests) {
        console.log("Requests array:", data.requests);
        // ✅ FIX: Convert requests array to grouped format if needed
        const groupedRequests = data.requests.map(req => ({
          groupId: req._id,
          _id: req._id,
          amount: req.amount,
          createdAt: req.createdAt,
          totalUsers: 1,
          completed: req.status === 'COMPLETED',
          requests: [req],
          status: req.status
        }));
        setSystemRequests(groupedRequests);
      } else {
        setSystemRequests([]);
      }
    }
  } catch (error) {
    console.error("Error fetching system requests:", error);
    setSystemRequests([]);
  }
};
// Add this function for creating system request
const handleCreateSystemRequest = async (userId, amount = 5000) => {
  if (!userId) {
    toast.error("Please enter User ID");
    return;
  }
  
  setCreatingRequest(true);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/admin/create-system-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, amount })
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`System request created for ${userId}`);
      fetchSystemRequests();
      // Also refresh the main scanners list
      const sData = await getAllScanners();
      setScanners(Array.isArray(sData) ? sData : []);
    } else {
      toast.error(data.message || "Failed to create request");
    }
  } catch (error) {
    toast.error("Failed to create system request");
  } finally {
    setCreatingRequest(false);
  }
};

// Add useEffect to fetch system requests
useEffect(() => {
  fetchSystemRequests();
}, []);


  if (loading) return (
    <div className="min-h-screen bg-[#051510] flex flex-col items-center justify-center gap-4 text-[#00F5A0] font-black italic">
      <Loader2 className="animate-spin" size={40} />
      SYNCING ADMIN CORE...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#051510] text-white flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A1F1A] border-b border-white/5 sticky top-0 z-[100]">
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-[#00F5A0]" />
          <span className="font-bold text-xl italic tracking-tighter">ADMIN HUB</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg relative">
          <Menu className="text-[#00F5A0]" />
          {(pendingDeposits > 0 || pendingWithdraws > 0) && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* SIDEBAR / MOBILE DRAWER */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[200] transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsSidebarOpen(false)} />
      
      <aside className={`fixed md:relative inset-y-0 left-0 z-[210] w-72 bg-[#051510] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 transform md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-2">
            <div className="bg-[#00F5A0] p-1.5 rounded-lg text-[#051510]"><Zap size={20} /></div>
            <span className="text-2xl font-black italic tracking-tighter">CpayLink</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 space-y-1">
          <SidebarLink 
            icon={<LayoutDashboard size={18}/>} 
            label="Dashboard" 
            active={activeTab === "Dashboard"} 
            onClick={() => {setActiveTab("Dashboard"); setIsSidebarOpen(false);}} 
          />
          <SidebarLink 
            icon={<Users size={18}/>} 
            label="Users" 
            badge={users.length}
            active={activeTab === "Users"} 
            onClick={() => {setActiveTab("Users"); setIsSidebarOpen(false);}} 
          />
          <SidebarLink 
            icon={<CreditCard size={18}/>} 
            label="Deposits" 
            badge={pendingDeposits} 
            active={activeTab === "Deposits"} 
            onClick={() => {setActiveTab("Deposits"); setIsSidebarOpen(false);}} 
            highlight={pendingDeposits > 0}
          />
          <SidebarLink 
            icon={<ScanLine size={18}/>} 
            label="Scanners" 
            badge={scanners.filter(s => s.status === 'ACTIVE').length}
            active={activeTab === "Scanners"} 
            onClick={() => {setActiveTab("Scanners"); setIsSidebarOpen(false);}} 
          />
          <SidebarLink 
            icon={<ListOrdered size={18}/>} 
            label="Ledger" 
            badge={transactions.length}
            active={activeTab === "Ledger"} 
            onClick={() => {setActiveTab("Ledger"); setIsSidebarOpen(false);}} 
          />
<SidebarLink 
  icon={<Gift size={18}/>} 
  label="System Req" 
  badge={systemRequests.filter(s => s.status === 'PAYMENT_SUBMITTED').length}
  active={activeTab === "SystemRequests"} 
  onClick={() => {setActiveTab("SystemRequests"); setIsSidebarOpen(false);}} 
  highlight={systemRequests.filter(s => s.status === 'PAYMENT_SUBMITTED').length > 0}
/>

          <SidebarLink
  icon={<LifeBuoy size={18}/>}
  label="Support"
  badge={supportUnread}
  active={activeTab === "Support"}
  onClick={() => {setActiveTab("Support"); setIsSidebarOpen(false);}}
  highlight={supportUnread > 0}
/>
          
          <div className="pt-10 mt-10 border-t border-white/5">
            <button 
              onClick={() => {localStorage.clear(); window.location.href="/auth"}} 
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-black text-sm hover:bg-red-500/10 rounded-xl transition-all italic"
            >
              <LogOut size={18} /> Shutdown Access
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto min-h-screen w-full">
        <header className="hidden md:flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">{activeTab}</h1>
          <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-full border border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#00F5A0] text-[#051510] flex items-center justify-center font-black">A</div>
            <span className="text-xs font-bold text-gray-400">ROOT ADMIN</span>
            {(pendingDeposits > 0 || pendingWithdraws > 0) && (
              <span className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-[8px] font-black uppercase animate-pulse">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {pendingDeposits + pendingWithdraws} PENDING
              </span>
            )}
          </div>
        </header>

        {/* DASHBOARD TAB */}
        {activeTab === "Dashboard" && (
          <DashboardView 
            systemStats={systemStats}
            users={users}
            deposits={deposits}
            withdraws={withdraws}
            scanners={scanners}
            transactions={transactions}
            exchangeRate={exchangeRate}
            setExchangeRate={setExchangeRate}
            updateExchangeRate={updateExchangeRate}
            pendingDeposits={pendingDeposits}
            pendingWithdraws={pendingWithdraws}
          />
        )}

        {/* USERS TAB - COMPLETE DETAILS WITH LEGS */}
        {activeTab === "Users" && (
          <UsersView 
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setSelectedUser={setSelectedUser}
            expandedUser={expandedUser}
            setExpandedUser={setExpandedUser}
            expandedLevel={expandedLevel}
            setExpandedLevel={setExpandedLevel}
            copyToClipboard={copyToClipboard}
          />
        )}

        {/* DEPOSITS TAB */}
        {activeTab === "Deposits" && (
          <DepositsView 
            deposits={deposits}
            pendingDeposits={pendingDeposits}
            handleAction={handleAction}
          />
        )}
        
        {/* SCANNERS TAB */}
        {activeTab === "Scanners" && (
          <ScannersView scanners={scanners} />
        )}

        {/* LEDGER TAB */}
        {activeTab === "Ledger" && (
          <LedgerView 
            transactions={transactions} 
            loadData={loadData}
          />
        )}
{activeTab === "SystemRequests" && (
  <SystemRequestsView 
    requests={systemRequests}
    onRefresh={fetchSystemRequests}
    onCreateRequest={handleCreateSystemRequest}
    creatingRequest={creatingRequest}
  />
)}
        {activeTab === "Support" && <SupportView />}

        {/* BOTTOM SPACER FOR MOBILE */}
        <div className="h-20 md:hidden" />
      </main>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
}

/* ================= DASHBOARD VIEW ================= */
const DashboardView = ({ 
  users, deposits, scanners, transactions,
  pendingDeposits
}) => {
  const totalDepositVolume = deposits.reduce((sum, d) => d.status === 'approved' ? sum + d.amount : sum, 0);
  const totalScannerVolume = scanners.reduce((sum, s) => s.status === 'COMPLETED' ? sum + s.amount : sum, 0);
  
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatBox label="Total Users" val={users.length} icon={<Users size={16} />} />
        <StatBox 
          label="Active Scanners" 
          val={scanners.filter(s => s.status === 'ACTIVE').length} 
          highlight={scanners.filter(s => s.status === 'ACTIVE').length > 0}
          icon={<ScanLine size={16} />}
        />
        <StatBox 
          label="Pending Deposits" 
          val={pendingDeposits} 
          highlight={pendingDeposits > 0}
          icon={<CreditCard size={16} />}
        />
        <StatBox label="Total Transactions" val={transactions.length} icon={<Clock size={16} />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
          <p className="text-[8px] sm:text-[9px] md:text-[10px] text-blue-400 font-black uppercase mb-1 sm:mb-2">
            Deposit Volume
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
            ${totalDepositVolume.toFixed(2)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#00F5A0]/10 to-green-600/5 border border-[#00F5A0]/20 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
          <p className="text-[8px] sm:text-[9px] md:text-[10px] text-[#00F5A0] font-black uppercase mb-1 sm:mb-2">
            Scanner Volume
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
            ₹{totalScannerVolume.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-5 md:p-6 lg:p-8">
        <h3 className="text-base sm:text-lg md:text-xl font-bold italic mb-4 sm:mb-5 md:mb-6 flex items-center gap-2">
          <Clock size={16} className="text-[#00F5A0]" /> Recent Transactions
        </h3>
        <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto">
          {transactions.slice(0, 10).map(tx => (
            <div key={tx._id} className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex gap-3 items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                  tx.type === 'DEBIT' ? 'bg-red-400/10 text-red-400' : 
                  tx.type === 'CREDIT' ? 'bg-green-400/10 text-green-400' :
                  'bg-[#00F5A0]/10 text-[#00F5A0]'
                }`}>
                  {tx.type ? tx.type[0] : 'T'}
                </div>
                <div>
                  <p className="text-xs font-bold">{tx.user?.email || tx.user?.userId || 'System'}</p>
                  <p className="text-[7px] text-gray-500">{tx.type} • {new Date(tx.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
              <p className="text-xs font-black text-[#00F5A0]">
                {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UsersView = ({ 
  users, searchTerm, setSearchTerm, setSelectedUser, 
  expandedUser, setExpandedUser, expandedLevel, setExpandedLevel,
  copyToClipboard 
}) => {
  const [viewMode, setViewMode] = useState('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [memberDetails, setMemberDetails] = useState({});
  const [loadingMember, setLoadingMember] = useState(false);
  const [selectedLeg, setSelectedLeg] = useState(null);
  const [legUsersCache, setLegUsersCache] = useState({});
  
  // Search result expanded state — leg → level users
  const [searchExpandedLeg, setSearchExpandedLeg] = useState(null);
  const [searchExpandedLevel, setSearchExpandedLevel] = useState(null);
  const [searchLevelUsers, setSearchLevelUsers] = useState({});
  const [searchLevelLoading, setSearchLevelLoading] = useState(null);
  // Add these imports at the top of AdminDashboard.jsx

// Add this inside the UsersView component, before the return statement:
const handleExportAll = (format) => {
  if (format === 'excel') {
    exportToExcel(filteredUsers, 'users_export');
    toast.success('Excel export started!');
  } else if (format === 'pdf') {
    exportToPDF(filteredUsers, 'users_export');
    toast.success('PDF export started!');
  }
};

const handleExportSingleUser = (user, format) => {
  if (format === 'excel') {
    exportToExcel([user], `user_${user.userId || user._id}`);
    toast.success('User details exported!');
  } else if (format === 'pdf') {
    exportSingleUserToPDF(user);
    toast.success('User PDF generated!');
  }
};

  const API_BASE = 'https://cpay-link-backend.onrender.com';
  // const API_BASE = 'http://localhost:5000';

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ FIXED: user-specific endpoint
  const fetchLegLevelUsers = async (legNumber, level, userId) => {
    const cacheKey = `${userId}-${legNumber}-${level}`;
    if (legUsersCache[cacheKey]) return legUsersCache[cacheKey];
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/api/admin/user/${userId}/leg/${legNumber}/level/${level}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        const cached = {
          users: data.data.users || [],
          earnings: data.data.levelEarnings || 0,
          teamCashback: data.data.levelTeamCashback || 0
        };
        setLegUsersCache(prev => ({ ...prev, [cacheKey]: cached }));
        return cached;
      }
    } catch (error) {
      console.error("Error fetching leg level users:", error);
    }
    return { users: [], earnings: 0, teamCashback: 0 };
  };

  // ✅ NEW: Search result mdhe level users fetch
  const fetchSearchLevelUsers = async (userId, legNumber, levelNum) => {
    const cacheKey = `${userId}-${legNumber}-${levelNum}`;
    if (searchLevelUsers[cacheKey]) {
      setSearchExpandedLevel(cacheKey);
      return;
    }
    setSearchLevelLoading(cacheKey);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/admin/user/${userId}/leg/${legNumber}/level/${levelNum}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setSearchLevelUsers(prev => ({
          ...prev,
          [cacheKey]: {
            users: data.data.users || [],
            earnings: data.data.levelEarnings || 0,
            teamCashback: data.data.levelTeamCashback || 0
          }
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLevelLoading(null);
      setSearchExpandedLevel(cacheKey);
    }
  };

  const fetchMemberDetails = async (memberId) => {
    if (memberDetails[memberId]) return memberDetails[memberId];
    setLoadingMember(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/admin/user/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMemberDetails(prev => ({ ...prev, [memberId]: data.user }));
        return data.user;
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
    } finally {
      setLoadingMember(false);
    }
    return null;
  };

  const calculateTeamCount = (user) => {
    if (!user?.legs) return 0;
    return user.legs.reduce((total, leg) => total + (leg.stats?.totalUsers || 0), 0);
  };
  const calculateTotalEarnings = (user) => {
    if (!user?.legs) return 0;
    return user.legs.reduce((total, leg) => total + (leg.stats?.totalEarnings || 0), 0);
  };
  const calculateTotalTeamCashback = (user) => {
    if (!user?.legs) return 0;
    return user.legs.reduce((total, leg) => total + (leg.stats?.totalTeamCashback || 0), 0);
  };
  const getDirectCount = (user) => user?.legs?.length || 0;
  const getLevelWiseCounts = (user) => {
    const counts = {};
    if (!user?.legs) return counts;
    for (let level = 1; level <= 21; level++) {
      let totalUsers = 0;
      for (const leg of user.legs) {
        totalUsers += leg.levels?.[`level${level}`]?.users?.length || 0;
      }
      if (totalUsers > 0) counts[`level${level}`] = totalUsers;
    }
    return counts;
  };
  const getUnlockedLegsCount = (user) => user.legs?.filter(leg => leg.isActive).length || 0;

  useEffect(() => {
    const handleResize = () => setViewMode(window.innerWidth >= 768 ? 'table' : 'cards');
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  

  // ✅ NEW: Search result user cha referral tree inline panel
  const SearchUserReferralPanel = ({ user }) => {
    const legs = user.legs || [];
    const [localExpandedLeg, setLocalExpandedLeg] = useState(null);

    return (
      
      <div className="mt-3 border-t border-white/10 pt-3 space-y-3">
        
        {/* Summary */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-black/40 p-2 rounded-lg text-center">
            <p className="text-[7px] text-gray-500">Directs</p>
            <p className="text-sm font-bold text-blue-400">{legs.length}</p>
          </div>
          <div className="bg-black/40 p-2 rounded-lg text-center">
            <p className="text-[7px] text-gray-500">Team</p>
            <p className="text-sm font-bold text-[#00F5A0]">{calculateTeamCount(user)}</p>
          </div>
          <div className="bg-black/40 p-2 rounded-lg text-center">
            <p className="text-[7px] text-gray-500">Earnings</p>
            <p className="text-sm font-bold text-orange-400">₹{calculateTotalEarnings(user).toFixed(0)}</p>
          </div>
          <div className="bg-black/40 p-2 rounded-lg text-center">
            <p className="text-[7px] text-gray-500">Cashback</p>
            <p className="text-sm font-bold text-green-400">₹{calculateTotalTeamCashback(user).toFixed(0)}</p>
          </div>
        </div>

        {/* Wallets */}
        <div className="bg-black/40 p-3 rounded-lg">
          <p className="text-[9px] font-bold text-[#00F5A0] mb-2">Wallets</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[6px] text-gray-500">USDT</p>
              <p className="text-xs font-bold text-blue-400">{(user.wallets?.USDT || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[6px] text-gray-500">INR</p>
              <p className="text-xs font-bold text-[#00F5A0]">₹{(user.wallets?.INR || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[6px] text-gray-500">CASHBACK</p>
              <p className="text-xs font-bold text-orange-400">₹{(user.wallets?.CASHBACK || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Legs → Levels → Users */}
        {legs.length === 0 ? (
          <p className="text-center text-gray-500 text-xs py-4">No referrals yet</p>
        ) : (
          <div className="space-y-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Direct Referrals Tree</p>
            {legs.map(leg => {
              const isLegOpen = localExpandedLeg === leg.legNumber;
              const legUsers = leg.stats?.totalUsers || 0;
              const legEarnings = leg.stats?.totalEarnings || 0;

              return (
                <div key={leg.legNumber} className="border border-white/10 rounded-xl overflow-hidden">
                  {/* Leg Header */}
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-black/40 transition-all"
                    onClick={() => setLocalExpandedLeg(isLegOpen ? null : leg.legNumber)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        leg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {leg.legNumber}
                      </div>
                      <div>
                        <p className="text-xs font-bold">Direct {leg.legNumber}</p>
                        <p className="text-[8px] text-gray-500">
                          Root: {leg.rootUser?.userId || 'N/A'} • {legUsers} users
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[8px] text-orange-400 font-bold">₹{legEarnings}</p>
                        <p className="text-[6px] text-gray-500">earned</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedLeg({ user, leg }); }}
                        className="text-[8px] bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-1 rounded-lg font-bold"
                      >
                        Full View
                      </button>
                      {isLegOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Level Grid */}
                  {isLegOpen && (
                    <div className="p-3 border-t border-white/5 bg-black/20 space-y-3">
                      <div className="grid grid-cols-7 gap-1">
                        {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(levelNum => {
                          const lvData = leg.levels?.[`level${levelNum}`] || {};
                          const cnt = lvData.users?.length || 0;
                          const unlocked = lvData.isUnlocked || false;
                          const cacheKey = `${user._id}-${leg.legNumber}-${levelNum}`;
                          const isActive = searchExpandedLevel === cacheKey;
                          const isLoading = searchLevelLoading === cacheKey;

                          return (
                            <button
                              key={levelNum}
                              onClick={() => {
                                if (cnt === 0) return;
                                if (isActive) { setSearchExpandedLevel(null); return; }
                                fetchSearchLevelUsers(user._id, leg.legNumber, levelNum);
                              }}
                              disabled={cnt === 0}
                              className={`text-center p-1.5 rounded-lg transition-all ${
                                cnt === 0 ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                              } ${isActive ? 'ring-2 ring-[#00F5A0]' : ''} ${
                                cnt > 0
                                  ? 'bg-[#00F5A0]/20 border border-[#00F5A0]/30'
                                  : unlocked
                                    ? 'bg-blue-500/10 border border-blue-500/20'
                                    : 'bg-gray-800/50 border border-gray-700/50'
                              }`}
                            >
                              <span className="text-[5px] text-gray-400 block">L{levelNum}</span>
                              {isLoading ? (
                                <Loader2 size={8} className="animate-spin text-[#00F5A0] mx-auto" />
                              ) : (
                                <span className={`text-[9px] font-bold ${
                                  cnt > 0 ? 'text-[#00F5A0]' :
                                  unlocked ? 'text-blue-400' : 'text-gray-600'
                                }`}>{cnt}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Level Users Panel */}
                      {searchExpandedLevel?.startsWith(`${user._id}-${leg.legNumber}-`) && (() => {
                        const cached = searchLevelUsers[searchExpandedLevel];
                        const lvNum = parseInt(searchExpandedLevel.split('-')[2]);
                        const lvData = leg.levels?.[`level${lvNum}`] || {};

                        return (
                          <div className="bg-black/40 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-bold text-[#00F5A0] flex items-center gap-2">
                                Level {lvNum} Members
                                <span className="text-[9px] bg-[#00F5A0]/10 px-2 py-0.5 rounded-full">
                                  {cached?.users?.length || 0} users
                                </span>
                              </h4>
                              <button onClick={() => setSearchExpandedLevel(null)} className="text-gray-500 hover:text-white">
                                <X size={12} />
                              </button>
                            </div>

                            {/* Level Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="bg-black/30 p-1.5 rounded text-center">
                                <p className="text-[6px] text-gray-500">Earnings</p>
                                <p className="text-xs font-bold text-orange-400">
                                  ₹{cached?.earnings ?? lvData.earnings ?? 0}
                                </p>
                              </div>
                              <div className="bg-black/30 p-1.5 rounded text-center">
                                <p className="text-[6px] text-gray-500">Cashback</p>
                                <p className="text-xs font-bold text-green-400">
                                  ₹{cached?.teamCashback ?? lvData.teamCashback ?? 0}
                                </p>
                              </div>
                            </div>

                            {/* Members List */}
                            {searchLevelLoading === searchExpandedLevel ? (
                              <div className="text-center py-4">
                                <Loader2 size={16} className="animate-spin text-[#00F5A0] mx-auto" />
                              </div>
                            ) : cached?.users?.length > 0 ? (
                              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {cached.users.map((member, idx) => (
                                  <div key={idx} className="bg-black/50 p-2.5 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">
                                          {member.userId?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold">{member.userId}</p>
                                          <p className="text-[7px] text-gray-500">{member.email}</p>
                                        </div>
                                      </div>
                                      <p className="text-xs font-bold text-[#00F5A0]">₹{member.totalEarnings || 0}</p>
                                    </div>
                                    <div className="flex gap-2 mt-1.5 pt-1.5 border-t border-white/5">
                                      <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                        D:{member.directCount || 0}
                                      </span>
                                      <span className="text-[7px] bg-[#00F5A0]/20 text-[#00F5A0] px-1.5 py-0.5 rounded">
                                        T:{member.teamCount || 0}
                                      </span>
                                      <span className="text-[7px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                                        {member.referralCode}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-gray-500 text-xs py-3">No users in this level</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2rem] overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-b border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold italic flex items-center gap-2">
            <Users size={16} className="text-[#00F5A0]" />
            <span>Users - Complete Details</span>
            <span className="bg-[#00F5A0]/10 text-[#00F5A0] text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full">
              {filteredUsers.length}
            </span>
          </h3>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative">
    <button
      id="exportButton"
      onClick={(e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('exportDropdown');
        if (dropdown) dropdown.classList.toggle('hidden');
      }}
      className="bg-[#00F5A0]/10 text-[#00F5A0] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#00F5A0]/20 transition-all"
    >
      <Download size={12} />
      Export
      <ChevronDown size={10} />
    </button>
    <div
      id="exportDropdown"
      className="hidden absolute right-0 mt-2 bg-[#0A1F1A] border border-white/10 rounded-xl shadow-xl z-50 min-w-[160px]"
    >
      <button
        onClick={() => handleExportAll('excel')}
        className="w-full px-4 py-2 text-left text-xs font-bold text-white hover:bg-white/5 rounded-t-xl flex items-center gap-2"
      >
        <Download size={12} />
        Export All to Excel
      </button>
      <button
        onClick={() => handleExportAll('pdf')}
        className="w-full px-4 py-2 text-left text-xs font-bold text-white hover:bg-white/5 rounded-b-xl flex items-center gap-2"
      >
        <Download size={12} />
        Export All to PDF
      </button>
    </div>
  </div>
            <div className="flex md:hidden bg-white/5 rounded-lg p-1">
              <button onClick={() => setViewMode('table')} className={`px-2 py-1 rounded text-[8px] font-bold ${viewMode === 'table' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'}`}>Table</button>
              <button onClick={() => setViewMode('cards')} className={`px-2 py-1 rounded text-[8px] font-bold ${viewMode === 'cards' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'}`}>Cards</button>
            </div>
            <div className="relative flex-1 sm:flex-initial sm:w-48 md:w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
              <input 
                type="text" 
                placeholder="Search by email, userId, referral..." 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                className="bg-black/40 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-[10px] sm:text-xs w-full outline-none focus:border-[#00F5A0]" 
              />
            </div>
          </div>
        </div>

        {/* ✅ NEW: Search active असताना result count + hint दाखव */}
        {searchTerm && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <span className="text-[9px] text-[#00F5A0] font-bold">{filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''} found</span>
            <span className="text-[8px] text-gray-500">• Click on a row to expand referral tree</span>
            {filteredUsers.length > 0 && (
              <button
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="ml-auto text-[8px] text-gray-500 hover:text-white flex items-center gap-1"
              >
                <X size={10} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Mobile Filters */}
        <div className="md:hidden mt-2">
          <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold">
            <span className="flex items-center gap-2"><Filter size={12} /> Filter & Sort</span>
            {showMobileFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showMobileFilters && (
            <div className="mt-2 p-2 bg-black/40 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] text-gray-500">Show:</span>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-black/60 border border-white/10 rounded px-2 py-1 text-[8px] font-bold">
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-2 py-1 rounded text-[8px] font-bold ${currentPage === 1 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#00F5A0] text-black'}`}>Prev</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`px-2 py-1 rounded text-[8px] font-bold ${currentPage === totalPages ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#00F5A0] text-black'}`}>Next</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Items Per Page */}
        <div className="hidden md:flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Show:</span>
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold">
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
            <span className="text-[10px] text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ SEARCH RESULT VIEW — search active असताना special card layout */}
      {searchTerm && filteredUsers.length > 0 ? (
        <div className="p-3 space-y-3">
          {paginatedUsers.map(u => (
            <div key={u._id} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
              {/* User Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/60 transition-all"
                onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-sm">
                    {u.email?.charAt(0)?.toUpperCase() || u.userId?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{u.email || u.userId}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[8px] text-gray-400">ID: {u.userId}</span>
                      <span className="text-[8px] text-gray-500">•</span>
                      <span className="text-[8px] text-gray-400">Ref: {u.referralCode}</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">D:{u.legs?.length || 0}</span>
                      <span className="text-[7px] bg-[#00F5A0]/20 text-[#00F5A0] px-1.5 py-0.5 rounded">T:{calculateTeamCount(u)}</span>
                      <span className="text-[7px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">₹{calculateTotalEarnings(u).toFixed(0)}</span>
                      <span className="text-[7px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">CB:₹{calculateTotalTeamCashback(u).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
                    className="bg-[#00F5A0]/10 text-[#00F5A0] px-3 py-1.5 rounded-lg text-[9px] font-bold"
                  >
                    Details
                  </button>
                  {expandedUser === u._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* ✅ Expanded: Full referral tree */}
              {expandedUser === u._id && (
                <div className="px-4 pb-4">
                  <SearchUserReferralPanel user={u} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : searchTerm && filteredUsers.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold">No users found</p>
          <p className="text-[10px] mt-1">Try searching by email, user ID or referral code</p>
        </div>
      ) : (
        <>
          {/* Normal table/card view — search नसताना */}
          {viewMode === 'table' && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[8px] lg:text-[10px] uppercase text-gray-600 font-black border-b border-white/5 bg-black/10">
                  <tr>
                    <th className="px-2 lg:px-3 py-2 lg:py-3">User</th>
                    <th className="px-2 lg:px-3 py-2 lg:py-3">Direct</th>
                    <th className="px-2 lg:px-3 py-2 lg:py-3">Team</th>
                    <th className="px-2 lg:px-3 py-2 lg:py-3">Levels</th>
                    <th className="px-2 lg:px-3 py-2 lg:py-3">Earnings</th>
                    <th className="px-2 lg:px-3 py-2 lg:py-3">Team Cashback</th>
                    <th className="px-2 lg:px-3 py-2 lg:py-3">Direct Referrals</th>
                    <th className="px-2 lg:px-3 py-2 lg:py-3">Requests</th>
                    <th className="px-2 lg:px-3 py-2 lg:py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedUsers.map(u => {
                    const teamCount = calculateTeamCount(u);
                    const directCount = getDirectCount(u);
                    const totalEarnings = calculateTotalEarnings(u);
                    const teamCashbackTotal = calculateTotalTeamCashback(u);
                    const levelCounts = getLevelWiseCounts(u);
                    const levelSummary = Object.entries(levelCounts).slice(0, 3).map(([lvl, cnt]) => `${lvl}:${cnt}`).join(', ');
                    const remainingLevels = Object.keys(levelCounts).length - 3;
                    const totalPayRequests = u.totalPayRequests || 0;
                    const totalAccepted = u.totalAcceptedRequests || 0;
                    const legs = u.legs || [];

                    return (
                      <React.Fragment key={u._id}>
                        <tr className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}>
                          <td className="px-2 lg:px-3 py-2 lg:py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-xs">
                                {u.email?.charAt(0)?.toUpperCase() || u.userId?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-xs">{u.email || u.userId}</p>
                                <p className="text-[6px] text-gray-500">Ref: {u.referralCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 lg:px-3 py-2 lg:py-3"><span className="text-xs font-bold text-blue-400">{directCount}</span></td>
                          <td className="px-2 lg:px-3 py-2 lg:py-3"><span className="text-xs font-bold text-[#00F5A0]">{teamCount}</span></td>
                          <td className="px-2 lg:px-3 py-2 lg:py-3">
                            <div className="text-[8px]">
                              {levelSummary}
                              {remainingLevels > 0 && <span className="text-gray-500 ml-1">+{remainingLevels}</span>}
                            </div>
                          </td>
                          <td className="px-2 lg:px-3 py-2 lg:py-3"><p className="text-xs font-bold text-orange-400">₹{totalEarnings.toFixed(2)}</p></td>
                          <td className="px-2 lg:px-3 py-2 lg:py-3"><p className="text-xs font-bold text-green-400">₹{teamCashbackTotal.toFixed(2)}</p></td>
                          <td className="px-2 lg:px-3 py-2 lg:py-3">
                            <div className="flex flex-wrap gap-1">
                              {legs.length > 0 ? legs.map(leg => (
                                <button key={leg.legNumber} onClick={(e) => { e.stopPropagation(); setSelectedLeg({ user: u, leg }); }}
                                  className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${leg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                  L{leg.legNumber}
                                </button>
                              )) : <span className="text-[8px] text-gray-600">No legs</span>}
                            </div>
                          </td>
                          <td className="px-2 lg:px-3 py-2 lg:py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">C:{totalPayRequests}</span>
                              <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">A:{totalAccepted}</span>
                            </div>
                          </td>
                        <td className="px-2 lg:px-3 py-2 lg:py-3 text-right">
  <div className="flex items-center justify-end gap-1">
    {/* ✅ ADD THIS EXPORT BUTTON */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleExportSingleUser(u, 'pdf');
      }}
      className="text-[#00F5A0] p-1 hover:bg-white/5 rounded"
      title="Export PDF"
    >
      <Download size={12} />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        setSelectedUser(u);
      }}
      className="bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-1 rounded-lg text-[8px] font-bold"
    >
      Details
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        setExpandedUser(expandedUser === u._id ? null : u._id);
      }}
      className="text-gray-500 p-1"
    >
      {expandedUser === u._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
  </div>
</td>
                        </tr>
                        {expandedUser === u._id && (
                          <tr className="bg-black/40">
                            <td colSpan="9" className="px-3 py-3">
                              <UserExpandedDetails user={u} copyToClipboard={copyToClipboard} expandedLevel={expandedLevel} setExpandedLevel={setExpandedLevel} fetchMemberDetails={fetchMemberDetails} memberDetails={memberDetails} loadingMember={loadingMember} setSelectedLeg={setSelectedLeg} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {(viewMode === 'cards' || window.innerWidth < 768) && (
            <div className="md:hidden space-y-2 p-3">
              {paginatedUsers.map(u => (
                <MobileUserCard key={u._id} user={u} expandedUser={expandedUser} setExpandedUser={setExpandedUser} setSelectedUser={setSelectedUser} copyToClipboard={copyToClipboard} expandedLevel={expandedLevel} setExpandedLevel={setExpandedLevel} fetchMemberDetails={fetchMemberDetails} memberDetails={memberDetails} loadingMember={loadingMember} setSelectedLeg={setSelectedLeg} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {filteredUsers.length > itemsPerPage && (
        <div className="flex items-center justify-between p-3 border-t border-white/5">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${currentPage === 1 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#00F5A0] text-black'}`}>Previous</button>
          <span className="text-[10px] text-gray-500">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${currentPage === totalPages ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#00F5A0] text-black'}`}>Next</button>
        </div>
      )}

      {/* Leg Details Modal */}
      {selectedLeg && (
        <LegDetailsModal
          user={selectedLeg.user}
          leg={selectedLeg.leg}
          onClose={() => setSelectedLeg(null)}
        />
      )}
    </div>
  );
};

/* ================= MOBILE USER CARD ================= */
const MobileUserCard = ({ user, expandedUser, setExpandedUser, setSelectedUser, copyToClipboard, expandedLevel, setExpandedLevel, fetchMemberDetails, memberDetails, loadingMember, setSelectedLeg }) => {
  const isExpanded = expandedUser === user._id;
const teamCount = user.legs?.reduce((sum, leg) => sum + (leg.stats?.totalUsers || 0), 0) || 0;
const directCount = user.legs?.length || 0;
const totalEarnings = user.legs?.reduce((sum, leg) => sum + (leg.stats?.totalEarnings || 0), 0) || 0;

  return (
    <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
      <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => setExpandedUser(isExpanded ? null : user._id)}>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-sm">
            {user.email?.charAt(0)?.toUpperCase() || user.userId?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold">{user.email?.split('@')[0] || user.userId}</p>
            <div className="flex gap-1 mt-1">
              <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">D:{directCount}</span>
              <span className="text-[7px] bg-[#00F5A0]/20 text-[#00F5A0] px-1.5 py-0.5 rounded">T:{teamCount}</span>
              <span className="text-[7px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">₹{totalEarnings.toFixed(0)}</span>
            </div>
          </div>
        </div>
       <div className="flex items-center gap-1">
  {/* ✅ ADD THIS EXPORT BUTTON */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleExportSingleUser(user, 'pdf');
    }}
    className="text-[#00F5A0] p-1 hover:bg-white/5 rounded"
    title="Export PDF"
  >
    <Download size={12} />
  </button>
  <button
    onClick={(e) => {
      e.stopPropagation();
      setSelectedUser(user);
    }}
    className="bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-1 rounded-lg text-[8px] font-bold"
  >
    View
  </button>
  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
</div>
      </div>
      <div className="px-3 pb-2 flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(user.referralCode); }} className="bg-white/5 text-gray-400 px-2 py-1 rounded-lg text-[8px] font-bold flex items-center gap-1"><Copy size={8} /> Copy Ref</button>
      </div>
      
      {/* Legs in Mobile View */}
      {user.legs && user.legs.length > 0 && (
        <div className="px-3 pb-2 pt-0">
          <p className="text-[6px] text-gray-500 mb-1">Directs:</p>
          <div className="flex flex-wrap gap-1">
            {user.legs.map(leg => (
              <button
                key={leg.legNumber}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLeg({ user, leg });
                }}
                className={`text-[6px] px-2 py-0.5 rounded-full ${
                  leg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                Directs {leg.legNumber}: {leg.stats?.totalUsers || 0}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          <UserExpandedDetails 
            user={user} 
            copyToClipboard={copyToClipboard} 
            expandedLevel={expandedLevel} 
            setExpandedLevel={setExpandedLevel}
            fetchMemberDetails={fetchMemberDetails}
            memberDetails={memberDetails}
            loadingMember={loadingMember}
            mobileView={true}
            setSelectedLeg={setSelectedLeg}
          />
        </div>
      )}
    </div>
  );
};

const UserExpandedDetails = ({ user, copyToClipboard, expandedLevel, setExpandedLevel, fetchMemberDetails, memberDetails, loadingMember, setSelectedLeg }) => {
  const [showCreatedList, setShowCreatedList] = useState(false);
  const [showAcceptedList, setShowAcceptedList] = useState(false);
  const [showLevelMembers, setShowLevelMembers] = useState({});
  const [expandedLeg, setExpandedLeg] = useState(null);
  
  // Legs data
  const legs = user.legs || [];
  
  // Calculate totals from legs
  const totalTeam = legs.reduce((sum, leg) => sum + (leg.stats?.totalUsers || 0), 0);
  const totalEarnings = legs.reduce((sum, leg) => sum + (leg.stats?.totalEarnings || 0), 0);
  const totalTeamCashback = legs.reduce((sum, leg) => sum + (leg.stats?.totalTeamCashback || 0), 0);
  const activeLegs = legs.filter(leg => leg.isActive).length;
  
  // Get level-wise data from all legs
  const levelData = {};
  for (let level = 1; level <= 21; level++) {
    levelData[`level${level}`] = {
      users: 0,
      earnings: 0,
      teamCashback: 0
    };
    
    for (const leg of legs) {
      const levelInfo = leg.levels?.[`level${level}`];
      if (levelInfo) {
        levelData[`level${level}`].users += levelInfo.users?.length || 0;
        levelData[`level${level}`].earnings += levelInfo.earnings || 0;
        levelData[`level${level}`].teamCashback += levelInfo.teamCashback || 0;
      }
    }
  }

  // Missed commissions
  const missedCommissions = user.missedCommissions || [];
  const totalMissedAmount = missedCommissions.reduce((sum, mc) => sum + (mc.amount || 0), 0);

  // Wallet balances (from user object or default)
  const wallets = {
    USDT: user.wallets?.USDT || 0,
    INR: user.wallets?.INR || 0,
    CASHBACK: user.wallets?.CASHBACK || 0
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <QuickStatCard label="User ID" value={user.userId} />
        <QuickStatCard label="Referral Code" value={user.referralCode} copyable onCopy={() => copyToClipboard(user.referralCode)} />
        <QuickStatCard label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        <QuickStatCard label="Referred By" value={user.referredBy?.userId || 'None'} />
      </div>

      {/* Wallets */}
      <div className="bg-black/40 p-3 rounded-lg">
        <h4 className="text-[10px] font-bold mb-2 text-[#00F5A0]">Wallet Balances</h4>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[6px] text-gray-500">USDT</p>
            <p className="text-sm font-bold text-blue-400">{wallets.USDT.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[6px] text-gray-500">INR</p>
            <p className="text-sm font-bold text-[#00F5A0]">₹{wallets.INR.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[6px] text-gray-500">CASHBACK</p>
            <p className="text-sm font-bold text-orange-400">₹{wallets.CASHBACK.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Referral Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SummaryCard label="Direct" value={legs.length} color="blue" />
        <SummaryCard label="Total Team" value={totalTeam} color="purple" />
        <SummaryCard label="Earnings" value={`₹${totalEarnings.toFixed(2)}`} color="orange" />
        <SummaryCard label="Team Cashback" value={`₹${totalTeamCashback.toFixed(2)}`} color="green" />
      </div>

      {/* Missed Commissions */}
      {missedCommissions.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
          <h4 className="text-[10px] font-bold mb-2 text-red-400 flex items-center gap-2">
            <AlertCircle size={12} /> Missed Commissions ({missedCommissions.length})
          </h4>
          <p className="text-xs font-bold text-red-400">Total Missed: ₹{totalMissedAmount.toFixed(2)}</p>
          <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
            {missedCommissions.slice(0, 3).map((mc, idx) => (
              <div key={idx} className="text-[8px] text-gray-400 flex justify-between">
                <span>Directs {mc.legNumber} L{mc.level}</span>
                <span className="text-red-400">₹{mc.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Referrals Overview */}
      {legs.length > 0 && (
        <div className="bg-black/40 p-3 rounded-lg">
          <h4 className="text-[10px] font-bold mb-2 text-[#00F5A0] flex items-center gap-2">
            <GitBranch size={12} /> Direct Referrals Overview ({activeLegs}/{legs.length} Active)
          </h4>
          
          <div className="space-y-2">
            {legs.map(leg => {
              const unlockedLevels = Object.values(leg.levels || {}).filter(l => l.isUnlocked).length;
              const totalUsersInLeg = leg.stats?.totalUsers || 0;
              const totalEarningsInLeg = leg.stats?.totalEarnings || 0;
              
              return (
                <div key={leg.legNumber} className="border border-white/10 rounded-lg overflow-hidden">
                  <div 
                    onClick={() => setExpandedLeg(expandedLeg === leg.legNumber ? null : leg.legNumber)}
                    className="w-full flex justify-between items-center p-2 bg-black/30 hover:bg-black/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                        leg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        Directs {leg.legNumber}
                      </span>
                      <span className="text-[6px] text-gray-400">
                        {totalUsersInLeg} users • {unlockedLevels}/21 levels
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLeg({ user, leg });
                        }}
                        className="text-[8px] bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-0.5 rounded hover:bg-[#00F5A0]/20 cursor-pointer"
                      >
                        View
                      </div>
                      {expandedLeg === leg.legNumber ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </div>
                  </div>
                  
                  {expandedLeg === leg.legNumber && (
                    <div className="p-2 bg-black/20">
                      {/* Level Grid - First 7 levels preview */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {[1,2,3,4,5,6,7].map(level => {
                          const levelData = leg.levels?.[`level${level}`];
                          const userCount = levelData?.users?.length || 0;
                          
                          return (
                            <div key={level} className={`text-center p-1 rounded ${
                              levelData?.isUnlocked 
                                ? userCount > 0 
                                  ? 'bg-[#00F5A0]/20' 
                                  : 'bg-blue-500/10'
                                : 'bg-gray-800/50'
                            }`}>
                              <span className="text-[5px] text-gray-400 block">L{level}</span>
                              <span className={`text-[8px] font-bold ${
                                userCount > 0 ? 'text-[#00F5A0]' : 
                                levelData?.isUnlocked ? 'text-blue-400' : 'text-gray-500'
                              }`}>
                                {userCount}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Leg Stats */}
                      <div className="grid grid-cols-3 gap-1 text-[6px]">
                        <div className="bg-black/40 p-1 rounded text-center">
                          <span className="text-gray-500">Earnings:</span>
                          <span className="ml-1 text-[#00F5A0]">₹{totalEarningsInLeg}</span>
                        </div>
                        <div className="bg-black/40 p-1 rounded text-center">
                          <span className="text-gray-500">Cashback:</span>
                          <span className="ml-1 text-orange-400">₹{leg.stats?.totalTeamCashback || 0}</span>
                        </div>
                        <div className="bg-black/40 p-1 rounded text-center">
                          <span className="text-gray-500">Unlocked:</span>
                          <span className="ml-1 text-green-400">{unlockedLevels}/21</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Level-wise Summary */}
      <div className="bg-black/40 p-3 rounded-lg">
        <h4 className="text-[10px] font-bold mb-2 text-[#00F5A0]">Level-wise Summary</h4>
        <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto">
          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(level => {
            const data = levelData[`level${level}`];
            if (data.users === 0) return null;
            
            return (
              <div key={level} className="bg-black/30 p-1 rounded text-center">
                <span className="text-[6px] text-gray-400 block">L{level}</span>
                <span className="text-[8px] font-bold text-[#00F5A0]">{data.users}</span>
                <span className="text-[5px] text-gray-500 block">₹{data.earnings}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pay Request Statistics */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-3 rounded-lg">
        <h4 className="text-[10px] font-bold mb-2 text-blue-400 flex items-center gap-2">
          <CreditCard size={12} /> Pay Request Statistics
        </h4>
        
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-black/40 p-2 rounded text-center">
            <p className="text-[6px] text-gray-500">Created</p>
            <p className="text-sm font-bold text-[#00F5A0]">{user.totalPayRequests || 0}</p>
          </div>
          <div className="bg-black/40 p-2 rounded text-center">
            <p className="text-[6px] text-gray-500">Accepted</p>
            <p className="text-sm font-bold text-green-400">{user.totalAcceptedRequests || 0}</p>
          </div>
          <div className="bg-black/40 p-2 rounded text-center">
            <p className="text-[6px] text-gray-500">Pending</p>
            <p className="text-sm font-bold text-orange-400">{(user.totalPayRequests || 0) - (user.totalAcceptedRequests || 0)}</p>
          </div>
        </div>
      </div>

      {/* Activation Status */}
      {user.walletActivated && (
        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
          <h4 className="text-[10px] font-bold mb-1 text-green-400">Wallet Activated</h4>
          <p className="text-[8px] text-gray-400">
            Daily Limit: ₹{user.dailyAcceptLimit} • Expires: {new Date(user.activationExpiryDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
const LegDetailsModal = ({ user, leg, onClose }) => {
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [levelUsers, setLevelUsers] = useState({});
  const [loadingLevel, setLoadingLevel] = useState(false);
  const [levelStats, setLevelStats] = useState({});

  const API_BASE = 'https://cpay-link-backend.onrender.com';
  // const API_BASE = 'http://localhost:5000';

  const fetchLevelUsers = async (level) => {
    if (levelUsers[level]) return; // already cached
    setLoadingLevel(true);
    try {
      const token = localStorage.getItem("token");
      // Use user-specific endpoint: /api/admin/user/:userId/leg/:legNumber/level/:level
      const response = await fetch(
        `${API_BASE}/api/admin/user/${user._id}/leg/${leg.legNumber}/level/${level}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setLevelUsers(prev => ({ ...prev, [level]: data.data.users || [] }));
        setLevelStats(prev => ({ 
          ...prev, 
          [level]: { 
            earnings: data.data.levelEarnings || 0,
            teamCashback: data.data.levelTeamCashback || 0
          } 
        }));
      }
    } catch (error) {
      console.error("Error fetching level users:", error);
    } finally {
      setLoadingLevel(false);
    }
  };

  const handleLevelClick = (level) => {
    if (expandedLevel === level) {
      setExpandedLevel(null);
    } else {
      setExpandedLevel(level);
      fetchLevelUsers(level);
    }
  };

  const totalUsers = leg.stats?.totalUsers || 0;
  const unlockedLevels = Object.values(leg.levels || {}).filter(l => l.isUnlocked).length;
  const totalEarnings = leg.stats?.totalEarnings || 0;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[1100] p-4">
      <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A1F1A] p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black italic flex items-center gap-2">
              Direct {leg.legNumber} Details
              <span className={`text-[10px] px-2 py-1 rounded-full ${
                leg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {leg.isActive ? 'Active' : 'Inactive'}
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Root User: {leg.rootUser?.userId || leg.rootUser?.toString().slice(-6) || 'N/A'}
              <span className="ml-2 text-gray-600">• {user.email || user.userId}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Leg Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/40 p-4 rounded-xl text-center">
              <p className="text-[8px] text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-[#00F5A0]">{totalUsers}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-center">
              <p className="text-[8px] text-gray-500">Unlocked Levels</p>
              <p className="text-2xl font-bold text-green-400">{unlockedLevels}/21</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-center">
              <p className="text-[8px] text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-orange-400">₹{totalEarnings}</p>
            </div>
          </div>

          {/* Level Grid */}
          <div className="bg-black/40 p-4 rounded-xl">
            <h3 className="text-sm font-bold mb-4 text-[#00F5A0]">Level-wise Users (click to expand)</h3>
            <div className="grid grid-cols-7 gap-1">
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(level => {
                const levelData = leg.levels?.[`level${level}`] || {};
                const userCount = levelData.users?.length || 0;
                const isUnlocked = levelData.isUnlocked || false;
                const isPending = levelData.pendingUnlock || false;

                return (
                  <button
                    key={level}
                    onClick={() => handleLevelClick(level)}
                    disabled={userCount === 0}
                    className={`text-center p-2 rounded-lg transition-all ${
                      userCount === 0 ? 'cursor-default opacity-60' : 'cursor-pointer hover:scale-105'
                    } ${expandedLevel === level ? 'ring-2 ring-[#00F5A0]' : ''} ${
                      isUnlocked 
                        ? userCount > 0 
                          ? 'bg-[#00F5A0]/20 border border-[#00F5A0]/30' 
                          : 'bg-blue-500/10 border border-blue-500/20'
                        : isPending
                          ? 'bg-yellow-500/10 border border-yellow-500/20'
                          : 'bg-gray-800/50 border border-gray-700'
                    }`}
                    title={`Level ${level}: ${userCount} users, Earnings: ₹${levelData.earnings || 0}`}
                  >
                    <span className="text-[6px] text-gray-400 block">L{level}</span>
                    <span className={`text-xs font-bold ${
                      userCount > 0 ? 'text-[#00F5A0]' : 
                      isUnlocked ? 'text-blue-400' :
                      isPending ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      {userCount}
                    </span>
                    {isUnlocked && userCount === 0 && (
                      <span className="text-[4px] text-blue-300 block">unlocked</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-3 mt-3 pt-3 border-t border-white/5 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#00F5A0]/20 border border-[#00F5A0]/30"></div>
                <span className="text-[7px] text-gray-400">Has Users</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500/10 border border-blue-500/20"></div>
                <span className="text-[7px] text-gray-400">Unlocked (Empty)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500/10 border border-yellow-500/20"></div>
                <span className="text-[7px] text-gray-400">Pending Unlock</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-800/50 border border-gray-700"></div>
                <span className="text-[7px] text-gray-400">Locked</span>
              </div>
            </div>
          </div>

          {/* Expanded Level Users */}
          {expandedLevel && (
            <div className="bg-black/40 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#00F5A0] flex items-center gap-2">
                  Level {expandedLevel} Users
                  <span className="text-[10px] bg-[#00F5A0]/10 px-2 py-0.5 rounded-full">
                    {levelUsers[expandedLevel]?.length || 0} members
                  </span>
                </h3>
                <button onClick={() => setExpandedLevel(null)} className="text-gray-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>

              {/* Level Stats */}
              {(levelStats[expandedLevel] || leg.levels?.[`level${expandedLevel}`]) && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-black/30 p-2 rounded text-center">
                    <p className="text-[6px] text-gray-500">Level Earnings</p>
                    <p className="text-sm font-bold text-orange-400">
                      ₹{levelStats[expandedLevel]?.earnings ?? leg.levels?.[`level${expandedLevel}`]?.earnings ?? 0}
                    </p>
                  </div>
                  <div className="bg-black/30 p-2 rounded text-center">
                    <p className="text-[6px] text-gray-500">Team Cashback</p>
                    <p className="text-sm font-bold text-green-400">
                      ₹{levelStats[expandedLevel]?.teamCashback ?? leg.levels?.[`level${expandedLevel}`]?.teamCashback ?? 0}
                    </p>
                  </div>
                </div>
              )}

              {loadingLevel ? (
                <div className="text-center py-6">
                  <Loader2 size={24} className="animate-spin text-[#00F5A0] mx-auto mb-2" />
                  <p className="text-[10px] text-gray-500">Loading members...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {levelUsers[expandedLevel]?.length > 0 ? (
                    levelUsers[expandedLevel].map((member, idx) => (
                      <div key={idx} className="bg-black/60 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                              {member.userId?.charAt(0) || member.email?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{member.userId || member.email}</p>
                              <p className="text-[8px] text-gray-500">{member.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-[#00F5A0]">₹{member.totalEarnings || 0}</p>
                            <p className="text-[7px] text-gray-500">earned</p>
                          </div>
                        </div>
                        {/* Member Stats */}
                        <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                          <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                            Direct: {member.directCount || 0}
                          </span>
                          <span className="text-[7px] bg-[#00F5A0]/20 text-[#00F5A0] px-1.5 py-0.5 rounded">
                            Team: {member.teamCount || 0}
                          </span>
                          <span className="text-[7px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                            Ref: {member.referralCode}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 text-xs">No users in this level</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= STATUS BADGE COMPONENT ================= */
const StatusBadge = ({ label, count, color, mini = false }) => {
  const getColorClass = (color) => {
    if (mini) {
      switch(color) {
        case 'ACTIVE': return 'bg-green-500/20 text-green-500';
        case 'ACCEPTED': return 'bg-blue-500/20 text-blue-500';
        case 'PAYMENT_SUBMITTED': return 'bg-yellow-500/20 text-yellow-500';
        case 'COMPLETED': return 'bg-purple-500/20 text-purple-500';
        case 'EXPIRED': return 'bg-gray-500/20 text-gray-500';
        default: return 'bg-white/10 text-white/50';
      }
    }
    
    const colorMap = {
      green: 'bg-green-500/20 text-green-500',
      blue: 'bg-blue-500/20 text-blue-500',
      yellow: 'bg-yellow-500/20 text-yellow-500',
      purple: 'bg-purple-500/20 text-purple-500',
      gray: 'bg-gray-500/20 text-gray-500'
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className={`${getColorClass(color)} ${mini ? 'px-1 py-0.5 text-[6px]' : 'px-2 py-1 text-[8px]'} rounded-full text-center font-bold`}>
      {mini ? label : `${label}: ${count}`}
    </div>
  );
};

/* ================= LEG-WISE TEAM STRUCTURE ================= */
const LegWiseTeamStructure = ({ user, teamLevels, expandedLevel, setExpandedLevel }) => {
  const legs = [
    { name: "Leg 1", levels: [1,2,3], color: "yellow" },
    { name: "Leg 2", levels: [4,5,6], color: "blue" },
    { name: "Leg 3", levels: [7,8,9], color: "green" },
    { name: "Leg 4", levels: [10,11,12], color: "purple" },
    { name: "Leg 5", levels: [13,14,15], color: "pink" },
    { name: "Leg 6", levels: [16,17,18], color: "indigo" },
    { name: "Leg 7", levels: [19,20,21], color: "orange" }
  ];

  const [selectedLeg, setSelectedLeg] = useState(null);
   const API_BASE = 'https://cpay-link-backend.onrender.com';
    // const API_BASE = 'http://localhost:5000';


  const getLegColor = (color) => {
    const colors = {
      yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 text-yellow-400',
      blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
      green: 'from-green-500/20 to-green-600/5 border-green-500/20 text-green-400',
      purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
      pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400',
      indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
      orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-black/40 p-3 md:p-4 rounded-lg">
      <h4 className="text-[10px] md:text-xs font-bold mb-3 text-[#00F5A0] flex items-center gap-2">
        <GitBranch size={14} /> Directs-wise Team Structure
      </h4>

      {/* Leg Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {legs.map((leg, index) => {
          const legLevels = teamLevels.filter(l => leg.levels.includes(l.level));
          const totalMembers = legLevels.reduce((sum, l) => sum + l.count, 0);
          const isUnlocked = user.legsUnlocked?.[`leg${index + 1}`] || false;

          return (
            <button
              key={leg.name}
              onClick={() => setSelectedLeg(selectedLeg === index ? null : index)}
              className={`bg-gradient-to-br ${getLegColor(leg.color)} border p-3 rounded-lg text-left transition-all hover:scale-105 ${selectedLeg === index ? 'ring-2 ring-[#00F5A0]' : ''} ${!isUnlocked ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold">{leg.name}</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-black/30">
                  {isUnlocked ? '✓' : '🔒'}
                </span>
              </div>
              <p className="text-lg font-black">{totalMembers}</p>
              <p className="text-[6px] opacity-70">Levels {leg.levels.join('-')}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Leg Details */}
      {selectedLeg !== null && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <h5 className="text-[10px] font-bold mb-2 text-[#00F5A0]">{legs[selectedLeg].name} - Level-wise Members</h5>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {legs[selectedLeg].levels.map(level => {
              const levelData = teamLevels.find(l => l.level === level);
              if (!levelData) return null;
              
              return (
                <TeamLevelCardWithMembers
                  key={level}
                  level={levelData}
                  expandedLevel={expandedLevel}
                  setExpandedLevel={setExpandedLevel}
                  legName={legs[selectedLeg].name}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= TEAM LEVEL CARD WITH MEMBERS ================= */
const TeamLevelCardWithMembers = ({ level, expandedLevel, setExpandedLevel, legName }) => {
  const [memberDetails, setMemberDetails] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState(null);

  const API_BASE = 'https://cpay-link-backend.onrender.com';
    // const API_BASE = 'http://localhost:5000';

  const fetchMemberDetails = async (memberId) => {
    if (memberDetails[memberId]) {
      setSelectedMember(memberDetails[memberId]);
      setShowMemberModal(true);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/user/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMemberDetails(prev => ({ ...prev, [memberId]: data.user }));
        setSelectedMember(data.user);
        setShowMemberModal(true);
      }
    } catch (error) {
      console.error("Error fetching member:", error);
      toast.error("Failed to load member details");
    }
  };

  return (
    <>
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
          className="w-full flex justify-between items-center p-2 bg-black/30 hover:bg-black/50"
        >
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-1 rounded-full">
              Level {level.level}
            </span>
            <span className="text-[6px] text-gray-400">{level.count} members</span>
          </div>
          {expandedLevel === level.level ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        
        {expandedLevel === level.level && (
          <div className="p-2 bg-black/20 space-y-1">
            {level.members.map(memberId => (
              <MemberCard
                key={memberId}
                memberId={memberId}
                levelNum={level.level}
                legName={legName}
                onMemberClick={fetchMemberDetails}
                isExpanded={expandedMemberId === memberId}
                onToggleExpand={() => setExpandedMemberId(expandedMemberId === memberId ? null : memberId)}
              />
            ))}
          </div>
        )}
      </div>

      {showMemberModal && selectedMember && (
        <MemberHistoryModal
          member={selectedMember}
          onClose={() => { setShowMemberModal(false); setSelectedMember(null); }}
          levelNum={level.level}
          legName={legName}
        />
      )}
    </>
  );
};

/* ================= MEMBER CARD ================= */
const MemberCard = ({ memberId, levelNum, legName, onMemberClick, isExpanded, onToggleExpand }) => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = 'https://cpay-link-backend.onrender.com';
    // const API_BASE = 'http://localhost:5000';


  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/admin/user/${memberId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setMember(data.user);
      } catch (error) {
        console.error("Error fetching member:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [memberId]);

  if (loading) return <div className="bg-black/40 p-2 rounded animate-pulse h-10"></div>;

  const teamCashbackTotal = Object.values(member?.teamCashback || {}).reduce((sum, l) => sum + (l.total || 0), 0);

  return (
    <div className="bg-black/40 border border-white/5 rounded-lg overflow-hidden">
      <div className="p-2 flex items-center justify-between cursor-pointer hover:bg-black/60" onClick={onToggleExpand}>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-[8px]">
            {member?.userId?.charAt(0) || member?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-bold">{member?.userId || member?.email?.split('@')[0] || memberId.slice(-8)}</span>
              <span className="text-[5px] bg-[#00F5A0]/20 text-[#00F5A0] px-1 rounded-full">{legName}</span>
            </div>
            <div className="flex gap-1 mt-0.5">
<span className="text-[5px] bg-blue-500/20 text-blue-400 px-1 rounded">
  D:{member?.legs?.length || member?.directReferralsCount || 0}
</span>
<span className="text-[5px] bg-orange-500/20 text-orange-400 px-1 rounded">
  ₹{member?.totalEarnings || 0}
</span>
              <span className="text-[5px] bg-green-500/20 text-green-400 px-1 rounded">T:₹{teamCashbackTotal}</span>
            </div>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </div>
      
      {isExpanded && (
        <div className="p-2 pt-0 border-t border-white/5">
          <button
            onClick={() => onMemberClick(memberId)}
            className="w-full bg-[#00F5A0]/10 text-[#00F5A0] py-1 rounded text-[6px] font-bold hover:bg-[#00F5A0]/20"
          >
            View Full History
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= LEGS UNLOCKED VIEW ================= */
const LegsUnlockedView = ({ user }) => {
  const legRequirements = [
    { leg: "Leg 1", required: 1, levels: "1-3" },
    { leg: "Leg 2", required: 2, levels: "4-6" },
    { leg: "Leg 3", required: 3, levels: "7-9" },
    { leg: "Leg 4", required: 4, levels: "10-12" },
    { leg: "Leg 5", required: 5, levels: "13-15" },
    { leg: "Leg 6", required: 6, levels: "16-18" },
    { leg: "Leg 7", required: 7, levels: "19-21" }
  ];

  return (
    <div className="bg-black/40 p-3 rounded-lg">
      <h4 className="text-[10px] font-bold mb-2 text-[#00F5A0]">Directs Unlocked</h4>
      <div className="grid grid-cols-7 gap-1">
        {legRequirements.map((item, index) => {
          const legKey = `leg${index + 1}`;
          const unlocked = user.legsUnlocked?.[legKey] || false;
          return (
            <div key={legKey} className={`text-center p-1 rounded ${unlocked ? 'bg-green-500/20' : 'bg-gray-700/50'}`}>
              <span className="text-[6px] font-bold block">{item.leg}</span>
              <span className={`text-[8px] font-bold ${unlocked ? 'text-green-400' : 'text-gray-500'}`}>
                {unlocked ? '✓' : `${item.required}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ================= MEMBER HISTORY MODAL ================= */
const MemberHistoryModal = ({ member, onClose, levelNum, legName }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const teamCashbackTotal = Object.values(member?.teamCashback || {}).reduce((sum, l) => sum + (l.total || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
      <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0A1F1A] p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-sm">
              {member?.userId?.charAt(0) || member?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold">{member?.userId || member?.email?.split('@')[0] || 'User'}</h2>
              <p className="text-[8px] text-gray-500">{legName} • Level {levelNum}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <QuickStatCard label="User ID" value={member?.userId} />
            <QuickStatCard label="Referral Code" value={member?.referralCode} />
          <QuickStatCard label="Direct" value={member?.legs?.length || member?.directReferralsCount || 0} />
<QuickStatCard label="Earnings" value={`₹${member?.totalEarnings || 0}`} />
          </div>

          {/* Wallets */}
          <div className="bg-black/40 p-3 rounded-lg">
            <h4 className="text-[10px] font-bold mb-2 text-[#00F5A0]">Wallets</h4>
            <div className="grid grid-cols-3 gap-2">
              <div><p className="text-[6px] text-gray-500">USDT</p><p className="text-sm font-bold text-blue-400">{member?.wallets?.USDT?.toFixed(2) || 0}</p></div>
              <div><p className="text-[6px] text-gray-500">INR</p><p className="text-sm font-bold text-[#00F5A0]">₹{member?.wallets?.INR?.toFixed(2) || 0}</p></div>
              <div><p className="text-[6px] text-gray-500">CASHBACK</p><p className="text-sm font-bold text-orange-400">₹{member?.wallets?.CASHBACK?.toFixed(2) || 0}</p></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/40 p-2 rounded"><p className="text-[6px] text-gray-500">Team Cashback</p><p className="text-sm font-bold text-green-400">₹{teamCashbackTotal}</p></div>
            <div className="bg-black/40 p-2 rounded"><p className="text-[6px] text-gray-500">Total Team</p><p className="text-sm font-bold text-purple-400">{calculateTeamCount(member)}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= HELPER COMPONENTS ================= */
const UserTableCell = ({ user }) => (
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-xs">
      {user.email?.charAt(0)?.toUpperCase() || user.userId?.charAt(0) || 'U'}
    </div>
    <div>
      <p className="font-bold text-xs">{user.email || user.userId}</p>
      <p className="text-[6px] text-gray-500">{user._id?.slice(-6)} • {user.referralCode}</p>
    </div>
  </div>
);

const ActionButtons = ({ user, expandedUser, setExpandedUser, setSelectedUser }) => (
  <div className="flex items-center justify-end gap-1">
    <button onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }} className="bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-1 rounded-lg text-[8px] font-bold">Details</button>
    <button onClick={(e) => { e.stopPropagation(); setExpandedUser(expandedUser === user._id ? null : user._id); }} className="text-gray-500 p-1">
      {expandedUser === user._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
  </div>
);

const QuickStatCard = ({ label, value, copyable, onCopy }) => (
  <div className="bg-black/40 p-2 rounded-lg">
    <p className="text-[6px] text-gray-500">{label}</p>
    <div className="flex items-center gap-1">
      <p className="text-[8px] font-bold truncate">{value}</p>
      {copyable && <button onClick={onCopy} className="text-[#00F5A0]"><Copy size={8} /></button>}
    </div>
  </div>
);

const WalletBalanceCard = ({ label, value, color }) => {
  const colors = { blue: 'text-blue-400', green: 'text-[#00F5A0]', orange: 'text-orange-400' };
  return (
    <div>
      <p className="text-[6px] text-gray-500">{label}</p>
      <p className={`text-sm font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

const SummaryCard = ({ label, value, color }) => {
  const colors = { blue: 'text-blue-400', purple: 'text-purple-400', orange: 'text-orange-400', green: 'text-green-400' };
  return (
    <div className="bg-gradient-to-br from-${color}-500/10 border border-${color}-500/20 p-2 rounded-lg">
      <p className="text-[6px] text-gray-500">{label}</p>
      <p className={`text-sm font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

const CommissionByLevel = ({ earnings }) => (
  <div className="bg-black/40 p-2 rounded-lg">
    <h4 className="text-[8px] font-bold mb-1 text-orange-400">Commission by Level</h4>
    <div className="space-y-1 max-h-32 overflow-y-auto">
      {Object.entries(earnings).map(([level, amount]) => {
        if (level === 'total' || amount === 0) return null;
        return (
          <div key={level} className="flex justify-between text-[6px] py-0.5 border-b border-white/5">
            <span className="text-gray-400">{level}:</span>
            <span className="font-bold text-orange-400">₹{amount}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const TeamCashbackByLevel = ({ teamCashback }) => (
  <div className="bg-black/40 p-2 rounded-lg">
    <h4 className="text-[8px] font-bold mb-1 text-green-400">Team Cashback</h4>
    <div className="space-y-1 max-h-32 overflow-y-auto">
      {Object.entries(teamCashback).map(([level, data]) => {
        if (data.total === 0) return null;
        return (
          <div key={level} className="flex justify-between text-[6px] py-0.5 border-b border-white/5">
            <span className="text-gray-400">{level}:</span>
            <span className="font-bold text-green-400">₹{data.total} ({data.count})</span>
          </div>
        );
      })}
    </div>
  </div>
);

const ScannerStatCard = ({ title, count, total, scanners, color }) => {
  const [showList, setShowList] = useState(false);
  const colors = { blue: 'text-blue-400', green: 'text-green-400' };
  
  return (
    <div className="bg-black/40 p-2 rounded-lg">
      <div className="flex justify-between items-center mb-1">
        <h4 className={`text-[8px] font-bold ${colors[color]}`}>{title} ({count})</h4>
        {scanners.length > 0 && (
          <button onClick={() => setShowList(!showList)} className="text-gray-500">
            {showList ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        )}
      </div>
      <p className="text-sm font-bold">₹{total.toFixed(2)}</p>
      {showList && scanners.length > 0 && (
        <div className="mt-1 max-h-20 overflow-y-auto border-t border-white/5 pt-1">
          {scanners.map(s => (
            <div key={s._id} className="text-[5px] text-gray-400 py-0.5">₹{s.amount} - {s.status}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// Replace at the bottom of AdminDashboard.jsx:
const calculateTeamCount = (user) => {
  if (!user) return 0;
  // New legs-based structure
  if (user.legs?.length > 0) {
    return user.legs.reduce((total, leg) => total + (leg.stats?.totalUsers || 0), 0);
  }
  // Fallback for old referralTree structure
  let count = 0;
  for (let i = 1; i <= 21; i++) {
    count += user.referralTree?.[`level${i}`]?.length || 0;
  }
  return count;
};

/* ================= DEPOSITS VIEW - FULLY RESPONSIVE ================= */
const DepositsView = ({ deposits, pendingDeposits, handleAction }) => {
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Helper function to get correct image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Remove leading slash if present to avoid double slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Check if path already includes /uploads/
    if (cleanPath.includes('/uploads/')) {
      return `https://cpay-link-backend.onrender.com${cleanPath}`;
    }
    
    // Add /uploads/ prefix
    return `https://cpay-link-backend.onrender.com/uploads${cleanPath}`;
  };
  
  // Rest of your existing code remains the same...
  
  // Filter deposits
  const filteredDeposits = deposits.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  // Sort deposits
  const sortedDeposits = [...filteredDeposits].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0);
    const dateB = new Date(b.createdAt || b.date || 0);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const totalPages = Math.ceil(sortedDeposits.length / itemsPerPage);
  const paginatedDeposits = sortedDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stats
  const approvedCount = deposits.filter(d => d.status === 'approved').length;
  const rejectedCount = deposits.filter(d => d.status === 'rejected').length;

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500">
      
      {/* Mobile Header - Always Visible */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black italic bg-gradient-to-r from-[#00F5A0] to-green-400 bg-clip-text text-transparent">
            Deposit Queue
          </h2>
          <div className="bg-orange-500/10 text-orange-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-orange-500/20">
            {pendingDeposits} Pending
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 flex items-center justify-between bg-[#0A1F1A] border border-white/10 rounded-xl px-4 py-3"
          >
            <span className="text-xs font-bold flex items-center gap-2">
              <Filter size={14} /> Filters & Sort
            </span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <button
            onClick={() => setShowMobileStats(!showMobileStats)}
            className="bg-[#0A1F1A] border border-white/10 rounded-xl px-4 py-3"
          >
            <PieChart size={16} />
          </button>
        </div>

        {/* Filter Controls - Desktop Always, Mobile Toggle */}
        <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-2 sm:gap-3`}>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#0A1F1A] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white/80 focus:border-[#00F5A0] outline-none w-full sm:w-auto appearance-none"
          >
            <option value="all">All Deposits</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-[#0A1F1A] border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white/80 focus:border-[#00F5A0] outline-none w-full sm:w-auto appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Mobile Stats Summary - Collapsible */}
      <div className={`${showMobileStats ? 'grid' : 'hidden'} sm:grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 transition-all duration-300`}>
        <StatCard 
          label="Total" 
          value={deposits.length} 
          color="blue" 
          icon={<CreditCard size={14} />}
        />
        <StatCard 
          label="Pending" 
          value={pendingDeposits} 
          color="orange" 
          highlight={pendingDeposits > 0}
          icon={<Clock size={14} />}
        />
        <StatCard 
          label="Approved" 
          value={approvedCount} 
          color="green" 
          icon={<Check size={14} />}
        />
        <StatCard 
          label="Rejected" 
          value={rejectedCount} 
          color="red" 
          icon={<X size={14} />}
        />
      </div>


      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-[#0A1F1A] border border-white/10 rounded-xl lg:rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 lg:gap-4 p-3 lg:p-4 bg-black/40 border-b border-white/5 text-[8px] lg:text-[10px] font-black uppercase text-gray-500 tracking-wider">
          <div className="col-span-3">User Details</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Transaction ID</div>
          <div className="col-span-2">Date & Time</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {paginatedDeposits.length > 0 ? (
            paginatedDeposits.map(item => (
              <div key={item._id} className="grid grid-cols-12 gap-2 lg:gap-4 p-3 lg:p-4 hover:bg-white/[0.02] transition-all items-center">
                {/* User Details */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                      {item.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs lg:text-sm truncate max-w-[120px] lg:max-w-[150px]">
                        {item.user?.email || item.userId || 'Unknown'}
                      </p>
                      <p className="text-[6px] lg:text-[8px] text-gray-500 font-mono">
                        ID: {item.user?._id?.slice(-6) || item.userId?.slice(-6) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="col-span-2">
                  <p className="text-sm lg:text-base font-black text-[#00F5A0]">{item.amount} USDT</p>
                  <p className="text-[6px] lg:text-[8px] text-gray-600">≈ ₹{(item.amount * 90).toFixed(2)}</p>
                </div>

                {/* Transaction ID */}
                <div className="col-span-2">
                  <p className="text-[8px] lg:text-[10px] font-mono font-bold text-blue-400 truncate" title={item.txHash}>
                    {item.txHash?.slice(0, 8)}...{item.txHash?.slice(-6)}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="col-span-2">
                  <p className="text-[10px] lg:text-xs font-bold text-white">
                    {formatShortDate(item.createdAt || item.date)}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span className={`inline-block px-2 py-1 text-[8px] lg:text-[9px] font-black uppercase rounded-full ${
                    item.status === 'pending' 
                      ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30 animate-pulse' 
                      : item.status === 'approved'
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                        : 'bg-red-500/20 text-red-500 border border-red-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  {item.status === 'pending' ? (
                    <div className="flex gap-1 lg:gap-2 justify-end">
                      <button 
                        onClick={() => handleAction('DEPOSIT', item._id, 'approved')} 
                        className="bg-[#00F5A0] text-black px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg font-black text-[8px] lg:text-[10px] uppercase hover:bg-[#00d88c] transition-all shadow-lg flex items-center gap-1"
                        title="Approve"
                      >
                        <Check size={10} className="lg:w-3 lg:h-3" />
                      </button>
                      <button 
                        onClick={() => handleAction('DEPOSIT', item._id, 'rejected')} 
                        className="bg-red-500 text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg font-black text-[8px] lg:text-[10px] uppercase hover:bg-red-600 transition-all shadow-lg flex items-center gap-1"
                        title="Reject"
                      >
                        <X size={10} className="lg:w-3 lg:h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-gray-500 text-[8px] lg:text-[10px] italic">
                      {formatShortDate(item.updatedAt)}
                    </div>
                  )}
                </div>

                {/* Screenshot - FIXED URL HANDLING */}
                {item.paymentScreenshot && (
                  <div className="col-span-12 mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        const imageUrl = getImageUrl(item.paymentScreenshot);
                        console.log('Opening image URL:', imageUrl); // Debug log
                        window.open(imageUrl, '_blank');
                      }}
                      className="text-[#00F5A0] text-[8px] lg:text-[10px] font-bold flex items-center gap-1 hover:underline"
                    >
                      <Eye size={10} /> View Screenshot
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 lg:p-12 text-center text-gray-500">
              <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-xs lg:text-sm font-bold">No deposits found</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card View (Visible on Mobile) */}
      <div className="md:hidden space-y-3">
        {paginatedDeposits.length > 0 ? (
          paginatedDeposits.map(item => (
            <MobileDepositCard 
              key={item._id} 
              item={item} 
              handleAction={handleAction}
              formatDate={formatShortDate}
              getImageUrl={getImageUrl} // Pass the helper function
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-[#0A1F1A] rounded-xl">
            <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs font-bold">No deposits found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedDeposits.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
          <p className="text-[10px] sm:text-xs text-gray-500 order-2 sm:order-1">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedDeposits.length)} of {sortedDeposits.length}
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 1 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
              }`}
            >
              Previous
            </button>
            <span className="px-3 sm:px-4 py-2 bg-[#0A1F1A] border border-white/10 rounded-lg text-xs font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === totalPages 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= MOBILE DEPOSIT CARD COMPONENT ================= */
const MobileDepositCard = ({ item, handleAction, formatDate, getImageUrl }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-xl overflow-hidden">
      {/* Card Header - Always Visible */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-xs">
              {item.user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-xs truncate max-w-[120px]">
                {item.user?.email || item.userId || 'Unknown'}
              </p>
              <p className="text-[6px] text-gray-500">
                {formatDate(item.createdAt)}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-full ${
            item.status === 'pending' 
              ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30 animate-pulse' 
              : item.status === 'approved'
                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                : 'bg-red-500/20 text-red-500 border border-red-500/30'
          }`}>
            {item.status}
          </span>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">Amount</p>
            <p className="text-sm font-black text-[#00F5A0]">{item.amount} USDT</p>
            <p className="text-[6px] text-gray-600">≈ ₹{(item.amount * 90).toFixed(2)}</p>
          </div>
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">TXID</p>
            <p className="text-[8px] font-mono text-blue-400 truncate">
              {item.txHash?.slice(0, 8)}...{item.txHash?.slice(-4)}
            </p>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-[8px] text-gray-500 py-1"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          <span>{expanded ? 'Show Less' : 'Show More'}</span>
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          {/* User ID */}
          <div className="bg-black/30 p-2 rounded mb-2">
            <p className="text-[6px] text-gray-500">User ID</p>
            <p className="text-[8px] font-mono">{item.user?._id || item.userId || 'N/A'}</p>
          </div>

          {/* Full Transaction ID */}
          {item.txHash && (
            <div className="bg-black/30 p-2 rounded mb-2">
              <p className="text-[6px] text-gray-500">Full Transaction ID</p>
              <p className="text-[8px] font-mono break-all">{item.txHash}</p>
            </div>
          )}

          {/* Screenshot - FIXED: Use getImageUrl helper */}
          {item.paymentScreenshot && (
            <button
              onClick={() => {
                const imageUrl = getImageUrl(item.paymentScreenshot);
                console.log('Opening screenshot:', imageUrl);
                window.open(imageUrl, '_blank');
              }}
              className="w-full bg-black/30 p-2 rounded mb-3 text-[#00F5A0] text-[8px] font-bold flex items-center justify-center gap-1 hover:bg-black/40 transition-all"
            >
              <Eye size={10} /> View Payment Screenshot
            </button>
          )}

          {/* Actions */}
          {item.status === 'pending' && (
            <div className="flex gap-2">
              <button 
                onClick={() => handleAction('DEPOSIT', item._id, 'approved')} 
                className="flex-1 bg-[#00F5A0] text-black py-3 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-1"
              >
                <Check size={12} /> Approve
              </button>
              <button 
                onClick={() => handleAction('DEPOSIT', item._id, 'rejected')} 
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-1"
              >
                <X size={12} /> Reject
              </button>
            </div>
          )}

          {item.status !== 'pending' && (
            <div className="text-center text-[8px] text-gray-500 py-2">
              Processed on {formatDate(item.updatedAt)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ================= STAT CARD COMPONENT ================= */
const StatCard = ({ label, value, color, highlight, icon }) => {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-400',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20 text-green-400',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20 text-red-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border p-3 sm:p-4 rounded-lg sm:rounded-xl ${
      highlight ? 'animate-pulse' : ''
    }`}>
      <p className="text-[8px] sm:text-[10px] font-black uppercase flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white">{value}</p>
    </div>
  );
};

/* ================= SCANNERS VIEW - COMPLETE WITH ALL STATUSES ================= */
const ScannersView = ({ scanners }) => {
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [expandedScanner, setExpandedScanner] = useState(null);
  
  // Filter scanners
  const filteredScanners = scanners.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  // Sort scanners
  const sortedScanners = [...filteredScanners].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const totalPages = Math.ceil(sortedScanners.length / itemsPerPage);
  const paginatedScanners = sortedScanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const activeCount = scanners.filter(s => s.status === 'ACTIVE').length;
  const acceptedCount = scanners.filter(s => s.status === 'ACCEPTED').length;
  const paymentSubmittedCount = scanners.filter(s => s.status === 'PAYMENT_SUBMITTED').length;
  const completedCount = scanners.filter(s => s.status === 'COMPLETED').length;
  const expiredCount = scanners.filter(s => s.status === 'EXPIRED').length;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'ACCEPTED': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'PAYMENT_SUBMITTED': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'COMPLETED': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'EXPIRED': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-white/10 text-white/50';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      
      {/* Header with Stats */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-xl p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black italic flex items-center gap-2">
              <ScanLine size={20} className="text-[#00F5A0]" />
              Scanner Queue
              <span className="bg-[#00F5A0]/10 text-[#00F5A0] text-[10px] px-2 py-1 rounded-full">
                {scanners.length} Total
              </span>
            </h2>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-white/5 p-2 rounded-lg"
            >
              <Filter size={16} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <StatBadge label="Active" count={activeCount} color="green" />
            <StatBadge label="Accepted" count={acceptedCount} color="blue" />
            <StatBadge label="Payment Sub." count={paymentSubmittedCount} color="yellow" />
            <StatBadge label="Completed" count={completedCount} color="purple" />
            <StatBadge label="Expired" count={expiredCount} color="gray" />
          </div>

          {/* Filter Controls */}
          <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/5`}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#00F5A0]"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PAYMENT_SUBMITTED">Payment Submitted</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#00F5A0]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#00F5A0]"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-white/5 rounded-lg p-1 ml-auto">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'cards' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'table' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      {viewMode === 'table' && (
        <div className="hidden md:block bg-[#0A1F1A] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-[8px] lg:text-[10px] uppercase text-gray-600 font-black border-b border-white/5 bg-black/20">
              <tr>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Created By</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Accepted By</th>
                <th className="px-3 py-3">Created At</th>
                <th className="px-3 py-3">Completed At</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedScanners.map(s => (
                <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-3 font-mono text-[10px]">
                    {s._id.slice(-8)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-[8px]">
                        {s.user?.email?.charAt(0)?.toUpperCase() || s.user?.userId?.charAt(0) || 'S'}
                      </div>
                      <span className="text-xs font-bold truncate max-w-[100px]">
                        {s.user?.email || s.user?.userId || 'System'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-bold text-[#00F5A0]">
                    ₹{s.amount}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-block px-2 py-1 text-[8px] font-black uppercase rounded-full ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {s.acceptedBy ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[6px]">
                          {s.acceptedBy.name?.charAt(0) || s.acceptedBy.userId?.charAt(0) || 'A'}
                        </div>
                        <span className="text-[10px] truncate max-w-[80px]">
                          {s.acceptedBy.name || s.acceptedBy.userId || 'Unknown'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[10px] text-gray-400">
                    {formatShortDate(s.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-[10px] text-gray-400">
                    {s.completedAt ? formatShortDate(s.completedAt) : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setExpandedScanner(expandedScanner === s._id ? null : s._id)}
                      className="text-[#00F5A0] hover:text-[#00d88c]"
                    >
                      {expandedScanner === s._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards View (Default) */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${viewMode === 'cards' ? 'grid' : 'hidden md:hidden'}`}>
        {paginatedScanners.map(s => (
          <ScannerCard 
            key={s._id}
            scanner={s}
            expanded={expandedScanner === s._id}
            onToggle={() => setExpandedScanner(expandedScanner === s._id ? null : s._id)}
            formatDate={formatDate}
            formatShortDate={formatShortDate}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>

      {/* Empty State */}
      {paginatedScanners.length === 0 && (
        <div className="bg-[#0A1F1A] border border-white/10 rounded-xl p-12 text-center">
          <ScanLine size={48} className="mx-auto mb-3 opacity-30 text-gray-500" />
          <p className="text-gray-500 font-bold">No scanners found</p>
          <p className="text-[10px] text-gray-600 mt-1">Try changing your filters</p>
        </div>
      )}

      {/* Pagination */}
      {sortedScanners.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A1F1A] border border-white/10 rounded-xl p-4">
          <p className="text-[10px] text-gray-500 order-2 sm:order-1">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedScanners.length)} of {sortedScanners.length}
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === 1 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
              }`}
            >
              Previous
            </button>
            <span className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                currentPage === totalPages 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= SCANNER CARD COMPONENT - FIXED ================= */
const ScannerCard = ({ scanner: s, expanded, onToggle, formatDate, formatShortDate, getStatusColor }) => {
  // Determine the correct creator based on isAutoRequest flag
  const isSystemRequest = s.isAutoRequest === true;
  
  // For system requests, use createdFor if available, otherwise fallback to user
  const creator = isSystemRequest && s.createdFor ? s.createdFor : s.user;
  const creatorName = creator?.userId || creator?.email || (isSystemRequest ? 'System' : 'Unknown');
  const creatorId = creator?._id || (isSystemRequest ? 'System' : 'Unknown');
  
  // Acceptor details remain the same
  const acceptor = s.acceptedBy;
  const acceptorName = acceptor?.userId || acceptor?.name || acceptor?.email;
  const acceptorId = acceptor?._id;

  return (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-xs">
              {creatorName?.charAt(0)?.toUpperCase() || (isSystemRequest ? 'S' : 'U')}
            </div>
            <div>
              <p className="text-xs font-bold truncate max-w-[120px]">
                {creatorName}
              </p>
              <p className="text-[6px] text-gray-500 font-mono">
                ID: {creatorId !== 'System' ? creatorId?.slice(-8) : 'SYSTEM'}
              </p>
              {isSystemRequest && (
                <span className="text-[6px] bg-purple-500/20 text-purple-400 px-1 rounded-full mt-0.5 inline-block">
                  Auto Request
                </span>
              )}
            </div>
          </div>
          <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-full ${getStatusColor(s.status)}`}>
            {s.status}
          </span>
        </div>

        {/* Amount */}
        <div className="text-center mb-3">
          <p className="text-2xl font-black text-[#00F5A0]">₹{s.amount}</p>
          <p className="text-[8px] text-gray-500">Created: {formatShortDate(s.createdAt)}</p>
        </div>

        {/* QR Code Preview */}
        <div className="flex justify-center mb-3">
          <div className="bg-white p-2 rounded-lg">
            <img 
              src={`https://cpay-link-backend.onrender.com${s.image}`} 
              className="w-16 h-16 object-contain" 
              alt="QR" 
            />
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2 text-[8px]">
          <div className="bg-black/30 p-2 rounded">
            <p className="text-gray-500">Accepted By</p>
            <p className="font-bold truncate">
              {acceptorName || '—'}
            </p>
          </div>
          <div className="bg-black/30 p-2 rounded">
            <p className="text-gray-500">Accepted At</p>
            <p className="font-bold">
              {s.acceptedAt ? formatShortDate(s.acceptedAt) : '—'}
            </p>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={onToggle}
          className="w-full mt-3 flex items-center justify-center gap-1 text-[8px] text-gray-500 py-1 border-t border-white/5"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          <span>{expanded ? 'Show Less' : 'Show Details'}</span>
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3">
          {/* Full Timeline */}
          <div className="bg-black/30 p-3 rounded space-y-2">
            <p className="text-[8px] font-bold text-[#00F5A0] uppercase tracking-wider">Timeline</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[8px]">
                <span className="text-gray-500">Created:</span>
                <span className="font-mono">{formatDate(s.createdAt)}</span>
              </div>
              {s.acceptedAt && (
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">Accepted:</span>
                  <span className="font-mono">{formatDate(s.acceptedAt)}</span>
                </div>
              )}
              {s.paymentSubmittedAt && (
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">Payment Submitted:</span>
                  <span className="font-mono">{formatDate(s.paymentSubmittedAt)}</span>
                </div>
              )}
              {s.completedAt && (
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">Completed:</span>
                  <span className="font-mono">{formatDate(s.completedAt)}</span>
                </div>
              )}
              {s.expiresAt && (
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">Expires:</span>
                  <span className="font-mono">{formatDate(s.expiresAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Creator Details */}
          <div className="bg-black/30 p-3 rounded">
            <p className="text-[8px] font-bold text-[#00F5A0] uppercase tracking-wider mb-2">
              {isSystemRequest ? 'Created For' : 'Creator Details'}
            </p>
            <div className="space-y-1 text-[8px]">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <span className="font-mono">{creatorId !== 'System' ? creatorId : 'System'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">User ID / Email:</span>
                <span>{creatorName}</span>
              </div>
              {isSystemRequest && s.user && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Accepted By (Scanner):</span>
                  <span>{s.user?.userId || s.user?.email || '—'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Acceptor Details */}
          {acceptor && (
            <div className="bg-black/30 p-3 rounded">
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-wider mb-2">Acceptor Details</p>
              <div className="space-y-1 text-[8px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID:</span>
                  <span className="font-mono">{acceptorId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name/Email:</span>
                  <span>{acceptorName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Screenshots */}
          {s.paymentScreenshots && s.paymentScreenshots.length > 0 && (
            <div className="bg-black/30 p-3 rounded">
              <p className="text-[8px] font-bold text-yellow-400 uppercase tracking-wider mb-2">Payment Screenshots ({s.paymentScreenshots.length})</p>
              <div className="grid grid-cols-3 gap-1">
                {s.paymentScreenshots.filter(ss => ss.isActive).map((ss, idx) => (
                  <button
                    key={idx}
                    onClick={() => window.open(`https://cpay-link-backend.onrender.com${ss.url}`)}
                    className="relative aspect-square rounded overflow-hidden border border-white/10 hover:border-[#00F5A0] transition-all"
                  >
                    <img 
                      src={`https://cpay-link-backend.onrender.com${ss.url}`}
                      alt={`screenshot-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[4px] text-center py-0.5">
                      {new Date(ss.uploadedAt).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Screenshot History */}
          {s.screenshotHistory && s.screenshotHistory.length > 0 && (
            <div className="bg-black/30 p-3 rounded">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-2">Screenshot History ({s.screenshotHistory.length})</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {s.screenshotHistory.map((history, idx) => (
                  <div key={idx} className="text-[6px] border-b border-white/5 pb-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Changed:</span>
                      <span>{formatDate(history.changedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">By:</span>
                      <span>{history.changedBy?.userId || history.changedBy}</span>
                    </div>
                    {history.reason && (
                      <div className="text-gray-400 mt-1">Reason: {history.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto Request Info */}
          {isSystemRequest && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-2 rounded">
              <p className="text-[8px] text-purple-400 flex items-center gap-1">
                <Zap size={8} /> Auto Request (Cycle {s.autoRequestCycle || 1})
              </p>
              {s.groupRequestId && (
                <p className="text-[6px] text-gray-500 mt-1">
                  Group ID: {s.groupRequestId}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ================= STAT BADGE COMPONENT ================= */
const StatBadge = ({ label, count, color }) => {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    gray: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-2 text-center`}>
      <p className="text-[8px] font-black uppercase">{label}</p>
      <p className="text-sm font-bold">{count}</p>
    </div>
  );
};

/* ================= LEDGER VIEW - FULLY RESPONSIVE ================= */
const LedgerView = ({ transactions, loadData }) => {
  const [showFull, setShowFull] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards' (for mobile)
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date for different screen sizes
  const formatDate = (dateString, format = 'full') => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    if (format === 'mobile') {
      return date.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
      });
    }
    
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle window resize for responsive view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setViewMode('table');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom">
      
      {/* Header */}
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 border-b border-white/5">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg md:text-xl font-bold italic flex items-center gap-2">
            <ListOrdered size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 text-[#00F5A0]" />
            <span className="hidden xs:inline">Global System Ledger</span>
            <span className="xs:hidden">Ledger</span>
            <span className="bg-[#00F5A0]/10 text-[#00F5A0] text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full">
              {transactions.length}
            </span>
          </h3>
          
          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'table' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'cards' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'
                }`}
              >
                Cards
              </button>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={loadData} 
              className="p-1.5 sm:p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all active:rotate-180"
              aria-label="Refresh"
            >
              <RefreshCcw size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Items Per Page Selector (Mobile) */}
        <div className="flex md:hidden items-center justify-between mt-3">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/80 outline-none"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
          
          <span className="text-[8px] text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className={`hidden md:block overflow-x-auto`}>
        <table className="w-full text-left">
          <thead className="text-[8px] lg:text-[10px] uppercase text-gray-600 font-black border-b border-white/5">
            <tr>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5">User</th>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5">Type</th>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5">Amount</th>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5">Route</th>
              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map(tx => (
                <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4">
                    <p className="text-xs lg:text-sm font-bold truncate max-w-[120px] lg:max-w-[150px] xl:max-w-[200px]">
                      {tx.user?.email || tx.user?.userId || 'System'}
                    </p>
                    {tx.user?._id && (
                      <p className="text-[6px] lg:text-[8px] text-gray-600 font-mono mt-0.5">
                        ID: {tx.user._id.slice(-6)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4">
                    <span className={`inline-block text-[8px] lg:text-[9px] font-black px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full ${
                      tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
                      tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' : 
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 font-mono font-bold text-sm lg:text-base text-[#00F5A0]">
                    {tx.type === 'DEBIT' ? '−' : '+'}₹{tx.amount?.toFixed(2)}
                  </td>
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase italic">
                    <span className="hidden xl:inline">{tx.fromWallet || 'System'} → {tx.toWallet || 'System'}</span>
                    <span className="xl:hidden">{tx.fromWallet?.slice(0,3) || 'Sys'} → {tx.toWallet?.slice(0,3) || 'Sys'}</span>
                  </td>
                  <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 text-right text-[8px] lg:text-[10px] text-gray-600 font-bold">
                    <span className="hidden lg:inline">{formatDate(tx.createdAt)}</span>
                    <span className="lg:hidden">{formatDate(tx.createdAt, 'mobile')}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-gray-500">
                  <ListOrdered size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No transactions found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={`md:hidden space-y-2 p-3 ${viewMode === 'cards' ? 'block' : 'hidden'}`}>
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.map(tx => (
            <MobileLedgerCard key={tx._id} transaction={tx} formatDate={formatDate} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-black/40 rounded-xl">
            <ListOrdered size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs font-bold">No transactions found</p>
          </div>
        )}
      </div>

      {/* Mobile Table View (Alternative) */}
      <div className={`md:hidden overflow-x-auto ${viewMode === 'table' ? 'block' : 'hidden'}`}>
        <table className="w-full text-left min-w-[400px]">
          <thead className="text-[8px] uppercase text-gray-600 font-black border-b border-white/5 bg-black/20">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTransactions.map(tx => (
              <tr key={tx._id} className="hover:bg-white/[0.02]">
                <td className="px-3 py-2">
                  <p className="text-[10px] font-bold truncate max-w-[80px]">
                    {tx.user?.email?.split('@')[0] || tx.user?.userId?.slice(-8) || 'System'}
                  </p>
                </td>
                <td className="px-3 py-2">
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${
                    tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
                    tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' : 
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {tx.type?.slice(0,3)}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono font-bold text-[10px] text-[#00F5A0]">
                  {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount}
                </td>
                <td className="px-3 py-2 text-right text-[7px] text-gray-500">
                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {sortedTransactions.length > itemsPerPage && (
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Items Per Page (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/80 outline-none"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
              <span className="text-[10px] text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length}
              </span>
            </div>

            {/* Page Info (Mobile) */}
            <div className="md:hidden text-[8px] text-gray-500">
              Page {currentPage} of {totalPages}
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                  currentPage === 1 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
                }`}
              >
                <ChevronLeft size={12} />
                <span className="hidden xs:inline">Prev</span>
              </button>
              
              {/* Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                    }
                    if (pageNum > totalPages) return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#00F5A0] text-black'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                  currentPage === totalPages 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#00F5A0] text-black hover:bg-[#00d88c]'
                }`}
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Toggle (if no pagination) */}
      {!showFull && transactions.length > 10 && (
        <div className="p-4 text-center border-t border-white/5">
          <button
            onClick={() => setShowFull(true)}
            className="text-[10px] sm:text-xs text-[#00F5A0] font-bold hover:underline"
          >
            View All Transactions ({transactions.length})
          </button>
        </div>
      )}
    </div>
  );
};

// AdminDashboard.jsx - Update the SystemRequestsView component

const SystemRequestsView = ({ requests, onRefresh, onCreateRequest, creatingRequest }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [targetUserType, setTargetUserType] = useState('single');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [creating2000, setCreating2000] = useState(false);
  const [creating1000, setCreating1000] = useState(false);
  const itemsPerPage = 10;

  const API_BASE = 'https://cpay-link-backend.onrender.com/api';
  // const API_BASE = 'http://localhost:5000/api'; // For local development

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setUserList(data);
        } else if (data.success && Array.isArray(data.users)) {
          setUserList(data.users);
        } else {
          setUserList([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUserList([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users for dropdown
  const filteredUsers = userList.filter(user => 
    user.userId?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user._id?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleSelectUser = (user) => {
    setSelectedUserId(user.userId);
    setShowUserDropdown(false);
    setUserSearchTerm('');
  };

  // ✅ Handle Create for ₹2000
  const handleCreate2000 = async () => {
    if (targetUserType === 'single' && !selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    
    const userId = targetUserType === 'all' ? 'all' : selectedUserId;
    
    setCreating2000(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/create-system-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, amount: 5000 })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`₹5000 request created for ${userId === 'all' ? 'all users' : selectedUserId}`);
        onRefresh();
        if (targetUserType === 'single') setSelectedUserId('');
      } else {
        toast.error(data.message || "Failed to create request");
      }
    } catch (error) {
      toast.error("Failed to create request");
    } finally {
      setCreating2000(false);
    }
  };

  // ✅ Handle Create for ₹1000
  const handleCreate1000 = async () => {
    if (targetUserType === 'single' && !selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    
    const userId = targetUserType === 'all' ? 'all' : selectedUserId;
    
    setCreating1000(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/create-system-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, amount: 10000 })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`₹10000 request created for ${userId === 'all' ? 'all users' : selectedUserId}`);
        onRefresh();
        if (targetUserType === 'single') setSelectedUserId('');
      } else {
        toast.error(data.message || "Failed to create request");
      }
    } catch (error) {
      toast.error("Failed to create request");
    } finally {
      setCreating1000(false);
    }
  };

  // Check for undefined requests
  if (!requests) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#00F5A0]" size={32} />
        <span className="ml-2 text-gray-400">Loading system requests...</span>
      </div>
    );
  }

// Filter requests
const filteredRequests = (Array.isArray(requests) ? requests : []).filter(req => {
  if (filter !== 'all' && req.status !== filter) return false;
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const hasMatchingUser = req.requests?.some(r => 
      r.createdFor?.userId?.toLowerCase().includes(searchLower)
    );
    return hasMatchingUser;
  }
  return true;
});

// Sort requests - Payment Submitted first, then Accepted, then Active
const sortedRequests = [...filteredRequests].sort((a, b) => {
  const getPriority = (group) => {
    const hasPaymentSubmitted = group.requests?.some(r => r.status === 'PAYMENT_SUBMITTED');
    const hasAccepted = group.requests?.some(r => r.status === 'ACCEPTED');
    const hasActive = group.requests?.some(r => r.status === 'ACTIVE');
    
    if (hasPaymentSubmitted) return 1; // Highest priority
    if (hasAccepted) return 2; // Second priority
    if (hasActive) return 3; // Third priority
    return 4; // Completed/Expired lowest priority
  };
  
  const priorityA = getPriority(a);
  const priorityB = getPriority(b);
  
  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }
  
  // If same priority, sort by createdAt (newest first)
  return new Date(b.createdAt) - new Date(a.createdAt);
});

// Pagination - use sortedRequests instead
const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
const paginatedRequests = sortedRequests.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


  const handleConfirm = async (scannerId) => {
    setConfirming(scannerId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/confirm-system-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scannerId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Request confirmed! ₹${data.amount} credited to user`);
        onRefresh();
      } else {
        toast.error(data.message || "Failed to confirm");
      }
    } catch (error) {
      console.error("Confirm error:", error);
      toast.error("Something went wrong");
    } finally {
      setConfirming(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'ACTIVE': { color: 'bg-green-500/20 text-green-500 border-green-500/30', label: 'ACTIVE' },
      'ACCEPTED': { color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', label: 'ACCEPTED' },
      'PAYMENT_SUBMITTED': { color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30 animate-pulse', label: 'PROOF SUBMITTED' },
      'COMPLETED': { color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', label: 'COMPLETED' },
      'EXPIRED': { color: 'bg-gray-500/20 text-gray-500 border-gray-500/30', label: 'EXPIRED' }
    };
    return config[status] || { color: 'bg-gray-500/20 text-gray-500', label: status };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      
      {/* Header with Create Form */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-xl p-4">
        <h2 className="text-lg font-black italic flex items-center gap-2 mb-4">
          <Gift size={20} className="text-[#00F5A0]" />
          System Requests
          <span className="bg-[#00F5A0]/10 text-[#00F5A0] text-[10px] px-2 py-1 rounded-full">
            {filteredRequests.length} Groups
          </span>
        </h2>

        {/* ✅ TWO BUTTONS - User Type Selector */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              setTargetUserType('single');
              setSelectedUserId('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              targetUserType === 'single' 
                ? 'bg-[#00F5A0] text-black' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Single User
          </button>
          <button
            onClick={() => {
              setTargetUserType('all');
              setSelectedUserId('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              targetUserType === 'all' 
                ? 'bg-[#00F5A0] text-black' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Users
          </button>
        </div>
        
        {/* User Selector & Both Buttons */}
        <div className="flex flex-col gap-3">
          
          {/* User Selector */}
          {targetUserType === 'single' && (
            <div className="relative">
              <div 
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer flex items-center justify-between hover:border-[#00F5A0] transition-all"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <span className={selectedUserId ? "text-white" : "text-gray-500"}>
                  {selectedUserId ? selectedUserId : "Select a user..."}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </div>
              
              {showUserDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0A1F1A] border border-white/10 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden">
                  <div className="p-2 border-b border-white/10">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search by User ID or Email..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-[#00F5A0]"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {loadingUsers ? (
                      <div className="p-4 text-center">
                        <Loader2 size={20} className="animate-spin text-[#00F5A0] mx-auto" />
                        <p className="text-xs text-gray-500 mt-2">Loading users...</p>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No users found
                      </div>
                    ) : (
                      filteredUsers.map(user => (
                        <div
                          key={user._id}
                          className="p-3 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 last:border-0"
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-white">{user.userId}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                              ID: {user._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {targetUserType === 'all' && (
            <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-400">
              ⚡ This request will be sent to ALL active users
            </div>
          )}
          
          {/* ✅ TWO BUTTONS - Both amounts simultaneously */}
          <div className="flex gap-3">
            <button
              onClick={handleCreate2000}
              disabled={creating2000 || (targetUserType === 'single' && !selectedUserId)}
              className="flex-1 bg-gradient-to-r from-[#00F5A0] to-green-500 text-black px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating2000 ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <PlusCircle size={16} />
              )}
              Create ₹5000 Request
            </button>
            
            <button
              onClick={handleCreate1000}
              disabled={creating1000 || (targetUserType === 'single' && !selectedUserId)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating1000 ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <PlusCircle size={16} />
              )}
              Create ₹10000 Request
            </button>
          </div>
        </div>
        
        <p className="text-[10px] text-gray-500 text-center mt-3">
          ⚡ You can create BOTH requests for the same user. They will appear separately.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#0A1F1A] border border-white/10 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            {['all', 'ACTIVE', 'ACCEPTED', 'PAYMENT_SUBMITTED', 'COMPLETED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  filter === status 
                    ? 'bg-[#00F5A0] text-black' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 sm:max-w-xs ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-[#00F5A0]"
            />
          </div>
        </div>
      </div>

      {/* Requests List - Rest remains same */}
      <div className="space-y-3">
        {paginatedRequests.length === 0 ? (
          <div className="bg-[#0A1F1A] border border-white/10 rounded-xl p-12 text-center">
            <Gift size={48} className="mx-auto mb-3 opacity-30 text-gray-500" />
            <p className="text-gray-500 font-bold">No system requests found</p>
            <p className="text-[10px] text-gray-600 mt-1">Create one above to get started</p>
          </div>
        ) : (
          paginatedRequests.map(group => {
            // ... existing group rendering code (same as before)
            // (I'm keeping this part same as your existing code)
            const activeCount = group.requests?.filter(r => r.status === 'ACTIVE').length || 0;
            const acceptedRequest = group.requests?.find(r => r.status === 'ACCEPTED' || r.status === 'PAYMENT_SUBMITTED');
            const completedRequest = group.requests?.find(r => r.status === 'COMPLETED');
            const isCompleted = group.completed || completedRequest;
            
            let status = 'ACTIVE';
            if (isCompleted) {
              status = 'COMPLETED';
            } else if (acceptedRequest) {
              status = acceptedRequest.status;
            } else if (activeCount > 0) {
              status = 'ACTIVE';
            } else {
              status = 'EXPIRED';
            }
            
            const statusBadge = getStatusBadge(status);
            const isPaymentSubmitted = status === 'PAYMENT_SUBMITTED';
            
            return (
              <div key={group.groupId || group._id} className="bg-[#0A1F1A] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                <div className="p-4">
                  {/* Header - Show amount badge with color */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        group.amount === 5000 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        ₹{group.amount === 5000 ? '5K' : '10K'}
                      </div>
                      <div>
                        <p className="text-xs font-bold flex items-center gap-2">
                          {activeCount > 0 
                            ? `${activeCount} users waiting` 
                            : acceptedRequest 
                              ? `Payment Submitted by: ${acceptedRequest.acceptedBy?.userId || 'User'}` 
                              : 'All expired'}
                          <span className="text-[8px] text-gray-500">
                            Created: {formatDate(group.createdAt)}
                          </span>
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase rounded-full border ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                          <span className="text-[8px] text-gray-500">
                            Total users: {group.totalUsers}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${group.amount === 5000 ? 'text-[#00F5A0]' : 'text-blue-400'}`}>
                        ₹{group.amount}
                      </p>
                    </div>
                  </div>

                  {/* Rest of the group rendering - same as your existing code */}
                  {/* Users List */}
                  {group.requests && group.requests.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[8px] text-gray-500 mb-1 flex items-center gap-1">
                        <Users size={10} /> Users in this group:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {group.requests.map(req => (
                          <div key={req._id} className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg">
                            <span className={`w-2 h-2 rounded-full ${
                              req.status === 'COMPLETED' ? 'bg-purple-500' :
                              req.status === 'PAYMENT_SUBMITTED' ? 'bg-yellow-500 animate-pulse' :
                              req.status === 'ACCEPTED' ? 'bg-blue-500' :
                              req.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                            <span className="text-[8px] font-mono">{req.createdFor?.userId || 'Unknown'}</span>
                            {req.acceptedBy && (
                              <span className="text-[6px] text-blue-400 ml-1">(accepted)</span>
                            )}
                            {req.status === 'PAYMENT_SUBMITTED' && (
                              <span className="text-[6px] text-yellow-400 ml-1 animate-pulse">proof uploaded</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Screenshots Preview */}
                  {acceptedRequest?.paymentScreenshots && acceptedRequest.paymentScreenshots.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[8px] text-gray-500 mb-1 flex items-center gap-1">
                        <Camera size={10} /> Payment Proof 
                        <span className="text-yellow-400 text-[8px]">(click to view)</span>
                      </p>
                      <div className="flex gap-2">
                        {acceptedRequest.paymentScreenshots.filter(ss => ss.isActive).slice(0, 3).map((ss, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedRequest(acceptedRequest);
                              setShowScreenshotModal(true);
                            }}
                            className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 hover:border-[#00F5A0] transition-all group relative"
                          >
                            <img 
                              src={`https://cpay-link-backend.onrender.com${ss.url}`}
                              alt="proof"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye size={16} className="text-[#00F5A0]" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isPaymentSubmitted && acceptedRequest && (
                    <button
                      onClick={() => handleConfirm(acceptedRequest._id)}
                      disabled={confirming === acceptedRequest._id}
                      className="w-full mt-3 bg-gradient-to-r from-[#00F5A0] to-green-500 text-black py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {confirming === acceptedRequest._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          CONFIRM & CREDIT (₹{acceptedRequest.amount})
                        </>
                      )}
                    </button>
                  )}

                  {acceptedRequest && acceptedRequest.status === 'ACCEPTED' && !acceptedRequest.paymentScreenshots?.length && (
                    <div className="mt-3 text-center text-xs text-blue-500 bg-blue-500/10 p-2 rounded-lg">
                      📸 Waiting for user to upload payment proof
                    </div>
                  )}

                  {activeCount > 0 && !acceptedRequest && (
                    <div className="mt-3 text-center text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded-lg">
                      ⏳ {activeCount} user(s) can accept this request (first come first serve)
                    </div>
                  )}

                  {group.completed && (
                    <div className="mt-3 text-center text-xs text-green-500 bg-green-500/10 p-2 rounded-lg">
                      ✅ Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 bg-[#0A1F1A] border border-white/10 rounded-xl p-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 disabled:opacity-50 hover:bg-white/10"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 disabled:opacity-50 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      )}

      {/* Screenshot Modal */}
      {showScreenshotModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[500] p-4 backdrop-blur-sm">
          <div className="bg-[#0A1F1A] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0A1F1A]">
              <h3 className="font-bold flex items-center gap-2">
                <Camera size={16} className="text-[#00F5A0]" />
                Payment Proof - ₹{selectedRequest.amount}
                <span className="text-[10px] text-gray-500">
                  Uploaded by: {selectedRequest.acceptedBy?.userId}
                </span>
              </h3>
              <button onClick={() => setShowScreenshotModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {selectedRequest.paymentScreenshots?.filter(ss => ss.isActive).map((ss, idx) => (
                <div key={idx} className="mb-4">
                  <img
                    src={`https://cpay-link-backend.onrender.com${ss.url}`}
                    alt={`Payment Proof ${idx + 1}`}
                    className="max-w-full max-h-[60vh] mx-auto rounded-lg border border-white/10"
                  />
                  <p className="text-[10px] text-gray-500 text-center mt-2">
                    Uploaded: {formatDate(ss.uploadedAt)}
                  </p>
                </div>
              ))}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setShowScreenshotModal(false)}
                  className="flex-1 bg-white/10 py-2 rounded-lg font-bold text-sm"
                >
                  Close
                </button>
                {selectedRequest.status === 'PAYMENT_SUBMITTED' && (
                  <button
                    onClick={() => {
                      handleConfirm(selectedRequest._id);
                      setShowScreenshotModal(false);
                    }}
                    className="flex-1 bg-[#00F5A0] text-black py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Confirm & Credit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= MOBILE LEDGER CARD COMPONENT ================= */
const MobileLedgerCard = ({ transaction: tx, formatDate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
      {/* Card Header */}
      <div 
        className="p-3 flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
            tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
            tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' :
            'bg-blue-500/10 text-blue-400'
          }`}>
            {tx.type ? tx.type[0] : 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate max-w-[120px]">
              {tx.user?.email?.split('@')[0] || tx.user?.userId || 'System'}
            </p>
            <p className="text-[8px] text-gray-500">
              {formatDate(tx.createdAt, 'mobile')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-[#00F5A0]">
            {tx.type === 'DEBIT' ? '−' : '+'}₹{tx.amount}
          </p>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2">
          {/* Full User Info */}
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">User</p>
            <p className="text-[8px] font-bold">{tx.user?.email || tx.user?.userId || 'System'}</p>
            {tx.user?._id && (
              <p className="text-[6px] text-gray-500 font-mono">ID: {tx.user._id}</p>
            )}
          </div>

          {/* Transaction Type */}
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">Type</p>
            <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full mt-1 ${
              tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
              tx.type === 'DEBIT' ? 'bg-red-500/10 text-red-500' : 
              'bg-blue-500/10 text-blue-400'
            }`}>
              {tx.type}
            </span>
          </div>

          {/* Route */}
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">Route</p>
            <p className="text-[8px] font-bold uppercase">
              {tx.fromWallet || 'System'} → {tx.toWallet || 'System'}
            </p>
          </div>

          {/* Full Timestamp */}
          <div className="bg-black/30 p-2 rounded">
            <p className="text-[6px] text-gray-500">Date & Time</p>
            <p className="text-[8px]">{formatDate(tx.createdAt)}</p>
          </div>

          {/* Transaction ID if available */}
          {tx.transactionId && (
            <div className="bg-black/30 p-2 rounded">
              <p className="text-[6px] text-gray-500">Transaction ID</p>
              <p className="text-[6px] font-mono break-all">{tx.transactionId}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const UserDetailsModal = ({ user, onClose }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedLeg, setExpandedLeg] = useState(null);
  const [levelUsers, setLevelUsers] = useState({});
  const [loadingLevel, setLoadingLevel] = useState(null);

  const API_BASE = 'https://cpay-link-backend.onrender.com';
  // const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getUserDetails(user._id);
      if (data?.success) setUserDetails(data.user);
      setLoading(false);
    };
    fetchDetails();
  }, [user._id]);

  // Fetch users for a specific leg+level of THIS user
  const fetchLegLevelUsers = async (legNumber, level) => {
    const cacheKey = `${legNumber}-${level}`;
    if (levelUsers[cacheKey]) return;
    
    setLoadingLevel(cacheKey);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/admin/user/${user._id}/leg/${legNumber}/level/${level}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setLevelUsers(prev => ({ 
          ...prev, 
          [cacheKey]: {
            users: data.data.users || [],
            earnings: data.data.levelEarnings || 0,
            teamCashback: data.data.levelTeamCashback || 0
          }
        }));
      }
    } catch (err) {
      console.error("Error fetching level users:", err);
    } finally {
      setLoadingLevel(null);
    }
  };

  const handleLevelClick = (legNumber, level) => {
    const key = `${legNumber}-${level}`;
    if (expandedLevel === key) {
      setExpandedLevel(null);
    } else {
      setExpandedLevel(key);
      fetchLegLevelUsers(legNumber, level);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[1000]">
      <Loader2 className="animate-spin text-[#00F5A0]" size={40} />
    </div>
  );

  const createdScanners = userDetails?.scanners?.created || [];
  const acceptedScanners = userDetails?.scanners?.accepted || [];
  const totalPayRequests = userDetails?.totalPayRequests || 0;
  const totalAcceptedRequests = userDetails?.totalAcceptedRequests || 0;
  const pendingPayRequests = totalPayRequests - totalAcceptedRequests;

  // Build legs from userDetails (fetched fresh with legs populated)
  const legs = userDetails?.legs || [];

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
      <div className="bg-[#0A1F1A] border border-white/10 rounded-[2rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#0A1F1A] p-6 border-b border-white/10 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-lg">
              {userDetails?.userId?.charAt(0) || userDetails?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-black italic">{userDetails?.userId || userDetails?.email}</h2>
              <p className="text-[10px] text-gray-500">Joined: {new Date(userDetails?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/5 overflow-x-auto">
          <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <TabButton label="Earnings" active={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')} />
          <TabButton 
            label="Team" 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')}
            badge={userDetails?.team?.total || 0}
          />
        </div>

        <div className="p-6 space-y-6">

          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard label="User ID" value={userDetails?.userId} />
                <InfoCard label="Referral Code" value={userDetails?.referralCode} />
                <InfoCard label="Joined" value={new Date(userDetails?.createdAt).toLocaleDateString()} />
                <InfoCard label="Referred By" value={userDetails?.referredBy?.userId || 'None'} />
              </div>

              <div className="bg-black/40 p-4 rounded-xl">
                <h3 className="text-sm font-bold mb-3 text-[#00F5A0]">Wallet Balances</h3>
                <div className="grid grid-cols-3 gap-4">
                  <WalletInfo label="USDT" value={userDetails?.wallets?.USDT?.toFixed(2) || 0} color="blue" />
                  <WalletInfo label="INR" value={`₹${userDetails?.wallets?.INR?.toFixed(2) || 0}`} color="green" />
                  <WalletInfo label="CASHBACK" value={`₹${userDetails?.wallets?.CASHBACK?.toFixed(2) || 0}`} color="orange" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 rounded-xl">
                <h3 className="text-sm font-bold mb-3 text-blue-400 flex items-center gap-2">
                  <CreditCard size={16} /> Pay Request Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Created</p>
                    <p className="text-2xl font-bold text-[#00F5A0]">{totalPayRequests}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Accepted</p>
                    <p className="text-2xl font-bold text-green-400">{totalAcceptedRequests}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-orange-400">{pendingPayRequests}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Direct Referrals" value={userDetails?.legs?.length || 0} color="blue" />
                <StatCard label="Total Team" value={userDetails?.team?.total || 0} color="purple" />
                <StatCard label="Total Earnings" value={`₹${userDetails?.earnings?.total || 0}`} color="orange" />
                <StatCard label="Team Cashback" value={`₹${Object.values(userDetails?.teamCashback || {}).reduce((s, l) => s + (l.total || 0), 0)}`} color="green" />
              </div>

              {userDetails?.transactions?.length > 0 && (
                <div className="bg-black/40 p-4 rounded-xl">
                  <h3 className="text-sm font-bold mb-3 text-gray-400">Recent Activity</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {userDetails.transactions.slice(0, 5).map(tx => (
                      <div key={tx._id} className="flex justify-between items-center text-[10px] bg-black/30 p-2 rounded">
                        <span className="text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>{tx.type}</span>
                        <span className="font-bold text-[#00F5A0]">₹{tx.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========== EARNINGS TAB ========== */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="bg-black/40 p-4 rounded-xl">
                <h3 className="text-sm font-bold mb-3 text-orange-400">Commission by Level</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                  {Object.entries(userDetails?.earnings || {}).map(([level, amount]) => {
                    if (level === 'total' || amount === 0) return null;
                    return (
                      <div key={level} className="bg-black/30 p-3 rounded-lg text-center">
                        <p className="text-[8px] text-gray-500">{level}</p>
                        <p className="text-sm font-bold text-orange-400">₹{amount}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Total Commission:</span>
                  <span className="text-lg font-bold text-orange-400">₹{userDetails?.earnings?.total || 0}</span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl">
                <h3 className="text-sm font-bold mb-3 text-green-400">Team Cashback by Level</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(userDetails?.teamCashback || {}).map(([level, data]) => {
                    if (data.total === 0) return null;
                    return (
                      <div key={level} className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                        <span className="text-xs text-gray-400">{level}:</span>
                        <div>
                          <span className="text-sm font-bold text-green-400">₹{data.total}</span>
                          <span className="text-[8px] text-gray-500 ml-2">({data.count} members)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========== TEAM TAB — LEGS → LEVELS → USERS ========== */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 p-3 rounded-xl text-center">
                  <p className="text-[8px] text-gray-500">Total Directs</p>
                  <p className="text-2xl font-bold text-blue-400">{legs.length}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl text-center">
                  <p className="text-[8px] text-gray-500">Total Team</p>
                  <p className="text-2xl font-bold text-[#00F5A0]">{userDetails?.team?.total || 0}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl text-center">
                  <p className="text-[8px] text-gray-500">Active Directs</p>
                  <p className="text-2xl font-bold text-green-400">{legs.filter(l => l.isActive).length}</p>
                </div>
              </div>

              {legs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No direct referrals yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {legs.map(leg => {
                    const legTotalUsers = leg.stats?.totalUsers || 0;
                    const legTotalEarnings = leg.stats?.totalEarnings || 0;
                    const legTotalCashback = leg.stats?.totalTeamCashback || 0;
                    const unlockedLevels = Object.values(leg.levels || {}).filter(l => l.isUnlocked).length;
                    const isLegExpanded = expandedLeg === leg.legNumber;

                    return (
                      <div key={leg.legNumber} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                        
                        {/* Leg Header */}
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/60 transition-all"
                          onClick={() => setExpandedLeg(isLegExpanded ? null : leg.legNumber)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              leg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {leg.legNumber}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold">Direct {leg.legNumber}</p>
                                <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${
                                  leg.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {leg.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-[9px] text-gray-500 mt-0.5">
                                Root: {leg.rootUser?.userId || 'N/A'} • {legTotalUsers} users • {unlockedLevels}/21 levels
                              </p>
                            </div>
                          
                           <div className="flex items-center gap-2">
    {/* ✅ ADD THIS EXPORT BUTTON */}
    <button
      onClick={() => exportSingleUserToPDF(userDetails)}
      className="p-2 hover:bg-white/10 rounded-lg"
      title="Export to PDF"
    >
      <Download size={20} className="text-[#00F5A0]" />
    </button>
    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
      <X size={20} />
    </button>
  </div>
  </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-[8px] text-gray-500">Earnings</p>
                              <p className="text-sm font-bold text-orange-400">₹{legTotalEarnings}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-[8px] text-gray-500">Cashback</p>
                              <p className="text-sm font-bold text-green-400">₹{legTotalCashback}</p>
                            </div>
                            {isLegExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>

                        {/* Leg Expanded: Level Grid */}
                        {isLegExpanded && (
                          <div className="border-t border-white/5 p-4 space-y-4">
                            
                            {/* Mobile earnings (hidden on sm+) */}
                            <div className="flex gap-3 sm:hidden">
                              <div className="flex-1 bg-black/30 p-2 rounded text-center">
                                <p className="text-[7px] text-gray-500">Earnings</p>
                                <p className="text-sm font-bold text-orange-400">₹{legTotalEarnings}</p>
                              </div>
                              <div className="flex-1 bg-black/30 p-2 rounded text-center">
                                <p className="text-[7px] text-gray-500">Cashback</p>
                                <p className="text-sm font-bold text-green-400">₹{legTotalCashback}</p>
                              </div>
                            </div>

                            {/* Level Grid */}
                            <div>
                              <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-wider">Levels</p>
                              <div className="grid grid-cols-7 gap-1">
                                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(levelNum => {
                                  const levelData = leg.levels?.[`level${levelNum}`] || {};
                                  const userCount = levelData.users?.length || 0;
                                  const isUnlocked = levelData.isUnlocked || false;
                                  const cacheKey = `${leg.legNumber}-${levelNum}`;
                                  const isExpanded = expandedLevel === cacheKey;
                                  const isLoading = loadingLevel === cacheKey;

                                  return (
                                    <button
                                      key={levelNum}
                                      onClick={() => handleLevelClick(leg.legNumber, levelNum)}
                                      disabled={userCount === 0}
                                      className={`text-center p-1.5 rounded-lg transition-all ${
                                        userCount === 0 ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                                      } ${isExpanded ? 'ring-2 ring-[#00F5A0]' : ''} ${
                                        userCount > 0
                                          ? 'bg-[#00F5A0]/20 border border-[#00F5A0]/30'
                                          : isUnlocked
                                            ? 'bg-blue-500/10 border border-blue-500/20'
                                            : 'bg-gray-800/50 border border-gray-700/50'
                                      }`}
                                      title={`L${levelNum}: ${userCount} users`}
                                    >
                                      <span className="text-[5px] text-gray-400 block">L{levelNum}</span>
                                      {isLoading ? (
                                        <Loader2 size={8} className="animate-spin text-[#00F5A0] mx-auto" />
                                      ) : (
                                        <span className={`text-[9px] font-bold ${
                                          userCount > 0 ? 'text-[#00F5A0]' :
                                          isUnlocked ? 'text-blue-400' : 'text-gray-600'
                                        }`}>
                                          {userCount}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Legend */}
                              <div className="flex gap-3 mt-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <div className="w-2.5 h-2.5 rounded bg-[#00F5A0]/20 border border-[#00F5A0]/30"></div>
                                  <span className="text-[7px] text-gray-500">Has Users</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2.5 h-2.5 rounded bg-blue-500/10 border border-blue-500/20"></div>
                                  <span className="text-[7px] text-gray-500">Unlocked</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2.5 h-2.5 rounded bg-gray-800/50 border border-gray-700/50"></div>
                                  <span className="text-[7px] text-gray-500">Locked</span>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Level Users — shown inside the same leg card */}
                            {expandedLevel?.startsWith(`${leg.legNumber}-`) && (
                              <div className="bg-black/30 rounded-xl p-3">
                                {(() => {
                                  const levelNum = parseInt(expandedLevel.split('-')[1]);
                                  const cached = levelUsers[expandedLevel];
                                  const levelData = leg.levels?.[`level${levelNum}`] || {};

                                  return (
                                    <>
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-[#00F5A0] flex items-center gap-2">
                                          Level {levelNum} Members
                                          <span className="text-[9px] bg-[#00F5A0]/10 px-2 py-0.5 rounded-full">
                                            {cached?.users?.length || levelData.users?.length || 0} users
                                          </span>
                                        </h4>
                                        <button onClick={() => setExpandedLevel(null)} className="text-gray-500 hover:text-white">
                                          <X size={14} />
                                        </button>
                                      </div>

                                      {/* Level Stats */}
                                      <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-black/40 p-2 rounded text-center">
                                          <p className="text-[7px] text-gray-500">Level Earnings</p>
                                          <p className="text-sm font-bold text-orange-400">
                                            ₹{cached?.earnings ?? levelData.earnings ?? 0}
                                          </p>
                                        </div>
                                        <div className="bg-black/40 p-2 rounded text-center">
                                          <p className="text-[7px] text-gray-500">Team Cashback</p>
                                          <p className="text-sm font-bold text-green-400">
                                            ₹{cached?.teamCashback ?? levelData.teamCashback ?? 0}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Users List */}
                                      {loadingLevel === expandedLevel ? (
                                        <div className="text-center py-6">
                                          <Loader2 size={20} className="animate-spin text-[#00F5A0] mx-auto mb-2" />
                                          <p className="text-[10px] text-gray-500">Loading members...</p>
                                        </div>
                                      ) : cached?.users?.length > 0 ? (
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                          {cached.users.map((member, idx) => (
                                            <div key={idx} className="bg-black/50 p-3 rounded-lg">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                                    {member.userId?.charAt(0) || member.email?.charAt(0) || '?'}
                                                  </div>
                                                  <div>
                                                    <p className="text-xs font-bold">{member.userId}</p>
                                                    <p className="text-[8px] text-gray-500">{member.email}</p>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-xs font-bold text-[#00F5A0]">₹{member.totalEarnings || 0}</p>
                                                  <p className="text-[7px] text-gray-500">earned</p>
                                                </div>
                                              </div>
                                              <div className="flex gap-2 mt-2 pt-1.5 border-t border-white/5">
                                                <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                                  D:{member.directCount || 0}
                                                </span>
                                                <span className="text-[7px] bg-[#00F5A0]/20 text-[#00F5A0] px-1.5 py-0.5 rounded">
                                                  T:{member.teamCount || 0}
                                                </span>
                                                <span className="text-[7px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                                                  {member.referralCode}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-center text-gray-500 py-4 text-xs">No users in this level</p>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
/* ================= HELPER COMPONENTS FOR MODAL ================= */

// Tab Button Component
const TabButton = ({ label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
      active 
        ? 'bg-[#00F5A0] text-black' 
        : 'bg-white/5 text-gray-400 hover:bg-white/10'
    }`}
  >
    {label}
    {badge > 0 && (
      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
        active ? 'bg-black text-white' : 'bg-gray-600 text-white'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

// Info Card Component
const InfoCard = ({ label, value, copyable }) => (
  <div className="bg-black/40 p-4 rounded-xl">
    <p className="text-[8px] text-gray-500">{label}</p>
    <p className="text-sm font-bold truncate">{value}</p>
  </div>
);

// Wallet Info Component
const WalletInfo = ({ label, value, color }) => {
  const colors = {
    blue: 'text-blue-400',
    green: 'text-[#00F5A0]',
    orange: 'text-orange-400'
  };
  return (
    <div>
      <p className="text-[8px] text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};





// Team Level Card Component
const TeamLevelCard = ({ level, expandedLevel, setExpandedLevel }) => (
  <div className="border border-white/10 rounded-lg overflow-hidden">
    <button
      onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
      className="w-full flex justify-between items-center p-3 bg-black/30 hover:bg-black/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold">Level {level.level}</span>
        <span className="text-[10px] text-[#00F5A0]">{level.count} members</span>
      </div>
      {expandedLevel === level.level ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    
    {expandedLevel === level.level && (
      <div className="p-3 bg-black/20 grid grid-cols-2 gap-2">
        {level.members.map(member => (
          <div key={member.userId} className="text-[8px] bg-black/40 p-2 rounded">
            <p className="font-bold">{member.userId}</p>
            <p className="text-gray-500">Earned: ₹{member.earnings}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ================= SIDEBAR LINK COMPONENT ================= */
const SidebarLink = ({ icon, label, active, badge, onClick, highlight }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-sm relative ${
    active 
      ? 'bg-[#00F5A0] text-[#051510] shadow-[0_10px_25px_rgba(0,245,160,0.3)]' 
      : highlight && badge > 0
        ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 animate-pulse'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
  }`}>
    <div className="flex items-center gap-3">{icon} {label}</div>
    {badge > 0 && (
      <span className={`${
        active 
          ? 'bg-black text-white' 
          : highlight 
            ? 'bg-orange-500 text-white'
            : 'bg-[#00F5A0] text-black'
      } text-[10px] px-2 py-0.5 rounded-full font-black italic shadow-sm`}>
        {badge}
      </span>
    )}
    {highlight && badge > 0 && !active && (
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
    )}
  </button>
);

/* ================= UPDATED STATBOX COMPONENT FOR BETTER RESPONSIVENESS ================= */
const StatBox = ({ label, val, highlight, icon }) => (
  <div className={`bg-[#0A1F1A] border ${
    highlight ? 'border-orange-500/50 bg-orange-500/5 animate-pulse' : 'border-white/10'
  } p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl group hover:border-[#00F5A0]/50 transition-all shadow-lg relative`}>
    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase text-gray-500 tracking-widest italic mb-1 sm:mb-2 flex items-center gap-1">
      <span className="text-[#00F5A0]">{icon}</span>
      <span className="hidden xs:inline">{label}</span>
      <span className="xs:hidden">{label.split(' ')[0]}</span>
      {highlight && <span className="ml-1 text-orange-500 animate-pulse">●</span>}
    </p>
    <h3 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black ${
      highlight ? 'text-orange-500' : 'text-white'
    } italic tracking-tighter`}>{val}</h3>
  </div>
);