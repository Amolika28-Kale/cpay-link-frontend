// // services/authService.js
// const API_BASE = "http://localhost:5000/api";
// // const API_BASE = "https://cpay-link-backend.onrender.com/api";


// const jsonHeaders = {
//   "Content-Type": "application/json",
// };



// export const login = async (userId, pin) => {
//   try {
//     // console.log("🔐 Login attempt:", { userId, pin }); // Debug log

//     const response = await fetch(`${API_BASE}/auth/login`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({ userId, pin }),
//     });
    
//     const data = await response.json();
//     // console.log("📥 Login response:", { status: response.status, data }); // Debug log
    
//     if (response.ok) {
//       return { 
//         success: true, 
//         data: data,
//         message: null 
//       };
//     } else {
//       return { 
//         success: false, 
//         data: null, 
//         message: data.message || "Login failed" 
//       };
//     }
//   } catch (error) {
//     console.error("❌ Login error:", error);
//     return { 
//       success: false, 
//       message: error.message || "Network error" 
//     };
//   }
// };

// export const adminLogin = async (adminId, pin) => {
//   try {
//     // console.log("🔐 Admin login attempt:", { adminId, pin }); // Debug log

//     const response = await fetch(`${API_BASE}/admin/login`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({ adminId, pin }),
//     });
    
//     const data = await response.json();
//     // console.log("📥 Admin login response:", { status: response.status, data }); // Debug log
    
//     if (response.ok) {
//       // Handle both response formats
//       const responseData = data.data || data;
//       return { 
//         success: true, 
//         data: responseData,
//         message: null 
//       };
//     } else {
//       return { 
//         success: false, 
//         data: null, 
//         message: data.message || "Admin login failed" 
//       };
//     }
//   } catch (error) {
//     // console.error("❌ Admin login error:", error);
//     return { 
//       success: false, 
//       message: error.message || "Network error" 
//     };
//   }
// };

// export const register = async (userData) => {
//   try {
//     // console.log("📝 Register attempt:", userData); // Debug log

//     const response = await fetch(`${API_BASE}/auth/register`, {
//       method: 'POST',
//       headers: jsonHeaders,
//       body: JSON.stringify(userData)
//     });
    
//     const data = await response.json();
//     // console.log("📥 Register response:", { status: response.status, data }); // Debug log
    
//     if (response.ok) {
//       // ✅ Store token and user data in localStorage
//       if (data.token) {
//         localStorage.setItem("token", data.token);
//       }
//       if (data.user) {
//         localStorage.setItem("user", JSON.stringify(data.user));
//       }
      
//       // ✅ Show welcome bonus toast (without JSX)
//       if (data.bonus) {
//         setTimeout(() => {
//           import('react-hot-toast').then(({ default: toast }) => {
//             toast.success(
//               `🎉 Welcome Bonus! You received $${data.bonus.usdt} USDT (₹${data.bonus.inr})`,
//               { 
//                 duration: 8000,
//                 style: {
//                   background: '#0A1F1A',
//                   color: 'white',
//                   border: '1px solid #00F5A0',
//                 }
//               }
//             );
//           });
//         }, 1000);
//       }
      
//       return { 
//         success: true, 
//         data: data,
//         message: null 
//       };
//     } else {
//       return { 
//         success: false, 
//         data: null, 
//         message: data.message || "Registration failed" 
//       };
//     }
//   } catch (error) {
//     // console.error("❌ Register error:", error);
//     return { 
//       success: false, 
//       message: error.message || "Network error" 
//     };
//   }
// };

// export const getReferralStats = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/referral`, {
//       method: "GET",
//       headers: { "Authorization": `Bearer ${token}` },
//     });
//     return await res.json();
//   } catch (error) {
//     // console.error("Fetch error:", error);

//     return { message: "Network error" };
//   }
// };

// export const getTeamCashbackSummary = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/wallet/team-cashback`, {
//       headers: { "Authorization": `Bearer ${token}` }
//     });
//     return await res.json();
//   } catch (error) {
//     // console.error("Error fetching team cashback:", error);
//     return null;
//   }
// };

