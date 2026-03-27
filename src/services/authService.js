

// services/authService.js
// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-link-backend-production.up.railway.app/api";

const jsonHeaders = {
  "Content-Type": "application/json",
};

// ========== AUTH FUNCTIONS ==========
export const login = async (userId, pin) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ userId, pin }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store token and user data
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      return { 
        success: true, 
        data: data,
        message: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        message: data.message || "Login failed" 
      };
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    return { 
      success: false, 
      message: error.message || "Network error" 
    };
  }
};

export const adminLogin = async (adminId, pin) => {
  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ adminId, pin }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const responseData = data.data || data;
      return { 
        success: true, 
        data: responseData,
        message: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        message: data.message || "Admin login failed" 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.message || "Network error" 
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      if (data.bonus) {
        setTimeout(() => {
          import('react-hot-toast').then(({ default: toast }) => {
            toast.success(
              `🎉 Welcome Bonus! You received $${data.bonus.usdt} USDT (₹${data.bonus.inr})`,
              { 
                duration: 8000,
                style: {
                  background: '#0A1F1A',
                  color: 'white',
                  border: '1px solid #00F5A0',
                }
              }
            );
          });
        }, 1000);
      }
      
      return { 
        success: true, 
        data: data,
        message: null 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        message: data.message || "Registration failed" 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.message || "Network error" 
    };
  }
};

export const getReferralStats = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/referral`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return { success: false, message: "Network error" };
  }
};

export const getTeamCashbackSummary = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/team-summary`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching team cashback:", error);
    return null;
  }
};

export const activateWallet = async (token, dailyLimit) => {
  try {
    const res = await fetch(`${API_BASE}/scanner/activate-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ dailyLimit })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error activating wallet:", error);
    return { success: false, message: "Network error" };
  }
};

export const getActivationStatus = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/scanner/activation-status`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching activation status:", error);
    return { activated: false };
  }
};

export const getTodayTeamStats = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/today-team-stats`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching today's stats:", error);
    return { 
      success: false, 
      teamBusiness: 0, 
      yourCommission: 0, 
      teamMembers: 0 
    };
  }
};

export const getTotalTeamStats = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/today-team-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false };
  }
};

// ========== SIMPLIFIED: LEG DETAILS ==========
export const getLegDetails = async (token, legNumber) => {
  try {
    const res = await fetch(`${API_BASE}/auth/leg/${legNumber}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching leg ${legNumber} details:`, error);
    return { success: false, message: "Network error" };
  }
};

// ========== SIMPLIFIED: GET NOTIFICATIONS ==========
export const getNotifications = async (token, limit = 20) => {
  try {
    const res = await fetch(`${API_BASE}/auth/notifications?limit=${limit}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, notifications: [], unreadCount: 0 };
  }
};

// ========== SIMPLIFIED: MARK NOTIFICATION AS READ ==========
export const markNotificationRead = async (token, notificationId) => {
  try {
    const res = await fetch(`${API_BASE}/auth/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, message: "Network error" };
  }
};

// ========== SIMPLIFIED: GET UNLOCK STATUS ==========
export const getUnlockStatus = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/unlock-status-simple`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching unlock status:", error);
    return { 
      success: false, 
      data: {
        currentDirects: 0,
        totalLegs: 0,
        unlockedLevelsInEachLeg: 0,
        isFullyUnlocked: false,
        nextLevelToUnlock: null,
        progress: '0%',
        legs: []
      }
    };
  }
};

// ========== SIMPLIFIED: GET LEG UNLOCKING STATUS ==========
export const getLegUnlockingStatus = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/leg-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!res.ok) throw new Error("Failed to fetch leg status");
    const data = await res.json();
    
    return data.data || data;
  } catch (error) {
    console.error("Error fetching leg status:", error);
    return {
      success: false,
      data: {
        userId: 'Unknown',
        directReferrals: 0,
        totalLegs: 0,
        unlockedLevelsInEachLeg: 0,
        levelAccessibility: {},
        legDetails: {},
        nextLevelToUnlock: null,
        summary: 'Unable to fetch leg status'
      }
    };
  }
};

