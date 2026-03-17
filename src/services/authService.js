// // // services/authService.js
// // const API_BASE = "http://localhost:5000/api";
// // // const API_BASE = "https://cpay-link-backend.onrender.com/api";


// // const jsonHeaders = {
// //   "Content-Type": "application/json",
// // };



// // export const login = async (userId, pin) => {
// //   try {
// //     // console.log("🔐 Login attempt:", { userId, pin }); // Debug log

// //     const response = await fetch(`${API_BASE}/auth/login`, {
// //       method: "POST",
// //       headers: jsonHeaders,
// //       body: JSON.stringify({ userId, pin }),
// //     });
    
// //     const data = await response.json();
// //     // console.log("📥 Login response:", { status: response.status, data }); // Debug log
    
// //     if (response.ok) {
// //       return { 
// //         success: true, 
// //         data: data,
// //         message: null 
// //       };
// //     } else {
// //       return { 
// //         success: false, 
// //         data: null, 
// //         message: data.message || "Login failed" 
// //       };
// //     }
// //   } catch (error) {
// //     console.error("❌ Login error:", error);
// //     return { 
// //       success: false, 
// //       message: error.message || "Network error" 
// //     };
// //   }
// // };

// // export const adminLogin = async (adminId, pin) => {
// //   try {
// //     // console.log("🔐 Admin login attempt:", { adminId, pin }); // Debug log

// //     const response = await fetch(`${API_BASE}/admin/login`, {
// //       method: "POST",
// //       headers: jsonHeaders,
// //       body: JSON.stringify({ adminId, pin }),
// //     });
    
// //     const data = await response.json();
// //     // console.log("📥 Admin login response:", { status: response.status, data }); // Debug log
    
// //     if (response.ok) {
// //       // Handle both response formats
// //       const responseData = data.data || data;
// //       return { 
// //         success: true, 
// //         data: responseData,
// //         message: null 
// //       };
// //     } else {
// //       return { 
// //         success: false, 
// //         data: null, 
// //         message: data.message || "Admin login failed" 
// //       };
// //     }
// //   } catch (error) {
// //     // console.error("❌ Admin login error:", error);
// //     return { 
// //       success: false, 
// //       message: error.message || "Network error" 
// //     };
// //   }
// // };

// // export const register = async (userData) => {
// //   try {
// //     // console.log("📝 Register attempt:", userData); // Debug log

// //     const response = await fetch(`${API_BASE}/auth/register`, {
// //       method: 'POST',
// //       headers: jsonHeaders,
// //       body: JSON.stringify(userData)
// //     });
    
// //     const data = await response.json();
// //     // console.log("📥 Register response:", { status: response.status, data }); // Debug log
    
// //     if (response.ok) {
// //       // ✅ Store token and user data in localStorage
// //       if (data.token) {
// //         localStorage.setItem("token", data.token);
// //       }
// //       if (data.user) {
// //         localStorage.setItem("user", JSON.stringify(data.user));
// //       }
      
// //       // ✅ Show welcome bonus toast (without JSX)
// //       if (data.bonus) {
// //         setTimeout(() => {
// //           import('react-hot-toast').then(({ default: toast }) => {
// //             toast.success(
// //               `🎉 Welcome Bonus! You received $${data.bonus.usdt} USDT (₹${data.bonus.inr})`,
// //               { 
// //                 duration: 8000,
// //                 style: {
// //                   background: '#0A1F1A',
// //                   color: 'white',
// //                   border: '1px solid #00F5A0',
// //                 }
// //               }
// //             );
// //           });
// //         }, 1000);
// //       }
      
// //       return { 
// //         success: true, 
// //         data: data,
// //         message: null 
// //       };
// //     } else {
// //       return { 
// //         success: false, 
// //         data: null, 
// //         message: data.message || "Registration failed" 
// //       };
// //     }
// //   } catch (error) {
// //     // console.error("❌ Register error:", error);
// //     return { 
// //       success: false, 
// //       message: error.message || "Network error" 
// //     };
// //   }
// // };

