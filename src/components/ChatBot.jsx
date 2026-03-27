import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, X, Send, Bot, ArrowLeft, Plus, Bell,
  Clock, CheckCircle, AlertCircle, XCircle, ChevronRight,
  Loader, MessageSquare, Shield, Paperclip, LifeBuoy
} from 'lucide-react';

// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://cpay-link-backend-production.up.railway.app/api";
const authH = (t) => ({ Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' });

const STATUS = {
  open:        { label: 'Open',        c: 'text-amber-400',   bg: 'bg-amber-500/15',   b: 'border-amber-500/30',   Icon: AlertCircle },
  in_progress: { label: 'In Progress', c: 'text-sky-400',     bg: 'bg-sky-500/15',     b: 'border-sky-500/30',     Icon: Clock },
  resolved:    { label: 'Resolved',    c: 'text-emerald-400', bg: 'bg-emerald-500/15', b: 'border-emerald-500/30', Icon: CheckCircle },
  closed:      { label: 'Closed',      c: 'text-gray-400',    bg: 'bg-gray-500/15',    b: 'border-gray-500/30',    Icon: XCircle },
};

const CATS = {
  general:'🔧 General', payment:'💳 Payment', wallet:'👛 Wallet',
  referral:'🌐 Referral', withdrawal:'💰 Withdrawal', account:'👤 Account',
};

const FAQ = {
  "how to activate wallet": {
    text: "🔐 **Wallet Activation:**\n\n1. Go to Scanner Tab\n2. Click 'Activate Wallet'\n3. Enter 7-day limit (e.g. ₹35000)\n4. Pay 10% in USDT & wait 2 mins\n\n✅ Done! You can now accept payments.",
    options: ["How much activation amount?", "What is daily limit?", "Back to Menu"]
  },
  "how much activation amount": {
    text: "💰 10% of 7-day limit in USDT\n\nExample:\n₹35000 → ₹3500 → **36.84 USDT** (₹95/USDT)",
    options: ["How to activate wallet?", "Back to Menu"]
  },
"how does referral system work": {
  text: "🌐 **Referral System — Simple Rule:**\n\nYour Direct Referrals = Levels unlocked in EACH Leg\n\n1 Direct  → Level 1 open in all Legs\n5 Directs → Levels 1-5 open in all Legs\n21 Directs → ALL 21 Levels open! 🏆\n\nEach Direct creates a new Leg with 21 levels inside it.",
  options: ["Commission rates?", "How to unlock more levels?", "What are Legs?", "Back to Menu"]
},
"commission rates": {
  text: "💰 **Commission per Level:**\n\nL1: 30%  L2: 15%  L3: 10%\nL4: 5%   L5: 30%  L6-15: 3%\nL16: 5%  L17: 10% L18: 15%\nL19: 30% L20: 30% L21: 63%\n\nYou earn this % on team's cashback at each level.",
  options: ["How does referral system work?", "Back to Menu"]
},
"how to unlock more levels": {
  text: "🔓 **Unlock More Levels:**\n\nAdd 1 more Direct Referral = Next level unlocks in ALL Legs!\n\nExample:\n• You have 3 Directs → Levels 1-3 open\n• Add 1 more → Level 4 opens in ALL 3 Legs\n\n✅ Keep referring to unlock all 21 levels!",
  options: ["How does referral system work?", "Back to Menu"]
},
"what are legs": {
  text: "🦵 **What are Legs (Directs)?**\n\nEach person you refer directly = 1 Leg\n\nLeg 1 = your 1st direct referral\nLeg 2 = your 2nd direct referral\n...\nLeg 21 = your 21st direct referral\n\nEach Leg has 21 levels of team inside it.\nMore Legs = More earning potential!",
  options: ["How to unlock more levels?", "Commission rates?", "Back to Menu"]
},
  "what is daily limit": {
    text: "📊 7-day limit ÷ 7 = daily average\n\nExample: ₹35000 → ₹5000/day",
    options: ["How to activate wallet?", "Back to Menu"]
  },
  "how to create payment request": {
    text: "💳 **Create Pay Request:**\n\n1. Scanner Tab → 'Pay My Bill'\n2. Enter amount & photo QR\n3. Accept T&C → POST TO BILL PAYMENTS\n\n⏱️ Active 10 mins",
    options: ["Payment issues", "Back to Menu"]
  },
  "payment issues": {
    text: "⚠️ **Quick Fixes:**\n\n• Expired? → Create new request\n• QR issue? → DOWNLOAD QR button\n• Not confirming? → Create a support ticket 👇",
    options: ["🎫 Create Support Ticket", "Back to Menu"]
  },
"back to menu": {
  text: "🏠 What can I help you with?",
  options: [
    "How to activate wallet?",
    "How does referral system work?",
    "What are Legs?",
    "How to unlock more levels?",
    "Commission rates?",
    "Payment issues",
    "🎫 Create Support Ticket",
    "📋 My Tickets"
  ]
},
  "contact support": {
    text: "📞 Create a support ticket and we'll reply within 24-48 hrs.",
    options: ["🎫 Create Support Ticket", "Back to Menu"]
  }
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('chat');
const [messages, setMessages] = useState([{
  id: 1, sender: 'bot',
  text: "👋 Hello! I'm CpayLink AI Assistant.\nHow can I help you today?",
  options: [
    "How to activate wallet?",
    "How does referral system work?",
    "What are Legs?",
    "Commission rates?",
    "Payment issues",
    "🎫 Create Support Ticket",
    "📋 My Tickets"
  ]
}]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [queries, setQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [form, setForm] = useState({ subject:'', description:'', category:'general', screenshot:null, preview:null });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const fileRef = useRef(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const detailEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, isTyping]);
  useEffect(() => { detailEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [detail?.replies]);

  const loadQueries = useCallback(async () => {
    setQueriesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/support/my-queries`, { headers: authH(token) });
      const data = await res.json();
      if (data.success) { setQueries(data.data); setUnreadCount(data.data.filter(q=>q.hasUnreadReply).length); }
    } catch(e){console.error(e);} finally { setQueriesLoading(false); }
  }, []);

  useEffect(() => {
    if (isOpen && (view==='queries'||view==='home')) loadQueries();
  }, [isOpen, view, loadQueries]);

  const loadDetail = useCallback(async (id) => {
    setDetailLoading(true); setDetail(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/support/query/${id}`, { headers: authH(token) });
      const data = await res.json();
      if (data.success) {
        setDetail(data.data);
        if (data.data.hasUnreadReply) {
          await fetch(`${API_BASE}/support/query/${id}/read`, { method:'PATCH', headers: authH(token) });
          setUnreadCount(p=>Math.max(0,p-1));
        }
      }
    } catch(e){console.error(e);} finally { setDetailLoading(false); }
  }, []);

  const sendChat = (msg) => {
    const text = (msg||chatInput).trim();
    if (!text) return;
    if (text.includes('Create Support Ticket')||text.includes('🎫')) {
      setMessages(p=>[...p,{id:p.length+1,sender:'user',text}]);
      setChatInput('');
      setTimeout(()=>setView('new-query'),300);
      return;
    }
    if (text.includes('My Tickets')||text.includes('📋')) {
      setMessages(p=>[...p,{id:p.length+1,sender:'user',text}]);
      setChatInput('');
      setTimeout(()=>{ loadQueries(); setView('queries'); },300);
      return;
    }
    setMessages(p=>[...p,{id:p.length+1,sender:'user',text}]);
    setChatInput('');
    setIsTyping(true);
    setTimeout(()=>{
      const lower=text.toLowerCase();
      let resp=null;
      for(const [k,v] of Object.entries(FAQ)){ if(lower.includes(k)){resp=v;break;} }
      if(!resp) resp={text:"🤔 I didn't understand. Try:",options:["How to activate wallet?","Payment issues","🎫 Create Support Ticket","📋 My Tickets"]};
      setMessages(p=>[...p,{id:p.length+1,sender:'bot',...resp}]);
      setIsTyping(false);
    },900);
  };

  const submitQuery = async () => {
    if (!form.subject.trim()||!form.description.trim()){ setFormError('Subject and description required'); return; }
    setFormSubmitting(true); setFormError('');
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('subject',form.subject); fd.append('description',form.description); fd.append('category',form.category);
      if(form.screenshot) fd.append('screenshot',form.screenshot);
      const res = await fetch(`${API_BASE}/support/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:fd});
      const data = await res.json();
      if(data.success){
        setFormSuccess(true);
        setMessages(p=>[...p,{id:p.length+1,sender:'bot',text:`✅ Ticket submitted!\nQuery ID: #${data.data.queryId}\n\nWe'll reply within 24-48 hours.`,options:["📋 My Tickets","Back to Menu"]}]);
        setForm({subject:'',description:'',category:'general',screenshot:null,preview:null});
        setTimeout(()=>{ setFormSuccess(false); setView('chat'); loadQueries(); },1800);
      } else { setFormError(data.message||'Failed to submit'); }
    } catch { setFormError('Network error. Try again.'); } finally { setFormSubmitting(false); }
  };

  const sendReply = async () => {
    if(!replyText.trim()||!detail) return;
    setReplySending(true);
    try {
      const token=localStorage.getItem('token');
      const res=await fetch(`${API_BASE}/support/query/${detail._id}/reply`,{method:'POST',headers:authH(token),body:JSON.stringify({message:replyText.trim()})});
      const data=await res.json();
      if(data.success){ setReplyText(''); loadDetail(detail._id); }
    } catch(e){console.error(e);} finally{setReplySending(false);}
  };

  const stats={ total:queries.length, open:queries.filter(q=>q.status==='open').length, resolved:queries.filter(q=>q.status==='resolved').length };

  const goBack = () => {
    if(view==='query-detail') setView('queries');
    else setView('home');
  };

  return (
    <>
      <button onClick={()=>setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#00F5A0] to-[#00d88c] text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 relative ${isOpen?'rotate-90':''}`}>
        {!isOpen && unreadCount>0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">{unreadCount}</span>
        )}
        {isOpen ? <X size={24}/> : <MessageCircle size={24}/>}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[22rem] h-[580px] bg-[#0A1F1A] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          style={{animation:'cbSlideUp 0.25s ease'}}>
          <style>{`
            @keyframes cbSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
            .cb-scroll{scrollbar-width:none}
            .cb-scroll::-webkit-scrollbar{display:none}
          `}</style>

          {/* ── HEADER ── */}
          <div className="p-3 border-b border-white/8 flex items-center gap-2.5 bg-gradient-to-r from-[#00F5A0]/8 to-transparent flex-shrink-0">
            {view!=='chat' ? (
              <button onClick={goBack} className="text-gray-400 hover:text-white p-1"><ArrowLeft size={15}/></button>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#00F5A0] flex items-center justify-center flex-shrink-0"><Bot size={13} className="text-black"/></div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-[#00F5A0] truncate">
                {view==='chat'?'CpayLink AI': view==='queries'?'My Tickets': view==='new-query'?'New Ticket': view==='query-detail'?(detail?`#${detail.queryId}`:'Ticket'):'Support'}
              </p>
              <p className="text-[9px] text-gray-500">
                {view==='chat'?'● Online always': view==='queries'?`${queries.length} tickets`: view==='new-query'?'24-48 hr response': detail?.subject||'Loading...'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {view!=='chat' && <button onClick={()=>setView('chat')} className="text-[9px] text-gray-500 bg-white/5 px-2 py-1 rounded-lg hover:text-gray-300">Chat</button>}
              {unreadCount>0 && view!=='queries' && (
                <button onClick={()=>{loadQueries();setView('queries');}} className="relative bg-[#00F5A0]/10 border border-[#00F5A0]/25 p-1.5 rounded-lg">
                  <Bell size={12} className="text-[#00F5A0]"/>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00F5A0] text-black text-[7px] font-black flex items-center justify-center">{unreadCount}</span>
                </button>
              )}
              <button onClick={()=>setIsOpen(false)} className="text-gray-500 hover:text-white p-1"><X size={15}/></button>
            </div>
          </div>

          {/* ── VIEWS ── */}
          <div className="flex-1 flex flex-col min-h-0">

            {/* CHAT */}
            {view==='chat' && <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 cb-scroll">
                {messages.map(msg=>(
                  <div key={msg.id}>
                    <div className={`flex ${msg.sender==='user'?'justify-end':'justify-start'}`}>
                      {msg.sender==='bot' && <div className="w-6 h-6 rounded-lg bg-[#00F5A0]/12 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0"><Bot size={11} className="text-[#00F5A0]"/></div>}
                      <div className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed ${msg.sender==='user'?'bg-[#00F5A0] text-black rounded-2xl rounded-br-sm':'bg-white/8 border border-white/8 text-white rounded-2xl rounded-bl-sm'}`}>
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                    {msg.options && msg.sender==='bot' && (
                      <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
                        {msg.options.map((opt,i)=>(
                          <button key={i} onClick={()=>sendChat(opt)}
                            className={`text-[10px] px-3 py-1.5 rounded-full border transition-all ${opt.includes('🎫')||opt.includes('📋')?'bg-[#00F5A0]/12 border-[#00F5A0]/35 text-[#00F5A0] font-black':'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#00F5A0]/12 flex items-center justify-center"><Bot size={11} className="text-[#00F5A0]"/></div>
                    <div className="bg-white/8 border border-white/8 px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex gap-1">
                      {[0,150,300].map(d=><div key={d} className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{animationDelay:`${d}ms`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef}/>
              </div>
              <div className="p-3 border-t border-white/8 flex-shrink-0">
                <div className="flex gap-2 bg-black/40 border border-white/8 rounded-xl p-1.5">
                  <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()}
                    placeholder="Ask anything..." className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder-gray-600"/>
                  <button onClick={()=>sendChat()} disabled={!chatInput.trim()}
                    className={`p-2 rounded-lg transition-all ${chatInput.trim()?'bg-[#00F5A0] text-black':'bg-white/5 text-gray-600 cursor-not-allowed'}`}>
                    <Send size={15}/>
                  </button>
                </div>
              </div>
            </>}

            {/* QUERIES */}
            {view==='queries' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 cb-scroll">
                <div className="grid grid-cols-4 gap-1.5">
                  {Object.entries(STATUS).map(([k,s])=>{
                    const SIcon=s.Icon; const cnt=queries.filter(q=>q.status===k).length;
                    return(<div key={k} className={`${s.bg} border ${s.b} rounded-xl p-2 text-center`}><p className={`text-base font-black ${s.c}`}>{cnt}</p><p className="text-[8px] text-gray-500">{s.label}</p></div>);
                  })}
                </div>
                {unreadCount>0 && (
                  <div className="flex items-center gap-2 bg-[#00F5A0]/8 border border-[#00F5A0]/25 rounded-xl px-3 py-2">
                    <Bell size={12} className="text-[#00F5A0] animate-pulse"/><p className="text-[11px] text-[#00F5A0] font-black">{unreadCount} unread {unreadCount===1?'reply':'replies'}</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">{queries.length} tickets</span>
                  <button onClick={()=>setView('new-query')} className="text-[10px] bg-[#00F5A0]/12 border border-[#00F5A0]/30 text-[#00F5A0] px-3 py-1.5 rounded-full font-black flex items-center gap-1"><Plus size={10}/>New</button>
                </div>
                {queriesLoading ? (
                  <div className="flex justify-center py-10"><Loader size={20} className="animate-spin text-[#00F5A0]"/></div>
                ) : queries.length===0 ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto"><MessageSquare size={18} className="text-gray-600"/></div>
                    <p className="text-sm text-gray-500">No tickets yet</p>
                    <button onClick={()=>setView('new-query')} className="text-[11px] text-[#00F5A0] border border-[#00F5A0]/30 px-4 py-2 rounded-xl">Create first ticket</button>
                  </div>
                ) : queries.map(q=>{
                  const s=STATUS[q.status]||STATUS.open; const SIcon=s.Icon;
                  return(
                    <div key={q._id} onClick={()=>{loadDetail(q._id);setView('query-detail');}}
                      className={`bg-black/30 border rounded-xl p-3 cursor-pointer active:scale-[0.98] transition-all ${q.hasUnreadReply?'border-[#00F5A0]/35':'border-white/8 hover:border-white/15'}`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 w-7 h-7 rounded-lg ${s.bg} border ${s.b} flex items-center justify-center flex-shrink-0`}><SIcon size={12} className={s.c}/></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-[9px] font-mono text-[#00F5A0] bg-[#00F5A0]/10 px-1.5 py-0.5 rounded">#{q.queryId}</span>
                            {q.hasUnreadReply && <span className="text-[9px] text-[#00F5A0] font-black animate-pulse">● Reply</span>}
                          </div>
                          <p className="text-sm font-black text-white truncate">{q.subject}</p>
                          <div className="flex gap-2 mt-0.5 text-[9px] text-gray-600">
                            <span>{CATS[q.category]}</span><span>💬{q.replies?.length||0}</span><span>{new Date(q.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className={q.hasUnreadReply?'text-[#00F5A0]':'text-gray-600'}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NEW QUERY */}
            {view==='new-query' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 cb-scroll">
                {formSuccess ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-14 h-14 rounded-full bg-[#00F5A0]/12 flex items-center justify-center"><CheckCircle size={28} className="text-[#00F5A0]"/></div>
                    <p className="text-white font-black">Ticket Submitted!</p>
                    <p className="text-xs text-gray-500">Redirecting...</p>
                  </div>
                ) : <>
                  <p className="text-[11px] text-gray-500">We reply within 24-48 hours.</p>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1.5 block uppercase tracking-wider">Category</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {Object.entries(CATS).map(([k,v])=>(
                        <button key={k} onClick={()=>setForm(p=>({...p,category:k}))}
                          className={`text-[10px] py-2 px-1 rounded-xl border text-center transition-all ${form.category===k?'bg-[#00F5A0]/12 border-[#00F5A0]/40 text-[#00F5A0] font-black':'bg-black/30 border-white/8 text-gray-500 hover:border-white/15'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1.5 block uppercase tracking-wider">Subject *</label>
                    <input value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} placeholder="Brief issue description..."
                      className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00F5A0]/40 placeholder-gray-700 transition-all"/>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1.5 block uppercase tracking-wider">Description *</label>
                    <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Describe in detail..." rows={4}
                      className="w-full bg-black/40 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00F5A0]/40 placeholder-gray-700 resize-none transition-all"/>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 mb-1.5 block uppercase tracking-wider">Screenshot (optional, max 5MB)</label>
                    {form.preview ? (
                      <div className="relative">
                        <img src={form.preview} className="w-full h-24 object-cover rounded-xl border border-white/8"/>
                        <button onClick={()=>setForm(p=>({...p,screenshot:null,preview:null}))} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-red-500/80"><X size={11}/></button>
                      </div>
                    ) : (
                      <div onClick={()=>fileRef.current?.click()} className="w-full h-16 bg-black/30 border border-dashed border-white/12 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#00F5A0]/30 transition-all gap-1">
                        <Paperclip size={15} className="text-gray-600"/><span className="text-[10px] text-gray-600">Tap to attach screenshot</span>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>{
                      const f=e.target.files[0]; if(!f) return;
                      if(f.size>5*1024*1024){setFormError('Max 5MB');return;}
                      const r=new FileReader(); r.onload=ev=>setForm(p=>({...p,screenshot:f,preview:ev.target.result})); r.readAsDataURL(f);
                    }}/>
                  </div>
                  {formError && <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2"><AlertCircle size={12} className="text-red-400 flex-shrink-0"/><p className="text-[11px] text-red-400">{formError}</p></div>}
                  <button onClick={submitQuery} disabled={formSubmitting}
                    className={`w-full py-3 rounded-xl font-black text-sm transition-all ${formSubmitting?'bg-white/8 text-gray-500 cursor-not-allowed':'bg-[#00F5A0] text-black hover:opacity-90 active:scale-[0.98]'}`}>
                    {formSubmitting?'⏳ Submitting...':'🎫 Submit Ticket'}
                  </button>
                </>}
              </div>
            )}

            {/* QUERY DETAIL */}
            {view==='query-detail' && (
              <div className="flex flex-col flex-1 min-h-0">
                {detailLoading ? (
                  <div className="flex-1 flex justify-center items-center"><Loader size={22} className="animate-spin text-[#00F5A0]"/></div>
                ) : detail ? <>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 cb-scroll">
                    {(()=>{ const s=STATUS[detail.status]||STATUS.open; const SIcon=s.Icon;
                      return(<div className={`flex items-center gap-2 ${s.bg} border ${s.b} rounded-xl px-3 py-2`}><SIcon size={12} className={s.c}/><span className={`text-xs font-black ${s.c}`}>{s.label}</span><span className="text-[9px] text-gray-600 ml-auto">{CATS[detail.category]}</span></div>);
                    })()}
                    <div className="bg-black/40 border border-white/8 rounded-xl p-3">
                      <p className="text-[9px] text-gray-600 mb-1.5 uppercase tracking-wider">Your Description</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{detail.description}</p>
                      {detail.screenshotPath && (
                        <img src={`${API_BASE}/support/screenshot/${detail.screenshotPath.split('/').pop()}`}
                          className="mt-2 max-h-28 rounded-xl border border-white/8 cursor-pointer hover:opacity-90"
                          onClick={()=>window.open(`${API_BASE}/support/screenshot/${detail.screenshotPath.split('/').pop()}`,'_blank')}/>
                      )}
                      <p className="text-[9px] text-gray-600 mt-2">{new Date(detail.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    {detail.replies?.map((r,i)=>(
                      <div key={i} className={`flex ${r.from==='admin'?'justify-start':'justify-end'}`}>
                        {r.from==='admin' && <div className="w-6 h-6 rounded-lg bg-purple-500/12 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0"><Shield size={11} className="text-purple-400"/></div>}
                        <div className={`max-w-[82%] px-3 py-2.5 rounded-xl text-sm ${r.from==='admin'?'bg-purple-500/8 border border-purple-500/18 rounded-tl-sm':'bg-[#00F5A0] text-black rounded-tr-sm'}`}>
                          <p className={`text-[9px] font-black mb-1 ${r.from==='admin'?'text-purple-400':'text-black/50'}`}>{r.from==='admin'?'👨‍💼 Support':'👤 You'}</p>
                          <p className={`leading-relaxed whitespace-pre-wrap ${r.from==='admin'?'text-gray-300':'text-black'}`}>{r.message}</p>
                          <p className={`text-[8px] mt-1 ${r.from==='admin'?'text-gray-600':'text-black/40'}`}>{new Date(r.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                    {detail.status==='resolved' && (
                      <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3 text-center">
                        <CheckCircle size={14} className="text-emerald-400 mx-auto mb-1"/>
                        <p className="text-xs text-emerald-400 font-black">Ticket Resolved</p>
                        <p className="text-[9px] text-gray-600">Reply below to reopen</p>
                      </div>
                    )}
                    <div ref={detailEndRef}/>
                  </div>
                  {detail.status!=='closed' && (
                    <div className="p-3 border-t border-white/8 flex gap-2 flex-shrink-0">
                      <input value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendReply()}
                        placeholder="Reply to support..." className="flex-1 bg-black/40 border border-white/8 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#00F5A0]/40 placeholder-gray-700"/>
                      <button onClick={sendReply} disabled={!replyText.trim()||replySending}
                        className={`p-2.5 rounded-xl transition-all ${replyText.trim()&&!replySending?'bg-[#00F5A0] text-black':'bg-white/5 text-gray-600 cursor-not-allowed'}`}>
                        {replySending?<Loader size={15} className="animate-spin"/>:<Send size={15}/>}
                      </button>
                    </div>
                  )}
                </> : <div className="flex-1 flex items-center justify-center"><p className="text-sm text-gray-500">Could not load ticket</p></div>}
              </div>
            )}
          </div>

          {/* ── BOTTOM NAV ── */}
          <div className="flex border-t border-white/8 flex-shrink-0">
            {[
              {key:'chat',icon:<Bot size={15}/>,label:'AI Chat'},
              {key:'new-query',icon:<Plus size={15}/>,label:'New'},
              {key:'queries',icon:<MessageSquare size={15}/>,label:'Tickets',badge:unreadCount},
            ].map(nav=>(
              <button key={nav.key} onClick={()=>{if(nav.key==='queries')loadQueries();setView(nav.key);}}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all relative ${view===nav.key||(view==='query-detail'&&nav.key==='queries')?'text-[#00F5A0]':'text-gray-600 hover:text-gray-400'}`}>
                {nav.icon}
                <span className="text-[8px] font-black">{nav.label}</span>
                {nav.badge>0 && <span className="absolute top-1.5 right-1/4 w-3.5 h-3.5 rounded-full bg-[#00F5A0] text-black text-[7px] font-black flex items-center justify-center">{nav.badge}</span>}
                {(view===nav.key||(view==='query-detail'&&nav.key==='queries')) && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#00F5A0] rounded-full"/>}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;