// ========== SIMPLIFIED: GET NEXT LEVEL REQUIREMENT ==========
export const getNextLevelRequirement = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/next-level-requirement`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!res.ok) throw new Error("Failed to fetch next level requirement");
    const data = await res.json();
    
    return data.data || data;
  } catch (error) {
    console.error("Error fetching next level requirement:", error);
    return {
      success: false,
      data: {
        currentDirects: 0,
        nextLevel: 1,
        requiredDirects: 1,
        remainingDirects: 1,
        totalLegs: 0,
        levelsToUnlock: [1],
        message: 'Add 1 direct referral to unlock Level 1',
        isUnlockable: true
      }
    };
  }
};

export const getMemberDetails = async (memberId, token) => {
  try {
    const id = String(memberId);

    const res = await fetch(`${API_BASE}/auth/member-details/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json(); // एकदाच read कर

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Error ${res.status}`, // data वापर, errData नाही
        data: null
      };
    }

    return data;

  } catch (error) {
    console.error("Error fetching member details:", error);
    return {
      success: false,
      data: {
        userId: memberId,
        totalEarnings: 0,
        teamCashback: 0,
        directReferrals: 0,
        totalTeam: 0,
        totalLegs: 0,
        unlockedLevelsInEachLeg: 0,
        levelAccessibility: {},
        levelEarnings: {},
        downlineCount: {},
        legsStatus: {},
        recentActivity: []
      }
    };
  }
};

// ========== SIMPLIFIED: GET TEAM SUMMARY ==========
export const getTeamSummary = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/team-summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!res.ok) throw new Error("Failed to fetch team summary");
    const data = await res.json();
    
    return data.data || data;
  } catch (error) {
    console.error("Error fetching team summary:", error);
    return {
      success: false,
      data: {
        totalLegs: 0,
        directReferrals: 0,
        unlockedLevelsInEachLeg: 0,
        totalTeam: 0,
        totalEarnings: 0,
        levelWiseUsers: {},
        earningsByLevel: {},
        isFullyUnlocked: false,
        nextLevel: null
      }
    };
  }
};

// ========== SIMPLIFIED: GET LEG BREAKDOWN ==========
export const getLegBreakdown = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/leg-breakdown`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!res.ok) throw new Error("Failed to fetch leg breakdown");
    const data = await res.json();
    
    return data.data || data;
  } catch (error) {
    console.error("Error fetching leg breakdown:", error);
    return {
      success: false,
      data: {
        totalLegs: 0,
        directReferrals: 0,
        unlockedLevelsInEachLeg: 0,
        legs: []
      }
    };
  }
};

// ========== SIMPLIFIED: GET USERS AT SPECIFIC LEVEL ==========
export const getLevelUsers = async (level, token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/level-users/${level}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!res.ok) throw new Error("Failed to fetch level users");
    const data = await res.json();
    
    return data.data || data;
  } catch (error) {
    console.error(`Error fetching users at level ${level}:`, error);
    return {
      success: false,
      data: {
        level: level,
        isAccessible: false,
        requiredDirects: level,
        currentDirects: 0,
        totalUsers: 0,
        users: []
      }
    };
  }
};

// ========== SIMPLIFIED: GET LEG-WISE USERS ==========
export const getLegUsers = async (legNumber, level, token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/leg-users/${legNumber}/${level}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!res.ok) throw new Error("Failed to fetch leg users");
    const data = await res.json();
    
    return data.data || data;
  } catch (error) {
    console.error(`Error fetching leg ${legNumber} level ${level} users:`, error);
    return {
      success: false,
      data: {
        legNumber,
        level,
        totalUsers: 0,
        isUnlocked: false,
        earnings: 0,
        teamCashback: 0,
        users: []
      }
    };
  }
};

// ========== SIMPLIFIED: COMMISSION RATES ==========
export const getCommissionRate = (level) => {
  const rates = {
    1: 0.30, 2: 0.15, 3: 0.10, 4: 0.05, 5: 0.30,
    6: 0.03, 7: 0.04, 8: 0.03, 9: 0.03, 10: 0.30,
    11: 0.03, 12: 0.03, 13: 0.03, 14: 0.03, 15: 0.03,
    16: 0.05, 17: 0.10, 18: 0.15, 19: 0.30, 20: 0.30,
    21: 0.63
  };
  return rates[level] || 0;
};

// ========== SIMPLIFIED: FORMAT LEG DATA ==========
export const formatLegData = (legStatus) => {
  if (!legStatus) return null;
  
  const formatted = {
    userId: legStatus.userId,
    directReferrals: legStatus.directReferrals || 0,
    totalLegs: legStatus.totalLegs || 0,
    unlockedLevelsInEachLeg: legStatus.unlockedLevelsInEachLeg || 0,
    summary: legStatus.summary || '',
    nextLevelToUnlock: legStatus.nextLevelToUnlock,
    legs: [],
    levels: []
  };
  
  // Format legs for display
  if (legStatus.legDetails) {
    formatted.legs = Object.entries(legStatus.legDetails).map(([legKey, leg]) => {
      return {
        legNumber: leg.legNumber,
        legKey: legKey,
        totalUsers: leg.totalUsers || 0,
        totalEarnings: leg.totalEarnings || 0,
        unlockedLevels: leg.unlockedLevels || 0,
        isFullyUnlocked: leg.isFullyUnlocked || false,
        levels: leg.levels || {}
      };
    }).sort((a, b) => a.legNumber - b.legNumber);
  }
  
  // Format levels for display
  if (legStatus.levelAccessibility) {
    for (let level = 1; level <= 21; level++) {
      const levelKey = `level${level}`;
      const levelData = legStatus.levelAccessibility[levelKey] || {};
      const commissionRate = getCommissionRate(level);
      
      formatted.levels.push({
        level: level,
        isAccessible: levelData.isAccessible || false,
        usersCount: levelData.usersCount || 0,
        commissionRate: commissionRate * 100,
        isUnlocked: levelData.isUnlocked || false
      });
    }
  }
  
  return formatted;
};