// export const activateWallet = async (token, dailyLimit) => {
//   try {
//     const res = await fetch(`${API_BASE}/scanner/activate-wallet`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({ dailyLimit })
//     });
//     return await res.json();
//   } catch (error) {
//     // console.error("Error activating wallet:", error);
//     return { message: "Network error" };
//   }
// };

// export const getActivationStatus = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/scanner/activation-status`, {
//       headers: { "Authorization": `Bearer ${token}` }
//     });
//     return await res.json();
//   } catch (error) {
//     // console.error("Error fetching activation status:", error);
//     return { activated: false };
//   }
// };


// // services/authService.js - यामध्ये add करा

// export const getTodayTeamStats = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/transactions/today-team-stats`, {
//       headers: { "Authorization": `Bearer ${token}` }
//     });
//     const data = await res.json();
//     return data;
//   } catch (error) {
//     // console.error("Error fetching today's team stats:", error);
//     return { 
//       success: false, 
//       teamBusiness: 0, 
//       yourCommission: 0, 
//       teamMembers: 0 
//     };
//   }
// };


// // services/authService.js

// // ✅ Leg Unlocking Status मिळवण्यासाठी
// export const getLegUnlockingStatus = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/leg-status`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     if (!res.ok) throw new Error("Failed to fetch leg status");
//     return await res.json();
//   } catch (error) {
//     // console.error("Error fetching leg status:", error);
//     throw error;
//   }
// };

// // ✅ Next Leg Requirement मिळवण्यासाठी
// export const getNextLegRequirement = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/next-leg-requirement`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     if (!res.ok) throw new Error("Failed to fetch next leg requirement");
//     return await res.json();
//   } catch (error) {
//     // console.error("Error fetching next leg requirement:", error);
//     throw error;
//   }
// };

// // services/authService.js

// // services/authService.js

// // ✅ Member Details मिळवण्यासाठी - FIXED with better error handling
// export const getMemberDetails = async (memberId, token) => {
//   try {
//     // console.log("Fetching member details for:", memberId);
    
//     // Ensure memberId is a string
//     const id = String(memberId);
    
//     const res = await fetch(`${API_BASE}/auth/member-details/${id}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     const data = await res.json();
//     // console.log("Member details response status:", res.status);
    
//     if (!res.ok) {
//       // console.error("Error response:", data);
//       // Return fallback data instead of throwing
//       return {
//         success: false,
//         data: {
//           userId: memberId,
//           totalEarnings: 0,
//           teamCashback: 0,
//           directReferrals: 0,
//           totalTeam: 0,
//           legsUnlocked: {
//             leg1: true, leg2: false, leg3: false,
//             leg4: false, leg5: false, leg6: false, leg7: false
//           },
//           recentActivity: []
//         }
//       };
//     }
    
//     return data;
//   } catch (error) {
//     // console.error("Error fetching member details:", error);
//     // Return fallback data on network error
//     return {
//       success: false,
//       data: {
//         userId: memberId,
//         totalEarnings: 0,
//         teamCashback: 0,
//         directReferrals: 0,
//         totalTeam: 0,
//         legsUnlocked: {
//           leg1: true, leg2: false, leg3: false,
//           leg4: false, leg5: false, leg6: false, leg7: false
//         },
//         recentActivity: []
//       }
//     };
//   }
// };


// services/authService.js
// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-link-backend.onrender.com/api";

const jsonHeaders = {
  "Content-Type": "application/json",
};

// ========== AUTH FUNCTIONS (No changes needed) ==========
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

// ========== UPDATED: Dynamic Legs Functions ==========

/**
 * ✅ UPDATED: Get Leg Unlocking Status for Dynamic Legs
 * नवीन dynamic legs schema साठी अपडेट केले
 */
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
    
    // Handle both response formats (with or without success wrapper)
    return data.data || data;
  } catch (error) {
    console.error("Error fetching leg status:", error);
    // Return fallback data on error
    return {
      success: false,
      data: {
        userId: 'Unknown',
        directReferrals: 0,
        totalLegs: 0,
        levelAccessibility: {},
        legDetails: {},
        summary: 'Unable to fetch leg status'
      }
    };
  }
};