// // export const getReferralStats = async (token) => {
// //   try {
// //     const res = await fetch(`${API_BASE}/auth/referral`, {
// //       method: "GET",
// //       headers: { "Authorization": `Bearer ${token}` },
// //     });
// //     return await res.json();
// //   } catch (error) {
// //     // console.error("Fetch error:", error);

// //     return { message: "Network error" };
// //   }
// // };

// // export const getTeamCashbackSummary = async (token) => {
// //   try {
// //     const res = await fetch(`${API_BASE}/wallet/team-cashback`, {
// //       headers: { "Authorization": `Bearer ${token}` }
// //     });
// //     return await res.json();
// //   } catch (error) {
// //     // console.error("Error fetching team cashback:", error);
// //     return null;
// //   }
// // };

// // export const activateWallet = async (token, dailyLimit) => {
// //   try {
// //     const res = await fetch(`${API_BASE}/scanner/activate-wallet`, {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'Authorization': `Bearer ${token}`
// //       },
// //       body: JSON.stringify({ dailyLimit })
// //     });
// //     return await res.json();
// //   } catch (error) {
// //     // console.error("Error activating wallet:", error);
// //     return { message: "Network error" };
// //   }
// // };

// // export const getActivationStatus = async (token) => {
// //   try {
// //     const res = await fetch(`${API_BASE}/scanner/activation-status`, {
// //       headers: { "Authorization": `Bearer ${token}` }
// //     });
// //     return await res.json();
// //   } catch (error) {
// //     // console.error("Error fetching activation status:", error);
// //     return { activated: false };
// //   }
// // };


// // // services/authService.js - यामध्ये add करा

// // export const getTodayTeamStats = async (token) => {
// //   try {
// //     const res = await fetch(`${API_BASE}/transactions/today-team-stats`, {
// //       headers: { "Authorization": `Bearer ${token}` }
// //     });
// //     const data = await res.json();
// //     return data;
// //   } catch (error) {
// //     // console.error("Error fetching today's team stats:", error);
// //     return { 
// //       success: false, 
// //       teamBusiness: 0, 
// //       yourCommission: 0, 
// //       teamMembers: 0 
// //     };
// //   }
// // };


// // // services/authService.js

// // // ✅ Leg Unlocking Status मिळवण्यासाठी
// // export const getLegUnlockingStatus = async (token) => {
// //   try {
// //     const res = await fetch(`${API_BASE}/auth/leg-status`, {
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //         "Content-Type": "application/json",
// //       },
// //     });
    
// //     if (!res.ok) throw new Error("Failed to fetch leg status");
// //     return await res.json();
// //   } catch (error) {
// //     // console.error("Error fetching leg status:", error);
// //     throw error;
// //   }
// // };

// // // ✅ Next Leg Requirement मिळवण्यासाठी
// // export const getNextLegRequirement = async (token) => {
// //   try {
// //     const res = await fetch(`${API_BASE}/auth/next-leg-requirement`, {
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //         "Content-Type": "application/json",
// //       },
// //     });
    
// //     if (!res.ok) throw new Error("Failed to fetch next leg requirement");
// //     return await res.json();
// //   } catch (error) {
// //     // console.error("Error fetching next leg requirement:", error);
// //     throw error;
// //   }
// // };

// // // services/authService.js

// // // services/authService.js

// // // ✅ Member Details मिळवण्यासाठी - FIXED with better error handling
// // export const getMemberDetails = async (memberId, token) => {
// //   try {
// //     // console.log("Fetching member details for:", memberId);
    
// //     // Ensure memberId is a string
// //     const id = String(memberId);
    
// //     const res = await fetch(`${API_BASE}/auth/member-details/${id}`, {
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //         "Content-Type": "application/json",
// //       },
// //     });
    
// //     const data = await res.json();
// //     // console.log("Member details response status:", res.status);
    