// ========== SIMPLIFIED: CALCULATE LEVEL PROGRESS ==========
export const calculateLevelProgress = (directReferrals, targetLevel) => {
  const isAccessible = targetLevel <= directReferrals;
  
  return {
    level: targetLevel,
    isAccessible,
    currentDirects: directReferrals,
    requiredDirects: targetLevel,
    remainingDirects: isAccessible ? 0 : targetLevel - directReferrals,
    progress: Math.min(100, (directReferrals / targetLevel) * 100),
    canUnlockWithOneMore: !isAccessible && (directReferrals + 1 === targetLevel)
  };
};

// ========== SIMPLIFIED: GET LEG-WISE LEVEL STATUS ==========
export const getLegWiseLevelStatus = (legStatus, legNumber) => {
  if (!legStatus || !legStatus.legDetails || !legStatus.legDetails[`leg${legNumber}`]) {
    return [];
  }
  
  const leg = legStatus.legDetails[`leg${legNumber}`];
  const status = [];
  
  for (let level = 1; level <= 21; level++) {
    const levelData = leg.levels?.[`level${level}`] || {};
    const commissionRate = getCommissionRate(level);
    
    status.push({
      level,
      users: levelData.users || 0,
      isUnlocked: levelData.isUnlocked || level <= legStatus.directReferrals,
      earnings: levelData.earnings || 0,
      teamCashback: levelData.teamCashback || 0,
      commissionRate: commissionRate * 100
    });
  }
  
  return status;
};

// ========== SIMPLIFIED: CALCULATE POTENTIAL EARNINGS ==========
export const calculatePotentialEarnings = (amount, level) => {
  const rate = getCommissionRate(level);
  return {
    amount,
    rate: rate * 100,
    commission: amount * rate,
    level
  };
};

// ========== SIMPLIFIED: GET ALL COMMISSION RATES ==========
export const getAllCommissionRates = () => {
  const rates = [];
  for (let level = 1; level <= 21; level++) {
    rates.push({
      level,
      rate: getCommissionRate(level) * 100
    });
  }
  return rates;
};

// ========== SIMPLIFIED: CHECK IF LEVEL IS UNLOCKED ==========
export const isLevelUnlocked = (directReferrals, level) => {
  return level <= directReferrals;
};

// ========== SIMPLIFIED: GET NEXT LEVEL TO UNLOCK ==========
export const getNextLevelToUnlock = (directReferrals) => {
  if (directReferrals >= 21) return null;
  return directReferrals + 1;
};

// ========== SIMPLIFIED: GET UNLOCK PROGRESS ==========
export const getUnlockProgress = (directReferrals) => {
  return {
    current: directReferrals,
    total: 21,
    percentage: Math.round((directReferrals / 21) * 100),
    remaining: 21 - directReferrals,
    isFullyUnlocked: directReferrals === 21
  };
};

// ========== GET PROFILE ==========
export const getProfile = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, message: "Network error" };
  }
};

// ========== UPDATE EMAIL ==========
export const updateEmail = async (token, email) => {
  try {
    const res = await fetch(`${API_BASE}/auth/update-email`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error updating email:", error);
    return { success: false, message: "Network error" };
  }
};

// ========== UPDATE PIN ==========
export const updatePin = async (token, currentPin, newPin) => {
  try {
    const res = await fetch(`${API_BASE}/auth/update-pin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPin, newPin })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error updating PIN:", error);
    return { success: false, message: "Network error" };
  }
};

export default {
  login,
  adminLogin,
  register,
  getReferralStats,
  getTeamCashbackSummary,
  activateWallet,
  getActivationStatus,
  getTodayTeamStats,
  getLegDetails,
  getNotifications,
  markNotificationRead,
  getUnlockStatus,
  getLegUnlockingStatus,
  getNextLevelRequirement,
  getMemberDetails,
  getTeamSummary,
  getLegBreakdown,
  getLevelUsers,
  getLegUsers,
  getCommissionRate,
  formatLegData,
  calculateLevelProgress,
  getLegWiseLevelStatus,
  calculatePotentialEarnings,
  getAllCommissionRates,
  isLevelUnlocked,
  getNextLevelToUnlock,
  getUnlockProgress,
  getProfile,
  updateEmail,
  updatePin
};