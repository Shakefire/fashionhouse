"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Hash, 
  DollarSign, 
  Wallet, 
  Landmark,
  MoreVertical,
  X,
  Save,
  ChevronRight,
  ArrowRight,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Debit Card"];

export default function PaymentRecordsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [currentPayment, setCurrentPayment] = useState({
    id: "",
    order_id: "",
    amount: "",
    created_at: new Date().toISOString().split('T')[0],
    method: "Cash" as any,
    status: "Pending" as any
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [paymentsRes, ordersRes, customersRes] = await Promise.all([
      supabase.from('payments').select('*, orders(order_number, customers(full_name))').order('created_at', { ascending: false }),
      supabase.from('orders').select('id, order_number, customers(full_name)').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, full_name').order('full_name')
    ]);

    if (paymentsRes.data) {
      const formattedPayments = paymentsRes.data.map(p => ({
        id: p.id,
        order_id: p.order_id,
        customer: p.orders?.customers?.full_name || 'Unknown',
        orderNo: p.orders?.order_number || 'N/A',
        amount: p.amount,
        date: p.created_at,
        method: p.method,
        status: p.status
      }));
      setPayments(formattedPayments);
    }
    if (ordersRes.data) setDbOrders(ordersRes.data);
    if (customersRes.data) setDbCustomers(customersRes.data);
    setIsLoading(false);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const paymentData = {
      order_id: currentPayment.order_id,
      amount: parseFloat(currentPayment.amount) || 0,
      method: currentPayment.method,
      status: currentPayment.status || 'Pending',
      created_at: new Date(currentPayment.created_at).toISOString(),
    };

    let result;
    if (isEditing) {
      result = await supabase.from('payments').update(paymentData).eq('id', currentPayment.id);
    } else {
      result = await supabase.from('payments').insert([paymentData]);
    }

    if (result.error) {
      console.error("Error saving payment:", result.error);
      setStatusMessage({ type: 'error', text: "Failed to log transaction. Please verify details." });
    } else {
      setStatusMessage({ type: 'success', text: isEditing ? "Payment record updated." : "Payment logged in cloud ledger." });
      setIsRecording(false);
      setIsEditing(false);
      resetForm();
      fetchData();
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setCurrentPayment({
      id: "",
      order_id: "",
      amount: "",
      created_at: new Date().toISOString().split('T')[0],
      method: "Cash",
      status: "Pending"
    });
  };

  const startEditing = (payment: any) => {
    setCurrentPayment({
      ...payment,
      created_at: new Date(payment.date).toISOString().split('T')[0]
    });
    setIsEditing(true);
    setIsRecording(true);
    setActiveMenu(null);
  };

  const handleDeletePayment = async (id: string) => {
    if (confirm("Permanently void this transaction record?")) {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (!error) {
        setPayments(payments.filter(p => p.id !== id));
        setStatusMessage({ type: 'success', text: "Payment record deleted." });
      } else {
        setStatusMessage({ type: 'error', text: "Failed to delete record." });
      }
      setActiveMenu(null);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          payment.orderNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const paymentDate = new Date(payment.date);
    const matchesDateFrom = dateFrom ? paymentDate >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? paymentDate <= new Date(dateTo) : true;
    
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Cash": return <Wallet size={16} className="text-emerald-400" />;
      case "Bank Transfer": return <Landmark size={16} className="text-blue-400" />;
      case "Debit Card": return <CreditCard size={16} className="text-purple-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center space-x-3">
            <CreditCard size={28} className="text-cyan-400 lg:w-8 lg:h-8" />
            <span>Payment Records</span>
          </h2>
          <p className="text-slate-400 mt-1 text-xs lg:text-sm">Financial tracking and transaction history module.</p>
        </div>
        
        <button 
          onClick={() => setIsRecording(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all transform hover:scale-[1.02] w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Add Payment</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-effect p-6 lg:p-8 rounded-2xl border border-blue-500/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Filter by Customer</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <select 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none"
            >
              <option value="">All Customers</option>
              {dbCustomers.map(c => <option key={c.id} value={c.full_name}>{c.full_name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date From</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date To</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <button className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-cyan-400 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 group w-full">
          <Search size={18} className="group-hover:scale-110 transition-transform" />
          <span>Apply Filters</span>
        </button>
      </div>

      {/* History Table */}
      <div className="glass-effect rounded-2xl overflow-hidden border border-blue-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Transactions...</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/60 text-slate-500 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6 font-bold border-b border-blue-500/5">Customer</th>
                <th className="px-8 py-6 font-bold border-b border-blue-500/5">Order No.</th>
                <th className="px-8 py-6 font-bold border-b border-blue-500/5">Amount Paid</th>
                <th className="px-8 py-6 font-bold border-b border-blue-500/5">Payment Date</th>
                <th className="px-8 py-6 font-bold border-b border-blue-500/5">Method</th>
                <th className="px-8 py-6 font-bold border-b border-blue-500/5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/5">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, idx) => (
                  <tr key={idx} className="group hover:bg-blue-500/5 transition-colors">
                    <td className="px-8 py-5">
                      <span className="font-semibold text-sm text-slate-200">{payment.customer}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono text-cyan-400/80">{payment.orderNo}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-1 text-sm font-bold text-white font-mono">
                        <span className="text-emerald-400">$</span>
                        <span>{Number(payment.amount).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-slate-400">{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-2 text-xs font-medium text-slate-300">
                        {getMethodIcon(payment.method)}
                        <span>{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === payment.id ? null : payment.id)}
                        className={`p-2 rounded-lg transition-all ${activeMenu === payment.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenu === payment.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-8 top-full mt-2 w-48 bg-slate-900 border border-blue-500/20 rounded-2xl shadow-2xl z-40 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                            <button 
                              onClick={() => startEditing(payment)}
                              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-cyan-400 transition-all group"
                            >
                              <Edit size={16} className="text-slate-500 group-hover:text-cyan-400" />
                              <span className="font-semibold">Edit Record</span>
                            </button>
                            <button 
                              onClick={() => handleDeletePayment(payment.id)}
                              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all group"
                            >
                              <Trash2 size={16} className="text-red-500" />
                              <span className="font-semibold">Delete Record</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-500 italic text-sm">
                    No payment records found matching your selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => { setIsRecording(false); setIsEditing(false); resetForm(); }} />
          
          <div className="relative w-full max-w-xl glass-effect rounded-3xl border border-blue-500/20 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-8 border-b border-blue-500/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  {isEditing ? <Edit size={24} /> : <Plus size={24} />}
                </div>
                <h3 className="text-xl font-bold text-white">{isEditing ? 'Modify Payment Record' : 'Record New Transaction'}</h3>
              </div>
              <button 
                onClick={() => { setIsRecording(false); setIsEditing(false); resetForm(); }}
                className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Select Order</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                    <select
                      required
                      value={currentPayment.order_id}
                      onChange={(e) => setCurrentPayment({...currentPayment, order_id: e.target.value})}
                      className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none"
                    >
                      <option value="" className="bg-slate-900">Select Order</option>
                      {dbOrders.map(o => (
                        <option key={o.id} value={o.id} className="bg-slate-900">
                          {o.order_number} - {o.customers?.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Amount ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                      <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={currentPayment.amount}
                        onChange={(e) => setCurrentPayment({...currentPayment, amount: e.target.value})}
                        className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                      <input
                        required
                        type="date"
                        value={currentPayment.created_at}
                        onChange={(e) => setCurrentPayment({...currentPayment, created_at: e.target.value})}
                        className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Method</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                      <select
                        required
                        value={currentPayment.method}
                        onChange={(e) => setCurrentPayment({...currentPayment, method: e.target.value as any})}
                        className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none"
                      >
                        {PAYMENT_METHODS.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Status</label>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                      <select
                        required
                        value={currentPayment.status}
                        onChange={(e) => setCurrentPayment({...currentPayment, status: e.target.value as any})}
                        className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none"
                      >
                        <option value="Pending" className="bg-slate-900">Pending</option>
                        <option value="Verified" className="bg-slate-900">Verified</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      <span>{isEditing ? 'Update Record' : 'Record Payment'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRecording(false); setIsEditing(false); resetForm(); }}
                  className="px-8 py-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Summary Card */}
      <div className="p-8 glass-effect rounded-2xl border border-blue-500/10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full group-hover:bg-cyan-500/10 transition-colors" />
        
        <div className="flex items-center space-x-6 relative z-10 w-full lg:w-auto">
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Landmark size={24} className="lg:w-8 lg:h-8" />
          </div>
          <div>
            <h4 className="text-lg lg:text-xl font-bold text-slate-100">Live Revenue Ledger</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Real-time Performance Sync</p>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end space-x-6 lg:space-x-12 relative z-10 w-full lg:w-auto">
          <div className="text-center lg:text-left">
            <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Received</p>
            <p className="text-xl lg:text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
              ${payments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-blue-500/20" />
          <div className="text-center lg:text-left">
            <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Transaction Volume</p>
            <p className="text-xl lg:text-3xl font-bold text-cyan-400">{payments.length}</p>
          </div>
          <button className="p-2 lg:p-3 rounded-xl bg-blue-600/10 border border-blue-500/30 text-cyan-400 hover:bg-blue-600/20 transition-all">
            <ChevronRight size={20} className="lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>

    </div>
  );
}