// //     if (!res.ok) {
// //       // console.error("Error response:", data);
// //       // Return fallback data instead of throwing
// //       return {
// //         success: false,
// //         data: {
// //           userId: memberId,
// //           totalEarnings: 0,
// //           teamCashback: 0,
// //           directReferrals: 0,
// //           totalTeam: 0,
// //           legsUnlocked: {
// //             leg1: true, leg2: false, leg3: false,
// //             leg4: false, leg5: false, leg6: false, leg7: false
// //           },
// //           recentActivity: []
// //         }
// //       };
// //     }
    
// //     return data;
// //   } catch (error) {
// //     // console.error("Error fetching member details:", error);
// //     // Return fallback data on network error
// //     return {
// //       success: false,
// //       data: {
// //         userId: memberId,
// //         totalEarnings: 0,
// //         teamCashback: 0,
// //         directReferrals: 0,
// //         totalTeam: 0,
// //         legsUnlocked: {
// //           leg1: true, leg2: false, leg3: false,
// //           leg4: false, leg5: false, leg6: false, leg7: false
// //         },
// //         recentActivity: []
// //       }
// //     };
// //   }
// // };


// // services/authService.js
// const API_BASE = "http://localhost:5000/api";
// // const API_BASE = "https://cpay-link-backend.onrender.com/api";

// const jsonHeaders = {
//   "Content-Type": "application/json",
// };

// // ========== AUTH FUNCTIONS (No changes needed) ==========
// export const login = async (userId, pin) => {
//   try {
//     const response = await fetch(`${API_BASE}/auth/login`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({ userId, pin }),
//     });
    
//     const data = await response.json();
    
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
//     const response = await fetch(`${API_BASE}/admin/login`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({ adminId, pin }),
//     });
    
//     const data = await response.json();
    
//     if (response.ok) {
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
//     return { 
//       success: false, 
//       message: error.message || "Network error" 
//     };
//   }
// };

// export const register = async (userData) => {
//   try {
//     const response = await fetch(`${API_BASE}/auth/register`, {
//       method: 'POST',
//       headers: jsonHeaders,
//       body: JSON.stringify(userData)
//     });
    
//     const data = await response.json();
    
//     if (response.ok) {
//       if (data.token) {
//         localStorage.setItem("token", data.token);
//       }
//       if (data.user) {
//         localStorage.setItem("user", JSON.stringify(data.user));
//       }
      
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
//     return { activated: false };
//   }
// };

// export const getTodayTeamStats = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/transactions/today-team-stats`, {
//       headers: { "Authorization": `Bearer ${token}` }
//     });
//     const data = await res.json();
//     return data;
//   } catch (error) {
//     return { 
//       success: false, 
//       teamBusiness: 0, 
//       yourCommission: 0, 
//       teamMembers: 0 
//     };
//   }
// };

// // ========== HELPER FUNCTIONS FOR LEVEL REQUIREMENTS ==========

// /**
//  * Get horizontal requirement for a level (min direct referrals needed)
//  */
// export const getHorizontalRequirement = (level) => {
//   if (level <= 3) return 1;
//   if (level <= 6) return 2;
//   if (level <= 9) return 3;
//   if (level <= 12) return 4;
//   if (level <= 15) return 5;
//   if (level <= 18) return 6;
//   return 7;
// };

// /**
//  * Get required previous levels for a given level
//  */
// export const getRequiredLevels = (level) => {
//   const requirements = {
//     4: [1, 2, 3],
//     5: [2, 3, 4],
//     6: [3, 4, 5],
//     7: [4, 5, 6],
//     8: [5, 6, 7],
//     9: [6, 7, 8],
//     10: [7, 8, 9],
//     11: [8, 9, 10],
//     12: [9, 10, 11],
//     13: [10, 11, 12],
//     14: [11, 12, 13],
//     15: [12, 13, 14],
//     16: [13, 14, 15],
//     17: [14, 15, 16],
//     18: [15, 16, 17],
//     19: [16, 17, 18],
//     20: [17, 18, 19],
//     21: [18, 19, 20]
//   };
//   return requirements[level] || [];
// };

// // ========== COMPLETE UPDATED DYNAMIC LEGS FUNCTIONS ==========

// /**
//  * Get Leg Unlocking Status with Horizontal & Vertical Requirements
//  */
// export const getLegUnlockingStatus = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/leg-status`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     if (!res.ok) throw new Error("Failed to fetch leg status");
//     const data = await res.json();
    
