// services/authService.js
// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-link-backend.onrender.com/api";


const jsonHeaders = {
  "Content-Type": "application/json",
};



export const login = async (userId, pin) => {
  try {
    // console.log("🔐 Login attempt:", { userId, pin }); // Debug log

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ userId, pin }),
    });
    
    const data = await response.json();
    // console.log("📥 Login response:", { status: response.status, data }); // Debug log
    
    if (response.ok) {
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
    // console.log("🔐 Admin login attempt:", { adminId, pin }); // Debug log

    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ adminId, pin }),
    });
    
    const data = await response.json();
    // console.log("📥 Admin login response:", { status: response.status, data }); // Debug log
    
    if (response.ok) {
      // Handle both response formats
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
    // console.error("❌ Admin login error:", error);
    return { 
      success: false, 
      message: error.message || "Network error" 
    };
  }
};

export const register = async (userData) => {
  try {
    // console.log("📝 Register attempt:", userData); // Debug log

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    // console.log("📥 Register response:", { status: response.status, data }); // Debug log
    
    if (response.ok) {
      // ✅ Store token and user data in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      // ✅ Show welcome bonus toast (without JSX)
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
    // console.error("❌ Register error:", error);
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
    return await res.json();
  } catch (error) {
    // console.error("Fetch error:", error);

    return { message: "Network error" };
  }
};

export const getTeamCashbackSummary = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/wallet/team-cashback`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
  } catch (error) {
    // console.error("Error fetching team cashback:", error);
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
    return await res.json();
  } catch (error) {
    // console.error("Error activating wallet:", error);
    return { message: "Network error" };
  }
};

export const getActivationStatus = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/scanner/activation-status`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
  } catch (error) {
    // console.error("Error fetching activation status:", error);
    return { activated: false };
  }
};


// services/authService.js - यामध्ये add करा

export const getTodayTeamStats = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/transactions/today-team-stats`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    // console.error("Error fetching today's team stats:", error);
    return { 
      success: false, 
      teamBusiness: 0, 
      yourCommission: 0, 
      teamMembers: 0 
    };
  }
};


// services/authService.js

// ✅ Leg Unlocking Status मिळवण्यासाठी
export const getLegUnlockingStatus = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/leg-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!res.ok) throw new Error("Failed to fetch leg status");
    return await res.json();
  } catch (error) {
    // console.error("Error fetching leg status:", error);
    throw error;
  }
};

// ✅ Next Leg Requirement मिळवण्यासाठी
export const getNextLegRequirement = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/next-leg-requirement`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!res.ok) throw new Error("Failed to fetch next leg requirement");
    return await res.json();
  } catch (error) {
    // console.error("Error fetching next leg requirement:", error);
    throw error;
  }
};

// services/authService.js

// services/authService.js

// ✅ Member Details मिळवण्यासाठी - FIXED with better error handling
export const getMemberDetails = async (memberId, token) => {
  try {
    // console.log("Fetching member details for:", memberId);
    
    // Ensure memberId is a string
    const id = String(memberId);
    
    const res = await fetch(`${API_BASE}/auth/member-details/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const data = await res.json();
    // console.log("Member details response status:", res.status);
    
    if (!res.ok) {
      // console.error("Error response:", data);
      // Return fallback data instead of throwing
      return {
        success: false,
        data: {
          userId: memberId,
          totalEarnings: 0,
          teamCashback: 0,
          directReferrals: 0,
          totalTeam: 0,
          legsUnlocked: {
            leg1: true, leg2: false, leg3: false,
            leg4: false, leg5: false, leg6: false, leg7: false
          },
          recentActivity: []
        }
      };
    }
    
    return data;
  } catch (error) {
    // console.error("Error fetching member details:", error);
    // Return fallback data on network error
    return {
      success: false,
      data: {
        userId: memberId,
        totalEarnings: 0,
        teamCashback: 0,
        directReferrals: 0,
        totalTeam: 0,
        legsUnlocked: {
          leg1: true, leg2: false, leg3: false,
          leg4: false, leg5: false, leg6: false, leg7: false
        },
        recentActivity: []
      }
    };
  }
};