/**
 * ✅ UPDATED: Get Next Level Requirement for Dynamic Legs
 * आता हे next level दाखवते (next leg नाही)
 */
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
    
    // Handle both response formats
    return data.data || data;
  } catch (error) {
    console.error("Error fetching next level requirement:", error);
    return {
      success: false,
      data: {
        userId: 'Unknown',
        directReferrals: 0,
        totalLegs: 0,
        nextLevelToUnlock: null,
        summary: 'Unable to fetch next level requirement'
      }
    };
  }
};

/**
 * ✅ UPDATED: Get Member Details for Dynamic Legs
 * नवीन schema नुसार member details फॉर्मेट करते
 */
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
      console.error("Error response:", data);
      // Return fallback data for new schema
      return {
        success: false,
        data: {
          userId: memberId,
          totalEarnings: 0,
          teamCashback: 0,
          directReferrals: 0,
          totalTeam: 0,
          totalLegs: 0,
          levelAccessibility: {},
          levelEarnings: {},
          downlineCount: {},
          recentActivity: []
        }
      };
    }
    
    // Return the data (already in new schema format from backend)
    return data;
  } catch (error) {
    console.error("Error fetching member details:", error);
    // Return fallback data for new schema
    return {
      success: false,
      data: {
        userId: memberId,
        totalEarnings: 0,
        teamCashback: 0,
        directReferrals: 0,
        totalTeam: 0,
        totalLegs: 0,
        levelAccessibility: {},
        levelEarnings: {},
        downlineCount: {},
        recentActivity: []
      }
    };
  }
};

/**
 * ✅ NEW: Get Team Summary
 * संपूर्ण टीमचा summary मिळवते
 */
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
        totalTeam: 0,
        earningsByLevel: {},
        levels: {}
      }
    };
  }
};

/**
 * ✅ NEW: Get Leg Breakdown
 * Leg-wise detailed breakdown मिळवते
 */
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
        legs: []
      }
    };
  }
};

/**
 * ✅ NEW: Get Users at Specific Level
 * दिलेल्या level वरील सर्व users मिळवते
 */
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
        totalUsers: 0,
        users: []
      }
    };
  }
};

/**
 * ✅ Helper: Calculate Level Progress
 * level unlock साठी किती progress झाला हे कॅल्क्युलेट करते
 */
export const calculateLevelProgress = (levelAccessibility, targetLevel) => {
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
  
  const required = requirements[targetLevel] || [];
  let completed = 0;
  
  for (const level of required) {
    if (levelAccessibility[`level${level}`]?.isAccessible) {
      completed++;
    }
  }
  
  return {
    required,
    completed,
    remaining: required.length - completed,
    percentage: required.length > 0 ? (completed / required.length) * 100 : 0,
    isComplete: completed === required.length
  };
};

/**
 * ✅ Helper: Format Leg Data for Display
 * UI साठी leg data फॉर्मेट करते
 */
export const formatLegData = (legStatus) => {
  if (!legStatus) return null;
  
  const formatted = {
    userId: legStatus.userId,
    directReferrals: legStatus.directReferrals || 0,
    totalLegs: legStatus.totalLegs || 0,
    summary: legStatus.summary || '',
    legs: [],
    levels: []
  };
  
  // Format legs for display
  if (legStatus.legDetails) {
    formatted.legs = Object.entries(legStatus.legDetails).map(([legKey, leg]) => ({
      legNumber: leg.legNumber,
      legKey: legKey,
      totalUsers: leg.totalUsers || 0,
      totalEarnings: leg.totalEarnings || 0,
      levelsUnlocked: Object.values(leg.levels || {}).filter(l => l.isUnlocked).length,
      levels: leg.levels || {}
    }));
  }
  
  // Format levels for display
  if (legStatus.levelAccessibility) {
    for (let level = 1; level <= 21; level++) {
      const levelKey = `level${level}`;
      const levelData = legStatus.levelAccessibility[levelKey] || {};
      
      formatted.levels.push({
        level: level,
        isAccessible: levelData.isAccessible || false,
        usersCount: levelData.usersCount || 0,
        requiredLevels: levelData.requiredLevels || []
      });
    }
  }
  
  return formatted;
};