//     return data.data || data;
//   } catch (error) {
//     console.error("Error fetching leg status:", error);
//     return {
//       success: false,
//       data: {
//         userId: 'Unknown',
//         directReferrals: 0,
//         totalLegs: 0,
//         activeLegs: 0,
//         levelAccessibility: {},
//         legDetails: {},
//         missedCommissions: { totalMissed: 0, unreadCount: 0, recent: [] },
//         summary: 'Unable to fetch leg status'
//       }
//     };
//   }
// };

// /**
//  * Get Next Level Requirement with Progress Tracking
//  */
// export const getNextLevelRequirement = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/next-level-requirement`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     if (!res.ok) throw new Error("Failed to fetch next level requirement");
//     const data = await res.json();
    
//     return data.data || data;
//   } catch (error) {
//     console.error("Error fetching next level requirement:", error);
//     return {
//       success: false,
//       data: {
//         userId: 'Unknown',
//         directReferrals: 0,
//         totalLegs: 0,
//         activeLegs: 0,
//         nextLevelToUnlock: null,
//         summary: 'Unable to fetch next level requirement'
//       }
//     };
//   }
// };

// /**
//  * Get Missed Commissions
//  */
// export const getMissedCommissions = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/missed-commissions`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     if (!res.ok) throw new Error("Failed to fetch missed commissions");
//     const data = await res.json();
    
//     return data.data || data;
//   } catch (error) {
//     console.error("Error fetching missed commissions:", error);
//     return {
//       success: false,
//       data: {
//         totalMissed: 0,
//         unreadCount: 0,
//         recent: []
//       }
//     };
//   }
// };

// /**
//  * Mark Missed Commissions as Read
//  */
// export const markMissedCommissionsAsRead = async (token, commissionIds = []) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/missed-commissions/read`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ commissionIds })
//     });
    
//     if (!res.ok) throw new Error("Failed to mark commissions as read");
//     const data = await res.json();
    
//     return data;
//   } catch (error) {
//     console.error("Error marking commissions as read:", error);
//     return {
//       success: false,
//       message: error.message
//     };
//   }
// };

// /**
//  * Get FOMO Notifications
//  */
// export const getFomoNotifications = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/fomo-notifications`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     if (!res.ok) throw new Error("Failed to fetch FOMO notifications");
//     const data = await res.json();
    
//     return data.data || data;
//   } catch (error) {
//     console.error("Error fetching FOMO notifications:", error);
//     return {
//       success: false,
//       data: {
//         total: 0,
//         notifications: []
//       }
//     };
//   }
// };

// /**
//  * Get Member Details with Complete Information
//  */
// export const getMemberDetails = async (memberId, token) => {
//   try {
//     const id = String(memberId);
    
//     const res = await fetch(`${API_BASE}/auth/member-details/${id}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     const data = await res.json();
    
//     if (!res.ok) {
//       return {
//         success: false,
//         data: {
//           userId: memberId,
//           totalEarnings: 0,
//           teamCashback: 0,
//           directReferrals: 0,
//           totalTeam: 0,
//           totalLegs: 0,
//           activeLegs: 0,
//           levelAccessibility: {},
//           levelEarnings: {},
//           downlineCount: {},
//           legsStatus: {},
//           missedCommissions: { totalMissed: 0, unreadCount: 0, recent: [] },
//           recentActivity: []
//         }
//       };
//     }
    
//     return data;
//   } catch (error) {
//     console.error("Error fetching member details:", error);
//     return {
//       success: false,
//       data: {
//         userId: memberId,
//         totalEarnings: 0,
//         teamCashback: 0,
//         directReferrals: 0,
//         totalTeam: 0,
//         totalLegs: 0,
//         activeLegs: 0,
//         levelAccessibility: {},
//         levelEarnings: {},
//         downlineCount: {},
//         legsStatus: {},
//         missedCommissions: { totalMissed: 0, unreadCount: 0, recent: [] },
//         recentActivity: []
//       }
//     };
//   }
// };

