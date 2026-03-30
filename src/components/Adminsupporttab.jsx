// ============================================================
// AdminDashboard.jsx मध्ये खालील 3 steps करा:
// ============================================================
//
// STEP 1: imports मध्ये हे add करा (top of file)
//   import { LifeBuoy } from "lucide-react";
//
// STEP 2: Sidebar nav मध्ये Ledger SidebarLink नंतर हे add करा:
//
//   <SidebarLink
//     icon={<LifeBuoy size={18}/>}
//     label="Support"
//     badge={supportUnread}
//     active={activeTab === "Support"}
//     onClick={() => {setActiveTab("Support"); setIsSidebarOpen(false);}}
//     highlight={supportUnread > 0}
//   />
//
// STEP 3: state declarations मध्ये हे add करा:
//   const [supportUnread, setSupportUnread] = useState(0);
//
// STEP 4: loadData function मध्ये शेवटी हे add करा:
//   // fetch support unread count
//   try {
//     const token = localStorage.getItem("token");
//     const res = await fetch(`${API_BASE}/support/admin/all?status=open&limit=1`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     const d = await res.json();
//     if (d.success) setSupportUnread(d.data.total || 0);
//   } catch(e) {}
//
// STEP 5: main content area मध्ये Ledger tab के बाद हे add करा:
//   {activeTab === "Support" && (
//     <SupportView />
//   )}
//
// ============================================================
// PASTE THIS ENTIRE COMPONENT AT THE BOTTOM OF AdminDashboard.jsx
// (before the last closing line / export)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy, Search, RefreshCw, Send, Image as ImageIcon,
  Clock, CheckCircle, AlertCircle, XCircle,
  ChevronDown, ChevronUp, Shield, X, Loader2,
  Download, Eye, Filter, User, Calendar, MessageSquare
} from 'lucide-react';

// const SUPPORT_API = "http://localhost:5000/api";
const SUPPORT_API = "https://cpay-link-backend.onrender.com/api";

const S_STATUS = {
  open:        { label:'Open',        c:'text-amber-400',   bg:'bg-amber-500/12',   b:'border-amber-500/25',   Icon: AlertCircle },
  in_progress: { label:'In Progress', c:'text-sky-400',     bg:'bg-sky-500/12',     b:'border-sky-500/25',     Icon: Clock },
  resolved:    { label:'Resolved',    c:'text-emerald-400', bg:'bg-emerald-500/12', b:'border-emerald-500/25', Icon: CheckCircle },
  closed:      { label:'Closed',      c:'text-gray-400',    bg:'bg-gray-500/12',    b:'border-gray-500/25',    Icon: XCircle },
};

const S_CATS = {
  general:'🔧 General', payment:'💳 Payment', wallet:'👛 Wallet',
  referral:'🌐 Referral', withdrawal:'💰 Withdrawal', account:'👤 Account',
};

