import React, { useEffect, useState, useRef } from "react";
import { 
  LayoutDashboard, Users, CreditCard, RefreshCcw, 
  Settings, LogOut, Check, X, ShieldAlert, Menu, Loader2, ArrowRightLeft,
  Zap, Clock, Search, ScanLine, Eye, ListOrdered, TrendingUp, Award,
  ChevronDown, ChevronUp, User, Copy, DollarSign, PieChart, BarChart3,
  Users2, GitBranch, Network, Wallet, Coins, History, Download,
  Filter, ChevronLeft, ChevronRight, AlertCircle, Info,CheckCircle
} from "lucide-react";
import { 
  getAllUsers, getAllDeposits, updateDepositStatus, 
  getAllWithdraws, updateWithdrawStatus, updateExchangeRate,
  getAllScanners, getAllTransactions, getSystemStats, getUserDetails 
} from "../services/adminService";
import toast from 'react-hot-toast';

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

        {/* USERS TAB - COMPLETE DETAILS */}
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

// ================= USERS VIEW - COMPLETE WITH ALL DATA =================
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

  // Fetch member details
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

  // Calculate team count (Level 1-21)
  const calculateTeamCount = (user) => {
    let count = 0;
    if (user?.referralTree) {
      for (let i = 1; i <= 21; i++) {
        count += user.referralTree[`level${i}`]?.length || 0;
      }
    }
    return count;
  };

  // Calculate total team cashback
  const calculateTotalTeamCashback = (user) => {
    return Object.values(user?.teamCashback || {}).reduce((sum, level) => sum + (level.total || 0), 0);
  };

  // Get level-wise member counts
  const getLevelWiseCounts = (user) => {
    const counts = {};
    for (let i = 1; i <= 21; i++) {
      const count = user?.referralTree?.[`level${i}`]?.length || 0;
      if (count > 0) {
        counts[`level${i}`] = count;
      }
    }
    return counts;
  };

  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth >= 768 ? 'table' : 'cards');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            <div className="flex md:hidden bg-white/5 rounded-lg p-1">
              <button onClick={() => setViewMode('table')} className={`px-2 py-1 rounded text-[8px] font-bold ${viewMode === 'table' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'}`}>Table</button>
              <button onClick={() => setViewMode('cards')} className={`px-2 py-1 rounded text-[8px] font-bold ${viewMode === 'cards' ? 'bg-[#00F5A0] text-black' : 'text-gray-400'}`}>Cards</button>
            </div>
            <div className="relative flex-1 sm:flex-initial sm:w-48 md:w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                className="bg-black/40 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-[10px] sm:text-xs w-full outline-none focus:border-[#00F5A0]" 
              />
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden">
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

      {/* Desktop Table View */}
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
                <th className="px-2 lg:px-3 py-2 lg:py-3">Legs</th>
                <th className="px-2 lg:px-3 py-2 lg:py-3">Requests</th>
                <th className="px-2 lg:px-3 py-2 lg:py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsers.map(u => {
                const teamCount = calculateTeamCount(u);
                const directCount = u.referralTree?.level1?.length || 0;
                const totalEarnings = u.referralEarnings?.total || 0;
                const teamCashbackTotal = calculateTotalTeamCashback(u);
                const levelCounts = getLevelWiseCounts(u);
                const levelSummary = Object.entries(levelCounts).slice(0, 3).map(([lvl, cnt]) => `${lvl}:${cnt}`).join(', ');
                const remainingLevels = Object.keys(levelCounts).length - 3;
                
                // Pay request stats
                const totalPayRequests = u.totalPayRequests || 0;
                const totalAccepted = u.totalAcceptedRequests || 0;
                
                // Legs unlocked
                const legsUnlocked = u.legsUnlocked ? Object.values(u.legsUnlocked).filter(v => v === true).length : 0;
                
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
                      <td className="px-2 lg:px-3 py-2 lg:py-3">
                        <span className="text-xs lg:text-sm font-bold text-blue-400">{directCount}</span>
                      </td>
                      <td className="px-2 lg:px-3 py-2 lg:py-3">
                        <span className="text-xs lg:text-sm font-bold text-[#00F5A0]">{teamCount}</span>
                      </td>
                      <td className="px-2 lg:px-3 py-2 lg:py-3">
                        <div className="text-[8px]">
                          {levelSummary}
                          {remainingLevels > 0 && (
                            <span className="text-gray-500 ml-1">+{remainingLevels}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 lg:px-3 py-2 lg:py-3">
                        <p className="text-xs lg:text-sm font-bold text-orange-400">₹{totalEarnings.toFixed(2)}</p>
                      </td>
                      <td className="px-2 lg:px-3 py-2 lg:py-3">
                        <p className="text-xs lg:text-sm font-bold text-green-400">₹{teamCashbackTotal.toFixed(2)}</p>
                      </td>
                      <td className="px-2 lg:px-3 py-2 lg:py-3">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${legsUnlocked >= 4 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {legsUnlocked}/7
                        </span>
                      </td>
                      <td className="px-2 lg:px-3 py-2 lg:py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                            C:{totalPayRequests}
                          </span>
                          <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                            A:{totalAccepted}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 lg:px-3 py-2 lg:py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }} className="bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-1 rounded-lg text-[8px] font-bold">Details</button>
                          <button onClick={(e) => { e.stopPropagation(); setExpandedUser(expandedUser === u._id ? null : u._id); }} className="text-gray-500 p-1">
                            {expandedUser === u._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedUser === u._id && (
                      <tr className="bg-black/40">
                        <td colSpan="9" className="px-3 lg:px-4 py-3 lg:py-4">
                          <UserExpandedDetails 
                            user={u} 
                            copyToClipboard={copyToClipboard} 
                            expandedLevel={expandedLevel} 
                            setExpandedLevel={setExpandedLevel}
                            fetchMemberDetails={fetchMemberDetails}
                            memberDetails={memberDetails}
                            loadingMember={loadingMember}
                          />
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

      {/* Mobile Card View */}
      {(viewMode === 'cards' || window.innerWidth < 768) && (
        <div className="md:hidden space-y-2 p-3">
          {paginatedUsers.map(u => (
            <MobileUserCard 
              key={u._id} 
              user={u} 
              expandedUser={expandedUser} 
              setExpandedUser={setExpandedUser} 
              setSelectedUser={setSelectedUser} 
              copyToClipboard={copyToClipboard} 
              expandedLevel={expandedLevel} 
              setExpandedLevel={setExpandedLevel}
              fetchMemberDetails={fetchMemberDetails}
              memberDetails={memberDetails}
              loadingMember={loadingMember}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredUsers.length > itemsPerPage && (
        <div className="flex items-center justify-between p-3 border-t border-white-5">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${currentPage === 1 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#00F5A0] text-black'}`}>Previous</button>
          <span className="text-[10px] text-gray-500">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${currentPage === totalPages ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#00F5A0] text-black'}`}>Next</button>
        </div>
      )}
    </div>
  );
};

/* ================= MOBILE USER CARD ================= */
const MobileUserCard = ({ user, expandedUser, setExpandedUser, setSelectedUser, copyToClipboard, expandedLevel, setExpandedLevel }) => {
  const isExpanded = expandedUser === user._id;
  const teamCount = calculateTeamCount(user);
  const directCount = user.referralTree?.level1?.length || 0;
  const totalEarnings = user.referralEarnings?.total || 0;

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
          <button onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }} className="bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-1 rounded-lg text-[8px] font-bold">View</button>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
      <div className="px-3 pb-2 flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(user.referralCode); }} className="bg-white/5 text-gray-400 px-2 py-1 rounded-lg text-[8px] font-bold flex items-center gap-1"><Copy size={8} /> Copy Ref</button>
      </div>
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          <UserExpandedDetails user={user} copyToClipboard={copyToClipboard} expandedLevel={expandedLevel} setExpandedLevel={setExpandedLevel} mobileView={true} />
        </div>
      )}
    </div>
  );
};

// ================= USER EXPANDED DETAILS - COMPLETE WITH ALL DATA =================
const UserExpandedDetails = ({ user, copyToClipboard, expandedLevel, setExpandedLevel, fetchMemberDetails, memberDetails, loadingMember }) => {
  const [showCreatedList, setShowCreatedList] = useState(false);
  const [showAcceptedList, setShowAcceptedList] = useState(false);
  const [showLevelMembers, setShowLevelMembers] = useState({});
  
  // Calculate team stats
  const teamLevels = [];
  for (let i = 1; i <= 21; i++) {
    const levelMembers = user.referralTree?.[`level${i}`] || [];
    if (levelMembers.length > 0) {
      teamLevels.push({ level: i, count: levelMembers.length, members: levelMembers });
    }
  }

  // Scanner stats
  const createdScanners = user.scanners?.created || [];
  const acceptedScanners = user.scanners?.accepted || [];
  const referralEarnings = user.referralEarnings || {};
  const teamCashback = user.teamCashback || {};

  // Pay Request Statistics
  const totalPayRequests = user.totalPayRequests || 0;
  const totalAcceptedRequests = user.totalAcceptedRequests || 0;
  const pendingPayRequests = totalPayRequests - totalAcceptedRequests;

  // Legs unlocked
  const legsUnlocked = user.legsUnlocked || {};
  const legRequirements = [
    { leg: "Leg 1", required: 1, levels: "1-3" },
    { leg: "Leg 2", required: 2, levels: "4-6" },
    { leg: "Leg 3", required: 3, levels: "7-9" },
    { leg: "Leg 4", required: 4, levels: "10-12" },
    { leg: "Leg 5", required: 5, levels: "13-15" },
    { leg: "Leg 6", required: 6, levels: "16-18" },
    { leg: "Leg 7", required: 7, levels: "19-21" }
  ];

  // Toggle level members
  const toggleLevelMembers = (level) => {
    setShowLevelMembers(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
    
    // Fetch member details if not already fetched
    if (!showLevelMembers[level]) {
      const members = teamLevels.find(l => l.level === level)?.members || [];
      members.forEach(memberId => {
        fetchMemberDetails(memberId);
      });
    }
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
            <p className="text-sm font-bold text-blue-400">{user.wallets?.USDT?.toFixed(2) || 0}</p>
          </div>
          <div>
            <p className="text-[6px] text-gray-500">INR</p>
            <p className="text-sm font-bold text-[#00F5A0]">₹{user.wallets?.INR?.toFixed(2) || 0}</p>
          </div>
          <div>
            <p className="text-[6px] text-gray-500">CASHBACK</p>
            <p className="text-sm font-bold text-orange-400">₹{user.wallets?.CASHBACK?.toFixed(2) || 0}</p>
          </div>
        </div>
      </div>

      {/* Referral Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SummaryCard label="Direct" value={user.referralTree?.level1?.length || 0} color="blue" />
        <SummaryCard label="Total Team" value={teamLevels.reduce((sum, l) => sum + l.count, 0)} color="purple" />
        <SummaryCard label="Earnings" value={`₹${referralEarnings.total?.toFixed(2) || 0}`} color="orange" />
        <SummaryCard label="Team Cashback" value={`₹${Object.values(teamCashback).reduce((sum, l) => sum + (l.total || 0), 0).toFixed(2)}`} color="green" />
      </div>

      {/* Legs Unlocked */}
      <div className="bg-black/40 p-3 rounded-lg">
        <h4 className="text-[10px] font-bold mb-2 text-[#00F5A0]">Legs Unlocked ({Object.values(legsUnlocked).filter(v => v).length}/7)</h4>
        <div className="grid grid-cols-7 gap-1">
          {legRequirements.map((item, index) => {
            const legKey = `leg${index + 1}`;
            const unlocked = legsUnlocked[legKey] || false;
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

      {/* Pay Request Statistics */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-3 rounded-lg">
        <h4 className="text-[10px] font-bold mb-2 text-blue-400 flex items-center gap-2">
          <CreditCard size={12} /> Pay Request Statistics
        </h4>
        
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-black/40 p-2 rounded text-center">
            <p className="text-[6px] text-gray-500">Created</p>
            <p className="text-sm font-bold text-[#00F5A0]">{totalPayRequests}</p>
          </div>
          <div className="bg-black/40 p-2 rounded text-center">
            <p className="text-[6px] text-gray-500">Accepted</p>
            <p className="text-sm font-bold text-green-400">{totalAcceptedRequests}</p>
          </div>
          <div className="bg-black/40 p-2 rounded text-center">
            <p className="text-[6px] text-gray-500">Pending</p>
            <p className="text-sm font-bold text-orange-400">{pendingPayRequests}</p>
          </div>
        </div>
      </div>

      {/* Created Scanners */}
      {createdScanners.length > 0 && (
        <div className="bg-black/40 p-3 rounded-lg">
          <h4 className="text-[10px] font-bold mb-2 text-blue-400 flex items-center gap-2">
            <ScanLine size={12} /> Created Scanners ({createdScanners.length})
          </h4>
          
          <button
            onClick={() => setShowCreatedList(!showCreatedList)}
            className="w-full flex items-center justify-between text-[8px] text-gray-400 mt-1"
          >
            <span>View Recent Scanners</span>
            {showCreatedList ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>

          {showCreatedList && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {createdScanners.slice(0, 5).map(s => (
                <div key={s._id} className="bg-black/60 p-2 rounded text-[8px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">₹{s.amount}</span>
                    <StatusBadge label={s.status} count={1} color={s.status} mini />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accepted Scanners */}
      {acceptedScanners.length > 0 && (
        <div className="bg-black/40 p-3 rounded-lg">
          <h4 className="text-[10px] font-bold mb-2 text-green-400 flex items-center gap-2">
            <CheckCircle size={12} /> Accepted Scanners ({acceptedScanners.length})
          </h4>
          
          <button
            onClick={() => setShowAcceptedList(!showAcceptedList)}
            className="w-full flex items-center justify-between text-[8px] text-gray-400 mt-1"
          >
            <span>View Recent Accepted</span>
            {showAcceptedList ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>

          {showAcceptedList && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {acceptedScanners.slice(0, 5).map(s => (
                <div key={s._id} className="bg-black/60 p-2 rounded text-[8px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">₹{s.amount}</span>
                    <StatusBadge label={s.status} count={1} color={s.status} mini />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Level-wise Team Structure */}
      {teamLevels.length > 0 && (
        <div className="bg-black/40 p-3 rounded-lg">
          <h4 className="text-[10px] font-bold mb-2 text-[#00F5A0] flex items-center gap-2">
            <Users size={12} /> Level-wise Team Structure
          </h4>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {teamLevels.map(level => (
              <div key={level.level} className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleLevelMembers(level.level)}
                  className="w-full flex justify-between items-center p-2 bg-black/30 hover:bg-black/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold bg-[#00F5A0]/10 text-[#00F5A0] px-2 py-0.5 rounded-full">
                      Level {level.level}
                    </span>
                    <span className="text-[6px] text-gray-400">{level.count} members</span>
                  </div>
                  {showLevelMembers[level.level] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
                
                {showLevelMembers[level.level] && (
                  <div className="p-2 bg-black/20 space-y-1">
                    {level.members.map(memberId => {
                      const memberDetail = memberDetails[memberId];
                      return (
                        <div key={memberId} className="bg-black/40 p-2 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[6px] font-bold">
                              {memberDetail?.userId?.charAt(0) || memberId?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[8px] font-bold">
                                {memberDetail?.userId || memberId.slice(-8)}
                              </p>
                              {memberDetail && (
                                <p className="text-[5px] text-gray-500">
                                  Earn: ₹{memberDetail.referralEarnings?.total || 0}
                                </p>
                              )}
                            </div>
                          </div>
                          {loadingMember && !memberDetail && (
                            <Loader2 size={8} className="animate-spin text-[#00F5A0]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission by Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-black/40 p-2 rounded-lg">
          <h4 className="text-[8px] font-bold mb-1 text-orange-400">Commission by Level</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(referralEarnings).map(([level, amount]) => {
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
        <GitBranch size={14} /> Leg-wise Team Structure
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
              <span className="text-[5px] bg-blue-500/20 text-blue-400 px-1 rounded">D:{member?.referralTree?.level1?.length || 0}</span>
              <span className="text-[5px] bg-orange-500/20 text-orange-400 px-1 rounded">₹{member?.referralEarnings?.total || 0}</span>
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
      <h4 className="text-[10px] font-bold mb-2 text-[#00F5A0]">Legs Unlocked</h4>
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
            <QuickStatCard label="Direct" value={member?.referralTree?.level1?.length || 0} />
            <QuickStatCard label="Earnings" value={`₹${member?.referralEarnings?.total || 0}`} />
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

const calculateTeamCount = (user) => {
  let count = 0;
  if (user?.referralTree) {
    for (let i = 1; i <= 21; i++) {
      count += user.referralTree[`level${i}`]?.length || 0;
    }
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

                {/* Screenshot */}
                {item.paymentScreenshot && (
                  <div className="col-span-12 mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => window.open(`https://cpay-link-backend.onrender.com${item.paymentScreenshot}`)}
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
const MobileDepositCard = ({ item, handleAction, formatDate }) => {
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

          {/* Screenshot */}
          {item.paymentScreenshot && (
            <button
              onClick={() => window.open(`https://cpay-link-backend.onrender.com${item.paymentScreenshot}`)}
              className="w-full bg-black/30 p-2 rounded mb-3 text-[#00F5A0] text-[8px] font-bold flex items-center justify-center gap-1"
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

/* ================= SCANNER CARD COMPONENT ================= */
const ScannerCard = ({ scanner: s, expanded, onToggle, formatDate, formatShortDate, getStatusColor }) => {
  return (
    <div className="bg-[#0A1F1A] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F5A0] to-green-600 flex items-center justify-center text-black font-bold text-xs">
              {s.user?.email?.charAt(0)?.toUpperCase() || s.user?.userId?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-xs font-bold truncate max-w-[120px]">
                {s.user?.email || s.user?.userId || 'System Request'}
              </p>
              <p className="text-[6px] text-gray-500 font-mono">
                ID: {s._id.slice(-8)}
              </p>
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
              {s.acceptedBy?.name || s.acceptedBy?.userId || '—'}
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
            <p className="text-[8px] font-bold text-[#00F5A0] uppercase tracking-wider mb-2">Creator Details</p>
            <div className="space-y-1 text-[8px]">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <span className="font-mono">{s.user?._id || 'System'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span>{s.user?.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <span>{s.user?.userId || '—'}</span>
              </div>
            </div>
          </div>

          {/* Acceptor Details */}
          {s.acceptedBy && (
            <div className="bg-black/30 p-3 rounded">
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-wider mb-2">Acceptor Details</p>
              <div className="space-y-1 text-[8px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID:</span>
                  <span className="font-mono">{s.acceptedBy._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span>{s.acceptedBy.name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID:</span>
                  <span>{s.acceptedBy.userId || '—'}</span>
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
          {s.isAutoRequest && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded">
              <p className="text-[8px] text-blue-400 flex items-center gap-1">
                <Zap size={8} /> Auto Request (Cycle {s.autoRequestCycle || 1})
              </p>
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


/* ================= USER DETAILS MODAL - WITH COMPLETE PAY REQUEST STATS ================= */
const UserDetailsModal = ({ user, onClose }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [showCreatedList, setShowCreatedList] = useState(false);
  const [showAcceptedList, setShowAcceptedList] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, scanners, earnings, team

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getUserDetails(user._id);
      if (data?.success) {
        setUserDetails(data.user);
      }
      setLoading(false);
    };
    fetchDetails();
  }, [user._id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[1000]">
        <Loader2 className="animate-spin text-[#00F5A0]" size={40} />
      </div>
    );
  }

  // Calculate scanner statistics
  const createdScanners = userDetails?.scanners?.created || [];
  const acceptedScanners = userDetails?.scanners?.accepted || [];
  
  const totalPayRequests = userDetails?.totalPayRequests || 0;
  const totalAcceptedRequests = userDetails?.totalAcceptedRequests || 0;
  const pendingPayRequests = totalPayRequests - totalAcceptedRequests;
  
  const createdTotalAmount = createdScanners.reduce((sum, s) => sum + (s.amount || 0), 0);
  const acceptedTotalAmount = acceptedScanners.reduce((sum, s) => sum + (s.amount || 0), 0);

  // Group scanners by status
  const createdByStatus = {
    ACTIVE: createdScanners.filter(s => s.status === 'ACTIVE').length,
    ACCEPTED: createdScanners.filter(s => s.status === 'ACCEPTED').length,
    PAYMENT_SUBMITTED: createdScanners.filter(s => s.status === 'PAYMENT_SUBMITTED').length,
    COMPLETED: createdScanners.filter(s => s.status === 'COMPLETED').length,
    EXPIRED: createdScanners.filter(s => s.status === 'EXPIRED').length
  };

  const acceptedByStatus = {
    ACTIVE: acceptedScanners.filter(s => s.status === 'ACTIVE').length,
    ACCEPTED: acceptedScanners.filter(s => s.status === 'ACCEPTED').length,
    PAYMENT_SUBMITTED: acceptedScanners.filter(s => s.status === 'PAYMENT_SUBMITTED').length,
    COMPLETED: acceptedScanners.filter(s => s.status === 'COMPLETED').length,
    EXPIRED: acceptedScanners.filter(s => s.status === 'EXPIRED').length
  };

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
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-4 border-b border-white/5 overflow-x-auto">
          <TabButton 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          
          <TabButton 
            label="Earnings" 
            active={activeTab === 'earnings'} 
            onClick={() => setActiveTab('earnings')}
          />
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
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard label="User ID" value={userDetails?.userId} />
                <InfoCard label="Referral Code" value={userDetails?.referralCode} copyable />
                <InfoCard label="Joined" value={new Date(userDetails?.createdAt).toLocaleDateString()} />
                <InfoCard label="Referred By" value={userDetails?.referredBy?.userId || 'None'} />
              </div>

              {/* Wallets */}
              <div className="bg-black/40 p-4 rounded-xl">
                <h3 className="text-sm font-bold mb-3 text-[#00F5A0]">Wallet Balances</h3>
                <div className="grid grid-cols-3 gap-4">
                  <WalletInfo label="USDT" value={userDetails?.wallets?.USDT?.toFixed(2) || 0} color="blue" />
                  <WalletInfo label="INR" value={`₹${userDetails?.wallets?.INR?.toFixed(2) || 0}`} color="green" />
                  <WalletInfo label="CASHBACK" value={`₹${userDetails?.wallets?.CASHBACK?.toFixed(2) || 0}`} color="orange" />
                </div>
              </div>

              {/* Pay Request Summary Card */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 rounded-xl">
                <h3 className="text-sm font-bold mb-3 text-blue-400 flex items-center gap-2">
                  <CreditCard size={16} /> Pay Request Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Created</p>
                    <p className="text-2xl font-bold text-[#00F5A0]">{totalPayRequests}</p>
                    {/* <p className="text-[8px] text-gray-500">₹{createdTotalAmount.toLocaleString()}</p> */}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Accepted</p>
                    <p className="text-2xl font-bold text-green-400">{totalAcceptedRequests}</p>
                    {/* <p className="text-[8px] text-gray-500">₹{acceptedTotalAmount.toLocaleString()}</p> */}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-orange-400">{pendingPayRequests}</p>
                    {/* <p className="text-[8px] text-gray-500">Awaiting</p> */}
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Direct Referrals" value={userDetails?.referralTree?.level1?.length || 0} color="blue" />
                <StatCard label="Total Team" value={userDetails?.team?.total || 0} color="purple" />
                <StatCard label="Total Earnings" value={`₹${userDetails?.earnings?.total || 0}`} color="orange" />
                <StatCard label="Team Cashback" value={`₹${Object.values(userDetails?.teamCashback || {}).reduce((s, l) => s + (l.total || 0), 0)}`} color="green" />
              </div>

              {/* Recent Activity Preview */}
              {userDetails?.transactions && userDetails.transactions.length > 0 && (
                <div className="bg-black/40 p-4 rounded-xl">
                  <h3 className="text-sm font-bold mb-3 text-gray-400">Recent Activity</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {userDetails.transactions.slice(0, 5).map(tx => (
                      <div key={tx._id} className="flex justify-between items-center text-[10px] bg-black/30 p-2 rounded">
                        <span className="text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type}
                        </span>
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
              {/* Commission by Level */}
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
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Total Commission:</span>
                    <span className="text-lg font-bold text-orange-400">₹{userDetails?.earnings?.total || 0}</span>
                  </div>
                </div>
              </div>

              {/* Team Cashback by Level */}
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

          {/* ========== TEAM TAB ========== */}
          {activeTab === 'team' && (
            <div className="bg-black/40 p-4 rounded-xl">
              <h3 className="text-sm font-bold mb-3 text-[#00F5A0]">Team Structure ({userDetails?.team?.total || 0} members)</h3>
              {userDetails?.team?.levels && userDetails.team.levels.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userDetails.team.levels.map(level => (
                    <TeamLevelCard
                      key={level.level}
                      level={level}
                      expandedLevel={expandedLevel}
                      setExpandedLevel={setExpandedLevel}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No team members yet</p>
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