// /**
//  * Get Team Summary with Missed Commissions
//  */
// export const getTeamSummary = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/team-summary`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     if (!res.ok) throw new Error("Failed to fetch team summary");
//     const data = await res.json();
    
//     return data.data || data;
//   } catch (error) {
//     console.error("Error fetching team summary:", error);
//     return {
//       success: false,
//       data: {
//         totalLegs: 0,
//         directReferrals: 0,
//         totalTeam: 0,
//         earningsByLevel: {},
//         levels: {},
//         missedCommissions: { totalMissed: 0, unreadCount: 0, recent: [] }
//       }
//     };
//   }
// };

// /**
//  * Get Leg Breakdown with Active Status
//  */
// export const getLegBreakdown = async (token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/leg-breakdown`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     if (!res.ok) throw new Error("Failed to fetch leg breakdown");
//     const data = await res.json();
    
//     return data.data || data;
//   } catch (error) {
//     console.error("Error fetching leg breakdown:", error);
//     return {
//       success: false,
//       data: {
//         totalLegs: 0,
//         directReferrals: 0,
//         legs: []
//       }
//     };
//   }
// };

// /**
//  * Get Users at Specific Level
//  */
// export const getLevelUsers = async (level, token) => {
//   try {
//     const res = await fetch(`${API_BASE}/auth/level-users/${level}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     if (!res.ok) throw new Error("Failed to fetch level users");
//     const data = await res.json();
    
//     return data.data || data;
//   } catch (error) {
//     console.error(`Error fetching users at level ${level}:`, error);
//     return {
//       success: false,
//       data: {
//         level: level,
//         isAccessible: false,
//         requiredDirects: 0,
//         currentDirects: 0,
//         totalUsers: 0,
//         users: []
//       }
//     };
//   }
// };

// // ========== HELPER FUNCTIONS ==========

// /**
//  * Calculate Level Progress with Horizontal Requirements
//  */
// export const calculateLevelProgress = (levelAccessibility, targetLevel, directReferrals = 0) => {
//   const requiredVertical = getRequiredLevels(targetLevel);
//   const requiredHorizontal = getHorizontalRequirement(targetLevel);
  
//   // Check vertical progress
//   let completedVertical = 0;
//   for (const level of requiredVertical) {
//     if (levelAccessibility[`level${level}`]?.usersCount > 0) {
//       completedVertical++;
//     }
//   }
  
//   // Check horizontal progress
//   const horizontalProgress = {
//     required: requiredHorizontal,
//     current: directReferrals,
//     remaining: Math.max(0, requiredHorizontal - directReferrals),
//     isComplete: directReferrals >= requiredHorizontal
//   };
  
//   return {
//     level: targetLevel,
//     vertical: {
//       required: requiredVertical,
//       completed: completedVertical,
//       remaining: requiredVertical.length - completedVertical,
//       percentage: requiredVertical.length > 0 ? (completedVertical / requiredVertical.length) * 100 : 100,
//       isComplete: completedVertical === requiredVertical.length
//     },
//     horizontal: horizontalProgress,
//     isCompletelyUnlockable: (completedVertical === requiredVertical.length) && (directReferrals >= requiredHorizontal)
//   };
// };

// /**
//  * Format Leg Data with Active Status
//  */
// export const formatLegData = (legStatus) => {
//   if (!legStatus) return null;
  
//   const formatted = {
//     userId: legStatus.userId,
//     directReferrals: legStatus.directReferrals || 0,
//     totalLegs: legStatus.totalLegs || 0,
//     activeLegs: legStatus.activeLegs || 0,
//     summary: legStatus.summary || '',
//     missedCommissions: legStatus.missedCommissions || { totalMissed: 0, unreadCount: 0, recent: [] },
//     legs: [],
//     levels: []
//   };
  
//   // Format legs for display
//   if (legStatus.legDetails) {
//     formatted.legs = Object.entries(legStatus.legDetails).map(([legKey, leg]) => {
//       const levelsUnlocked = Object.values(leg.levels || {}).filter(l => l.isUnlocked).length;
      
