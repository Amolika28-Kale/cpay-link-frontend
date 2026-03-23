import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

// Helper function to format Indian currency without Unicode issues
const formatIndianCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rs. 0';
  const num = Number(amount);
  if (isNaN(num)) return 'Rs. 0';
  
  // Format with Indian number system without ₹ symbol
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
  
  return `Rs. ${formatted}`;
};

// Helper function to format number without currency
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  const number = Number(num);
  if (isNaN(number)) return '0';
  return new Intl.NumberFormat('en-IN').format(number);
};

// Helper function to format decimal numbers without currency symbol
const formatDecimal = (num, decimals = 2) => {
  if (!num && num !== 0) return '0';
  const number = Number(num);
  if (isNaN(number)) return '0';
  return number.toFixed(decimals);
};

// Helper function to calculate team count
const calculateTeamCount = (user) => {
  if (!user) return 0;
  if (user.legs?.length > 0) {
    return user.legs.reduce((total, leg) => total + (leg.stats?.totalUsers || 0), 0);
  }
  let count = 0;
  for (let i = 1; i <= 21; i++) {
    count += user.referralTree?.[`level${i}`]?.length || 0;
  }
  return count;
};

// Export to Excel
export const exportToExcel = (users, filename = 'users_export') => {
  const excelData = users.map(user => ({
    'User ID': user.userId?.toString() || '',
    'Email': user.email || '',
    'Referral Code': user.referralCode || '',
    'Referred By': user.referredBy?.userId || 'None',
    'Joined Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '',
    'Direct Referrals': user.legs?.length || 0,
    'Total Team': calculateTeamCount(user),
    'Total Earnings': (user.legs?.reduce((sum, leg) => sum + (leg.stats?.totalEarnings || 0), 0) || 0).toFixed(2),
    'Team Cashback': (user.legs?.reduce((sum, leg) => sum + (leg.stats?.totalTeamCashback || 0), 0) || 0).toFixed(2),
    'USDT Balance': (user.wallets?.USDT || 0).toFixed(2),
    'INR Balance': (user.wallets?.INR || 0).toFixed(2),
    'CASHBACK Balance': (user.wallets?.CASHBACK || 0).toFixed(2),
    'Pay Requests Created': user.totalPayRequests || 0,
    'Pay Requests Accepted': user.totalAcceptedRequests || 0,
    'Pending Requests': ((user.totalPayRequests || 0) - (user.totalAcceptedRequests || 0)),
    'Wallet Activated': user.walletActivated ? 'Yes' : 'No',
    'Daily Accept Limit': user.dailyAcceptLimit || 0,
    'Activation Expiry': user.activationExpiryDate ? new Date(user.activationExpiryDate).toLocaleDateString('en-IN') : 'N/A'
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx`);
};

// Export to PDF (All Users)
export const exportToPDF = (users, filename = 'users_export') => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('User Details Report(CpayLink)', 14, 15);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 22);
  doc.text(`Total Users: ${users.length}`, 14, 28);
  
  // Prepare table data with proper formatting
  const tableData = users.map(user => {
    const earnings = user.legs?.reduce((sum, leg) => sum + (leg.stats?.totalEarnings || 0), 0) || 0;
    const cashback = user.legs?.reduce((sum, leg) => sum + (leg.stats?.totalTeamCashback || 0), 0) || 0;
    const inrBalance = user.wallets?.INR || 0;
    
    return [
      (user.userId?.toString() || '').slice(0, 12),
      (user.email?.split('@')[0] || '').slice(0, 12),
      user.referralCode || '',
      (user.legs?.length || 0).toString(),
      calculateTeamCount(user).toString(),
      earnings.toFixed(2),
      cashback.toFixed(2),
      inrBalance.toFixed(2),
      (user.totalPayRequests || 0).toString(),
      (user.totalAcceptedRequests || 0).toString(),
      user.walletActivated ? 'Yes' : 'No'
    ];
  });

  const columns = ['User ID', 'Email', 'Referral', 'Dir', 'Team', 'Earnings', 'Cashback', 'INR Bal', 'Pay', 'Acc', 'Active'];

  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 2,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 22 },
      2: { cellWidth: 18 },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 18, halign: 'right' },
      8: { cellWidth: 10, halign: 'center' },
      9: { cellWidth: 10, halign: 'center' },
      10: { cellWidth: 12, halign: 'center' }
    },
    margin: { top: 35, left: 8, right: 8 },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${pageCount}`,
        doc.internal.pageSize.getWidth() - 15,
        doc.internal.pageSize.getHeight() - 8
      );
    }
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.pdf`);
};

// Export single user details to PDF
export const exportSingleUserToPDF = (user) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('User Details Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);
  
  // User Basic Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('User Information', 14, 40);
  
  // Basic Info Table
  autoTable(doc, {
    startY: 45,
    head: [['Field', 'Value']],
    body: [
      ['User ID', user.userId?.toString() || 'N/A'],
      ['Email', user.email || 'N/A'],
      ['Referral Code', user.referralCode || 'N/A'],
      ['Referred By', user.referredBy?.userId || 'None'],
      ['Joined Date', user.createdAt ? new Date(user.createdAt).toLocaleString('en-IN') : 'N/A'],
      ['Wallet Activated', user.walletActivated ? 'Yes' : 'No'],
      ...(user.walletActivated ? [
        ['Daily Accept Limit', `Rs. ${formatNumber(user.dailyAcceptLimit || 0)}`],
        ['Activation Expiry', user.activationExpiryDate ? new Date(user.activationExpiryDate).toLocaleDateString('en-IN') : 'N/A']
      ] : [])
    ],
    theme: 'striped',
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 130 }
    }
  });
  
  let yPosition = doc.lastAutoTable.finalY + 10;
  
  // Wallet Balances
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Wallet Balances', 14, yPosition);
  
  autoTable(doc, {
    startY: yPosition + 5,
    head: [['Currency', 'Balance']],
    body: [
      ['USDT', `${formatDecimal(user.wallets?.USDT, 2)} USDT`],
      ['INR', `Rs. ${formatDecimal(user.wallets?.INR, 2)}`],
      ['CASHBACK', `Rs. ${formatDecimal(user.wallets?.CASHBACK, 2)}`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 130, halign: 'right' }
    }
  });
  
  yPosition = doc.lastAutoTable.finalY + 10;
  
  // Statistics
  const directCount = user.legs?.length || 0;
  const teamCount = calculateTeamCount(user);
  const totalEarnings = user.legs?.reduce((sum, leg) => sum + (leg.stats?.totalEarnings || 0), 0) || 0;
  const totalCashback = user.legs?.reduce((sum, leg) => sum + (leg.stats?.totalTeamCashback || 0), 0) || 0;
  const pendingRequests = (user.totalPayRequests || 0) - (user.totalAcceptedRequests || 0);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Statistics', 14, yPosition);
  
  autoTable(doc, {
    startY: yPosition + 5,
    head: [['Metric', 'Value']],
    body: [
      ['Direct Referrals', formatNumber(directCount)],
      ['Total Team Members', formatNumber(teamCount)],
      ['Total Earnings', `Rs. ${formatDecimal(totalEarnings, 2)}`],
      ['Team Cashback', `Rs. ${formatDecimal(totalCashback, 2)}`],
      ['Pay Requests Created', formatNumber(user.totalPayRequests || 0)],
      ['Pay Requests Accepted', formatNumber(user.totalAcceptedRequests || 0)],
      ['Pending Requests', formatNumber(pendingRequests)],
      ['Success Rate', user.totalPayRequests > 0 ? `${((user.totalAcceptedRequests / user.totalPayRequests) * 100).toFixed(1)}%` : '0%']
    ],
    theme: 'striped',
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 110, halign: 'right' }
    }
  });
  
  yPosition = doc.lastAutoTable.finalY + 10;
  
  // Legs/Referrals Summary
  if (user.legs && user.legs.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Direct Referrals Summary', 14, yPosition);
    
    const legsData = user.legs.map(leg => [
      `Leg ${leg.legNumber}`,
      formatNumber(leg.stats?.totalUsers || 0),
      `Rs. ${formatDecimal(leg.stats?.totalEarnings || 0, 2)}`,
      leg.isActive ? 'Active' : 'Inactive'
    ]);
    
    autoTable(doc, {
      startY: yPosition + 5,
      head: [['Direct Leg', 'Team Size', 'Earnings', 'Status']],
      body: legsData,
      theme: 'striped',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 55, halign: 'right' },
        3: { cellWidth: 35, halign: 'center' }
      }
    });
  }
  
  // Save PDF
  const safeFilename = `user_${user.userId || user._id}_details`.replace(/[^a-z0-9]/gi, '_');
  doc.save(`${safeFilename}_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.pdf`);
};