const SupportView = () => {
  const [queries, setQueries]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [expandedId, setExpandedId]   = useState(null);
  const [replyTexts, setReplyTexts]   = useState({});
  const [sendingId, setSendingId]     = useState(null);
  const [screenshot, setScreenshot]   = useState(null); // modal URL
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [catFilter, setCatFilter]     = useState('all');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [activeTab, setActiveTab]     = useState('queries'); // 'queries' | 'analytics'

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (catFilter !== 'all') params.append('category', catFilter);
      const res = await fetch(`${SUPPORT_API}/support/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setQueries(data.data.queries);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter, catFilter, page]);

  useEffect(() => { fetchQueries(); }, [fetchQueries]);

  const handleReply = async (queryId, newStatus) => {
    const msg = replyTexts[queryId]?.trim();
    if (!msg) return;
    setSendingId(queryId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${SUPPORT_API}/support/admin/reply/${queryId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setReplyTexts(p => ({ ...p, [queryId]: '' }));
        fetchQueries();
      }
    } catch (e) { console.error(e); }
    finally { setSendingId(null); }
  };

  const handleStatus = async (queryId, status) => {
    const token = localStorage.getItem('token');
    await fetch(`${SUPPORT_API}/support/admin/status/${queryId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchQueries();
  };

  // client-side search filter
  const displayed = queries.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return q.queryId?.toLowerCase().includes(s) ||
      q.subject?.toLowerCase().includes(s) ||
      q.userDbId?.toLowerCase().includes(s);
  });

  // analytics
  const counts     = queries.reduce((a, q) => { a[q.status] = (a[q.status]||0)+1; return a; }, {});
  const catCounts  = queries.reduce((a, q) => { a[q.category] = (a[q.category]||0)+1; return a; }, {});
  const unresponded = queries.filter(q => !q.replies?.some(r => r.from==='admin')).length;
  const avgReplies  = queries.length
    ? (queries.reduce((a,q)=>a+(q.replies?.length||0),0)/queries.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic flex items-center gap-2">
            <LifeBuoy size={24} className="text-[#00F5A0]" /> Support Queries
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{total} total tickets</p>
        </div>
        <button onClick={fetchQueries}
          className="bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 rounded-xl transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin text-[#00F5A0]' : 'text-gray-400'} />
        </button>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 bg-black/40 border border-white/8 p-1 rounded-xl w-fit">
        {[['queries','Queries'],['analytics','Analytics']].map(([k,l])=>(
          <button key={k} onClick={()=>setActiveTab(k)}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab===k?'bg-[#00F5A0] text-black':'text-gray-500 hover:text-gray-300'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:'Total Tickets',  val: total,         c:'text-white' },
              { label:'Needs Reply',    val: unresponded,   c:'text-amber-400' },
              { label:'Resolved',       val: counts.resolved||0, c:'text-emerald-400' },
              { label:'Avg Replies',    val: avgReplies,    c:'text-sky-400' },
            ].map((k,i)=>(
              <div key={i} className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-4">
                <p className={`text-2xl font-black italic ${k.c}`}>{k.val}</p>
                <p className="text-xs font-bold text-white mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Status bars */}
          <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-5">
            <h3 className="font-black italic text-sm mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(S_STATUS).map(([k,s])=>{
                const cnt = counts[k]||0;
                const pct = total>0?(cnt/total)*100:0;
                const SIcon = s.Icon;
                return(
                  <div key={k}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <SIcon size={12} className={s.c}/>
                        <span className="text-xs text-gray-400">{s.label}</span>
                      </div>
                      <span className={`text-xs font-black ${s.c}`}>{cnt}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${
                        k==='open'?'bg-amber-400':k==='in_progress'?'bg-sky-400':k==='resolved'?'bg-emerald-400':'bg-gray-500'
                      }`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-[#0A1F1A] border border-white/10 rounded-2xl p-5">
            <h3 className="font-black italic text-sm mb-4">By Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(S_CATS).map(([k,v])=>(
                <div key={k} className="bg-black/40 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{v}</span>
                  <span className="text-sm font-black text-white">{catCounts[k]||0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── QUERIES LIST ── */}
      {activeTab === 'queries' && (
        <div className="space-y-4">

          {/* Status chips */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
            {[['all','All',total],...Object.entries(S_STATUS).map(([k,s])=>[k,s.label,counts[k]||0])].map(([k,l,c])=>(
              <button key={k}
                onClick={()=>{ setStatusFilter(k); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black border transition-all ${
                  statusFilter===k
                    ?'bg-[#00F5A0] text-black border-[#00F5A0]'
                    :'bg-black/40 border-white/8 text-gray-400 hover:border-white/15'
                }`}>
                {l}
                {Number(c)>0 && <span className={`ml-1.5 text-[8px] ${statusFilter===k?'opacity-60':'text-gray-600'}`}>{c}</span>}
              </button>
            ))}
          </div>

          {/* Search + category */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-48 bg-black/40 border border-white/8 rounded-xl flex items-center gap-2 px-3 py-2.5">
              <Search size={14} className="text-gray-600 flex-shrink-0"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Query ID, subject, or User ID..."
                className="flex-1 bg-transparent text-sm outline-none placeholder-gray-600"/>
              {search && <button onClick={()=>setSearch('')}><X size={12} className="text-gray-600"/></button>}
            </div>
            <select value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1);}}
              className="bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-xs text-gray-400 outline-none">
              <option value="all">All Categories</option>
              {Object.entries(S_CATS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#00F5A0]"/>
            </div>
          )}

          {/* Empty */}
          {!loading && displayed.length===0 && (
            <div className="text-center py-16 bg-[#0A1F1A] border border-white/8 rounded-2xl">
              <MessageSquare size={36} className="mx-auto text-gray-700 mb-3"/>
              <p className="text-gray-500 text-sm">No queries found</p>
            </div>
          )}

          {/* Query cards */}
          {!loading && displayed.map(q=>{
            const s = S_STATUS[q.status]||S_STATUS.open;
            const SIcon = s.Icon;
            const isExp = expandedId===q._id;
            const noAdminReply = !q.replies?.some(r=>r.from==='admin');

            return(
              <div key={q._id}
                className={`bg-[#0A1F1A] border rounded-2xl overflow-hidden transition-all ${
                  noAdminReply?'border-amber-500/20':'border-white/8 hover:border-white/14'
                }`}>

                {/* Header row */}
                <div className="p-4 cursor-pointer" onClick={()=>setExpandedId(isExp?null:q._id)}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-9 h-9 rounded-xl ${s.bg} border ${s.b} flex items-center justify-center flex-shrink-0`}>
                      <SIcon size={15} className={s.c}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[9px] font-mono text-[#00F5A0] bg-[#00F5A0]/10 px-1.5 py-0.5 rounded">#{q.queryId}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${s.bg} ${s.b} ${s.c}`}>
                          <SIcon size={9}/>{s.label}
                        </span>
                        <span className="text-[9px] text-gray-600 bg-white/4 px-1.5 py-0.5 rounded">{S_CATS[q.category]||q.category}</span>
                        {noAdminReply && (
                          <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-black">⚡ Needs Reply</span>
                        )}
                        {q.screenshotPath && (
                          <span className="text-[9px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <ImageIcon size={9}/>Screenshot
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-white truncate">{q.subject}</p>
                      <div className="flex items-center gap-3 mt-1 text-[9px] text-gray-600">
                        <span className="flex items-center gap-1"><User size={8}/>{q.userDbId||'Unknown'}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={8}/>{q.replies?.length||0} replies</span>
                        <span className="flex items-center gap-1"><Calendar size={8}/>{new Date(q.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    {isExp
                      ? <ChevronUp size={16} className="text-[#00F5A0] flex-shrink-0"/>
                      : <ChevronDown size={16} className="text-gray-600 flex-shrink-0"/>
                    }
                  </div>
                </div>

                {/* Expanded body */}
                {isExp && (
                  <div className="border-t border-white/5 p-4 space-y-4">

                    {/* User description */}
                    <div className="bg-black/40 rounded-xl p-3">
                      <p className="text-[9px] text-gray-600 mb-2 uppercase tracking-wider">User's Description</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{q.description}</p>
                    </div>

                    {/* Screenshot */}
                    {q.screenshotPath && (
                      <div>
                        <p className="text-[9px] text-gray-600 mb-2 uppercase tracking-wider flex items-center gap-1">
                          <ImageIcon size={9}/>Screenshot
                        </p>
                        <div className="relative inline-block">
                          <img
                            src={`${SUPPORT_API}/support/screenshot/${q.screenshotPath.split('/').pop()}`}
                            className="max-h-48 rounded-xl border border-white/8 cursor-pointer hover:opacity-85 transition-all"
                            onClick={()=>setScreenshot(`${SUPPORT_API}/support/screenshot/${q.screenshotPath.split('/').pop()}`)}
                          />
                          <button
                            onClick={()=>setScreenshot(`${SUPPORT_API}/support/screenshot/${q.screenshotPath.split('/').pop()}`)}
                            className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-lg flex items-center gap-1 text-[9px] hover:bg-black/90">
                            <Eye size={10}/>View
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Conversation thread */}
                    {q.replies?.length>0 && (
                      <div className="space-y-2">
                        <p className="text-[9px] text-gray-600 uppercase tracking-wider">Conversation</p>
                        {q.replies.map((r,i)=>(
                          <div key={i} className={`flex ${r.from==='admin'?'justify-end':'justify-start'}`}>
                            {r.from!=='admin' && (
                              <div className="w-6 h-6 rounded-lg bg-sky-500/15 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                                <User size={11} className="text-sky-400"/>
                              </div>
                            )}
                            <div className={`max-w-[80%] px-3 py-2.5 rounded-xl text-sm ${
                              r.from==='admin'
                                ?'bg-[#00F5A0]/10 border border-[#00F5A0]/20'
                                :'bg-white/5 border border-white/8'
                            }`}>
                              <p className={`text-[9px] font-black mb-1 ${r.from==='admin'?'text-[#00F5A0]':'text-sky-400'}`}>
                                {r.from==='admin'?`👨‍💼 ${r.adminName||'Admin'}`:`👤 ${q.userDbId}`}
                              </p>
                              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{r.message}</p>
                              <p className="text-[8px] text-gray-600 mt-1.5">
                                {new Date(r.createdAt).toLocaleString('en-IN')}
                              </p>
                            </div>
                            {r.from==='admin' && (
                              <div className="w-6 h-6 rounded-lg bg-[#00F5A0]/15 flex items-center justify-center ml-2 mt-0.5 flex-shrink-0">
                                <Shield size={11} className="text-[#00F5A0]"/>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status buttons */}
                    <div>
                      <p className="text-[9px] text-gray-600 mb-2 uppercase tracking-wider">Update Status</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(S_STATUS).map(([k,s])=>{
                          const SIcon=s.Icon;
                          return(
                            <button key={k} onClick={()=>handleStatus(q._id,k)}
                              className={`text-[10px] px-3 py-1.5 rounded-xl border font-black transition-all flex items-center gap-1 ${
                                q.status===k?`${s.bg} ${s.b} ${s.c}`:'bg-white/3 border-white/8 text-gray-500 hover:border-white/15'
                              }`}>
                              <SIcon size={10}/>{s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reply box */}
                    <div className="bg-black/40 border border-white/8 rounded-xl p-3 space-y-3">
                      <p className="text-[9px] text-gray-600 uppercase tracking-wider flex items-center gap-1">
                        <Send size={9}/>Reply to User
                      </p>
                      <textarea
                        value={replyTexts[q._id]||''}
                        onChange={e=>setReplyTexts(p=>({...p,[q._id]:e.target.value}))}
                        placeholder="Type your reply to the user..."
                        rows={3}
                        className="w-full bg-black/40 border border-white/6 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00F5A0]/40 placeholder-gray-700 resize-none transition-all"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={()=>handleReply(q._id,'in_progress')}
                          disabled={sendingId===q._id||!replyTexts[q._id]?.trim()}
                          className="text-xs px-4 py-2 bg-sky-500/12 border border-sky-500/25 text-sky-400 rounded-xl font-black hover:bg-sky-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          Reply → In Progress
                        </button>
                        <button
                          onClick={()=>handleReply(q._id,'resolved')}
                          disabled={sendingId===q._id||!replyTexts[q._id]?.trim()}
                          className="text-xs px-4 py-2 bg-[#00F5A0]/12 border border-[#00F5A0]/25 text-[#00F5A0] rounded-xl font-black hover:bg-[#00F5A0]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          {sendingId===q._id?'⏳ Sending...':'✅ Reply & Resolve'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages>1 && (
            <div className="flex justify-center gap-2 pt-2">
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                    page===p?'bg-[#00F5A0] text-black':'bg-white/5 border border-white/8 text-gray-500 hover:text-gray-300'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Screenshot full-view modal */}
      {screenshot && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[500] p-4"
          onClick={()=>setScreenshot(null)}>
          <div className="relative max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-400 font-mono">Screenshot</span>
              <div className="flex gap-2">
                <a href={screenshot} download target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all">
                  <Download size={12}/>Download
                </a>
                <button onClick={()=>setScreenshot(null)} className="text-gray-500 hover:text-white p-1.5">
                  <X size={18}/>
                </button>
              </div>
            </div>
            <img src={screenshot} className="w-full rounded-2xl border border-white/8"/>
          </div>
        </div>
      )}
    </div>
  );
};

export { SupportView };
// export default SupportView;