//       return {
//         legNumber: leg.legNumber,
//         legKey: legKey,
//         isActive: leg.isActive !== false, // सगळ्या legs active
//         totalUsers: leg.totalUsers || 0,
//         totalEarnings: leg.totalEarnings || 0,
//         levelsUnlocked,
//         isFullyUnlocked: levelsUnlocked === 21,
//         levels: leg.levels || {}
//       };
//     }).sort((a, b) => a.legNumber - b.legNumber);
//   }
  
//   // Format levels for display
//   if (legStatus.levelAccessibility) {
//     for (let level = 1; level <= 21; level++) {
//       const levelKey = `level${level}`;
//       const levelData = legStatus.levelAccessibility[levelKey] || {};
//       const requiredLevels = getRequiredLevels(level);
//       const requiredDirects = getHorizontalRequirement(level);
      
//       formatted.levels.push({
//         level: level,
//         isAccessible: levelData.isAccessible || false,
//         usersCount: levelData.usersCount || 0,
//         requiredLevels: requiredLevels,
//         minDirectsNeeded: requiredDirects,
//         currentDirects: levelData.currentDirects || 0,
//         meetsHorizontal: levelData.meetsHorizontal || false,
//         unlockedLegs: levelData.unlockedLegs || 0,
//         legWiseUsers: levelData.legWiseUsers || {}
//       });
//     }
//   }
  
//   return formatted;
// };

// /**
//  * Format FOMO Notifications
//  */
// export const formatFomoNotifications = (notifications) => {
//   if (!notifications || !notifications.notifications) return [];
  
//   return notifications.notifications.map(notif => ({
//     id: notif.id,
//     title: notif.title,
//     message: notif.message,
//     amount: notif.amount,
//     level: notif.level,
//     legNumber: notif.legNumber,
//     reason: notif.reason,
//     date: new Date(notif.date).toLocaleString(),
//     read: notif.read
//   }));
// };

// /**
//  * Get Level Requirements Summary
//  */
// export const getLevelRequirementsSummary = () => {
//   const summary = [];
  
//   for (let level = 1; level <= 21; level++) {
//     const requiredDirects = getHorizontalRequirement(level);
//     const requiredLevels = getRequiredLevels(level);
    
//     let description = "";
//     if (level <= 3) {
//       description = "Always unlocked";
//     } else {
//       description = `Need ${requiredDirects} direct referrals and levels ${requiredLevels.join(', ')}`;
//     }
    
//     summary.push({
//       level,
//       requiredDirects,
//       requiredLevels,
//       description
//     });
//   }
  
//   return summary;
// };

// /**
//  * Get Leg-wise Level Status
//  */
// export const getLegWiseLevelStatus = (legStatus, legNumber) => {
//   if (!legStatus || !legStatus.legDetails || !legStatus.legDetails[`leg${legNumber}`]) {
//     return [];
//   }
  
//   const leg = legStatus.legDetails[`leg${legNumber}`];
//   const status = [];
  
//   for (let level = 1; level <= 21; level++) {
//     const levelData = leg.levels?.[`level${level}`] || {};
//     const requiredDirects = getHorizontalRequirement(level);
//     const requiredLevels = getRequiredLevels(level);
    
//     status.push({
//       level,
//       users: levelData.users || 0,
//       isUnlocked: levelData.isUnlocked || level <= 3,
//       earnings: levelData.earnings || 0,
//       requiredDirects,
//       requiredLevels,
//       meetsHorizontal: legStatus.directReferrals >= requiredDirects
//     });
//   }
  
//   return status;
// };


// services/authService.js
// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-link-backend.onrender.com/api";

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
    const res = await fetch(`${API_BASE}/wallet/team-cashback`, {
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
    const res = await fetch(`${API_BASE}/transactions/today-team-stats`, {
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

// ========== SIMPLIFIED: GET MEMBER DETAILS ==========
export const getMemberDetails = async (memberId, token) => {
  try {
    const id = String(memberId);
    
    const res = await fetch(`${API_BASE}/auth/member-details/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
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
  getUnlockProgress
};