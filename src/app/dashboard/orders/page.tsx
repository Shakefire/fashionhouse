"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar, 
  User, 
  Scissors, 
  DollarSign, 
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  X,
  Save,
  Edit,
  Trash2,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { addNotification, syncOrderReminders } from "@/utils/notifications";

const FABRICS = [
  { value: "Premium Silk", label: "Premium Silk" },
  { value: "Egyptian Cotton", label: "Egyptian Cotton" },
  { value: "Merino Wool", label: "Merino Wool" },
  { value: "Linen", label: "Linen" },
  { value: "Velvet", label: "Velvet" },
];

const ORDER_TYPES = [
  { value: "Custom Orders", label: "Custom Orders" },
  { value: "Alteration Orders", label: "Alteration Orders" },
  { value: "Bulk Orders", label: "Bulk Orders" },
];

const STATUSES = ["Pending", "In Progress", "Completed", "Delivered"];

export default function OrderManagementPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [currentOrder, setCurrentOrder] = useState({
    id: "",
    order_number: "",
    customer_id: "",
    description: "",
    fabric: "",
    order_type: "Custom Orders",
    deadline: "",
    total_amount: "",
    total_cost: "",
    amount_paid: "",
    balance_due: "",
    status: "Pending" as any,
    sendReminder: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [ordersRes, customersRes] = await Promise.all([
      supabase.from('orders').select('*, customers(full_name)').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, full_name').order('full_name')
    ]);

    if (ordersRes.data) {
      const formattedOrders = ordersRes.data.map(o => ({
        id: o.id,
        order_number: o.order_number,
        customer_id: o.customer_id,
        customer: o.customers?.full_name || 'Unknown',
        description: o.items?.[0]?.description || '',
        fabric: o.items?.[0]?.fabric || '',
        order_type: o.order_type,
        deadline: o.deadline,
        total_amount: o.total_amount,
        total_cost: o.total_cost,
        amount_paid: o.amount_paid,
        balance_due: o.balance_due,
        status: o.status
      }));
      setOrders(formattedOrders);
      syncOrderReminders(formattedOrders);
    }
    if (customersRes.data) setDbCustomers(customersRes.data);
    setIsLoading(false);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const orderData = {
      order_number: isEditing ? currentOrder.order_number : `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: currentOrder.customer_id,
      total_amount: parseFloat(currentOrder.total_amount) || 0,
      total_cost: parseFloat(currentOrder.total_cost) || 0,
      amount_paid: parseFloat(currentOrder.amount_paid) || 0,
      order_type: currentOrder.order_type,
      status: currentOrder.status,
      deadline: currentOrder.deadline,
      items: [{ description: currentOrder.description, fabric: currentOrder.fabric }]
    };

    let result;
    if (isEditing) {
      result = await supabase.from('orders').update(orderData).eq('id', currentOrder.id);
    } else {
      result = await supabase.from('orders').insert([orderData]);
    }

    if (result.error) {
      setStatusMessage({ type: 'error', text: "Failed to save order. Please check inputs." });
    } else {
      const createdOrderId = (() => {
        const firstItem = (result.data as unknown as Array<{ id?: string }> | null | undefined)?.[0];
        if (typeof firstItem?.id === "string") {
          return firstItem.id;
        }
        return currentOrder.id || orderData.order_number;
      })();
      const customerName = dbCustomers.find((customer) => customer.id === currentOrder.customer_id)?.full_name || "a client";

      if (!isEditing) {
        addNotification({
          key: `order-created-${createdOrderId}`,
          type: "order",
          title: "New order created",
          message: `A new order for ${customerName} has been taken.`,
          orderId: createdOrderId,
          priority: "high",
        });
      }

      if (currentOrder.sendReminder && currentOrder.deadline) {
        syncOrderReminders([{ id: createdOrderId, order_number: orderData.order_number, deadline: currentOrder.deadline, status: currentOrder.status }]);
      }

      setStatusMessage({ type: 'success', text: isEditing ? "Order updated successfully." : "New order commissioned successfully!" });
      setIsCreating(false);
      setIsEditing(false);
      resetForm();
      fetchData();
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setCurrentOrder({
      id: "",
      order_number: "",
      customer_id: "",
      description: "",
      fabric: "",
      order_type: "Custom Orders",
      deadline: "",
      total_amount: "",
      total_cost: "",
      amount_paid: "",
      balance_due: "",
      status: "Pending",
      sendReminder: false
    });
  };

  const startEditing = (order: any) => {
    setCurrentOrder({ ...order, sendReminder: false });
    setIsEditing(true);
    setIsCreating(true);
    setActiveMenu(null);
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm("Permanently remove this commission from the cloud ledger?")) {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (!error) {
        setOrders(orders.filter(o => o.id !== id));
        setStatusMessage({ type: 'success', text: "Order deleted successfully." });
      } else {
        setStatusMessage({ type: 'error', text: "Failed to delete order." });
      }
      setActiveMenu(null);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const currentStatus = orders.find((order) => order.id === id)?.status;
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));

      if (currentStatus !== newStatus) {
        const orderNumber = orders.find((order) => order.id === id)?.order_number || "this order";
        const title = newStatus === "Completed"
          ? "Order completed"
          : newStatus === "Delivered"
            ? "Order delivered"
            : "Order status updated";
        const message = newStatus === "Completed"
          ? `Order ${orderNumber} has been marked completed.`
          : newStatus === "Delivered"
            ? `Order ${orderNumber} has been marked delivered.`
            : `Order ${orderNumber} is now ${newStatus}.`;

        addNotification({
          key: `order-status-${id}-${newStatus}`,
          type: "status",
          title,
          message,
          orderId: id,
          priority: newStatus === "Delivered" ? "high" : "normal",
        });
      }
    }
  };

  const filteredOrders = orders.filter(order => 
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "In Progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Completed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Delivered": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock size={12} />;
      case "In Progress": return <Clock size={12} className="animate-pulse" />;
      case "Completed": return <CheckCircle2 size={12} />;
      case "Delivered": return <Truck size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center space-x-3">
            <ShoppingBag size={28} className="text-cyan-400 lg:w-8 lg:h-8" />
            <span>Order Management</span>
          </h2>
          <p className="text-slate-400 mt-1 text-xs lg:text-sm">Oversee, track, and manage fashion commissions.</p>
        </div>
        
        <button 
          onClick={() => {
            setIsEditing(false);
            resetForm();
            setIsCreating(true);
          }}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all transform hover:scale-[1.02] w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>New Order</span>
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Search & Stats */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 glass-effect p-6 rounded-2xl border border-blue-500/10">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search orders, clients, or IDs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-3 sm:flex items-center sm:space-x-8 gap-4 sm:gap-0">
            <div className="text-center">
              <p className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total</p>
              <p className="text-lg lg:text-xl font-bold text-white">{orders.length}</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-blue-500/10" />
            <div className="text-center">
              <p className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-widest mb-1">Active</p>
              <p className="text-lg lg:text-xl font-bold text-blue-400">{orders.filter(o => o.status === 'In Progress').length}</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-blue-500/10" />
            <div className="text-center">
              <p className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-widest mb-1">Pending</p>
              <p className="text-lg lg:text-xl font-bold text-amber-400">{orders.filter(o => o.status === 'Pending').length}</p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="glass-effect rounded-2xl overflow-hidden border border-blue-500/10 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Ledger...</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/60 text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5 font-bold">Order Details</th>
                  <th className="px-6 py-5 font-bold">Client / Fabric</th>
                  <th className="px-6 py-5 font-bold">Delivery Date</th>
                  <th className="px-6 py-5 font-bold">Total Cost</th>
                  <th className="px-6 py-5 font-bold">Amount Paid</th>
                  <th className="px-6 py-5 font-bold">Balance Due</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/5">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, idx) => (
                    <tr key={idx} className="group hover:bg-blue-500/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-cyan-400 font-mono mb-1">{order.order_number}</span>
                          <span className="font-semibold text-sm text-slate-200 line-clamp-1">{order.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <User size={14} className="text-slate-500" />
                            <span>{order.customer}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                            <Scissors size={12} />
                            <span>{order.fabric}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2 text-sm text-slate-300">
                          <Calendar size={14} className="text-slate-500" />
                          <span>{new Date(order.deadline).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-1 text-sm font-bold text-slate-300 font-mono">
                          <span>₦{Number(order.total_cost).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-1 text-sm font-bold text-emerald-400 font-mono">
                          <span>₦{Number(order.amount_paid).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-1 text-sm font-bold font-mono" style={{color: Number(order.balance_due) > 0 ? '#f97316' : '#10b981'}}>
                          <span>₦{Number(order.balance_due).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative inline-block group/status">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center gap-2 cursor-pointer transition-all hover:scale-105 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                          
                          {/* Status Switcher Popover */}
                          <div className="absolute top-full left-0 mt-2 w-40 bg-slate-900 border border-blue-500/20 rounded-xl shadow-2xl opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-20 p-2 overflow-hidden">
                            {STATUSES.map(status => (
                              <button 
                                key={status}
                                onClick={() => updateOrderStatus(order.id, status)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-2 mb-1 last:mb-0 hover:bg-white/5 ${order.status === status ? 'text-cyan-400' : 'text-slate-500'}`}
                              >
                                {getStatusIcon(status)}
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                          className={`p-2 rounded-lg transition-all ${activeMenu === order.id ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800 text-slate-500 hover:text-white'}`}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Action Menu Popover */}
                        {activeMenu === order.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)} />
                            <div className="absolute right-6 top-full mt-2 w-56 bg-slate-900 border border-blue-500/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                              <button 
                                onClick={() => startEditing(order)}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-cyan-400 transition-all group"
                              >
                                <Edit size={16} className="text-slate-500 group-hover:text-cyan-400" />
                                <span className="font-semibold">Edit Order</span>
                              </button>

                              <div className="px-4 py-2">
                                <div className="h-px bg-blue-500/10 w-full" />
                              </div>

                              <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update Status</div>
                              <div className="grid grid-cols-1 gap-1">
                                {STATUSES.map(status => (
                                  <button 
                                    key={status}
                                    onClick={() => {
                                      updateOrderStatus(order.id, status);
                                      setActiveMenu(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${order.status === status ? 'text-cyan-400 bg-cyan-400/5' : 'text-slate-400 hover:bg-white/5'}`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {getStatusIcon(status)}
                                      <span>{status}</span>
                                    </div>
                                    {order.status === status && <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                                  </button>
                                ))}
                              </div>

                              <div className="px-4 py-2">
                                <div className="h-px bg-blue-500/10 w-full" />
                              </div>

                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all group"
                              >
                                <Trash2 size={16} className="text-red-500" />
                                <span className="font-semibold">Delete Order</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                      <td colSpan={8} className="px-6 py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <div className="p-4 rounded-full bg-slate-900/50 mb-4">
                          <Search size={32} />
                        </div>
                        <p>No orders found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

      {/* Create Order Modal / Overlay */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsCreating(false)} />
          
          <div className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl glass-effect rounded-2xl sm:rounded-3xl border border-blue-500/20 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-blue-500/10 gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 flex-shrink-0">
                  {isEditing ? <Edit size={18} className="sm:w-6 sm:h-6" /> : <Plus size={18} className="sm:w-6 sm:h-6" />}
                </div>
                <h3 className="text-sm sm:text-base lg:text-xl font-bold text-white truncate">{isEditing ? `Edit Order` : 'New Order'}</h3>
              </div>
              <button 
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  resetForm();
                }}
                className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all flex-shrink-0"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {/* Customer */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Select Client</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                      <User size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <select
                      required
                      value={currentOrder.customer_id}
                      onChange={(e) => setCurrentOrder({...currentOrder, customer_id: e.target.value})}
                      className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none"
                    >
                      <option value="" className="bg-slate-900">Select Customer</option>
                      {dbCustomers.map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fabric */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Fabric Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                      <Scissors size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <select
                      required
                      value={currentOrder.fabric}
                      onChange={(e) => setCurrentOrder({...currentOrder, fabric: e.target.value})}
                      className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none"
                    >
                      <option value="" className="bg-slate-900">Select Fabric</option>
                      {FABRICS.map(f => (
                        <option key={f.value} value={f.value} className="bg-slate-900">{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Order Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Order Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                      <ShoppingBag size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <select
                      required
                      value={currentOrder.order_type}
                      onChange={(e) => setCurrentOrder({...currentOrder, order_type: e.target.value})}
                      className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none"
                    >
                      {ORDER_TYPES.map(ot => (
                        <option key={ot.value} value={ot.value} className="bg-slate-900">{ot.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Delivery Deadline</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                      <Calendar size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <input
                      required
                      type="date"
                      value={currentOrder.deadline}
                      onChange={(e) => setCurrentOrder({...currentOrder, deadline: e.target.value})}
                      className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Total Cost */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Total Cost (₦)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                      <DollarSign size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <input
                      required
                      type="number"
                      placeholder="0.00"
                      value={currentOrder.total_cost}
                      onChange={(e) => setCurrentOrder({...currentOrder, total_cost: e.target.value})}
                      className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Amount Paid (₦)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                      <DollarSign size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={currentOrder.amount_paid}
                      onChange={(e) => setCurrentOrder({...currentOrder, amount_paid: e.target.value})}
                      className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Balance Due (Read-only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Balance Due (₦)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                    <DollarSign size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="number"
                    disabled
                    value={Math.max(0, (parseFloat(currentOrder.total_cost) || 0) - (parseFloat(currentOrder.amount_paid) || 0))}
                    className="w-full bg-slate-900/30 border border-blue-500/10 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Design Description</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-blue-400">
                    <FileText size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the design specifics, measurements, and any special requests..."
                    value={currentOrder.description}
                    onChange={(e) => setCurrentOrder({...currentOrder, description: e.target.value})}
                    className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-blue-500/10 bg-slate-900/30 p-3">
                <label className="flex items-center gap-3 text-xs font-bold text-slate-300 uppercase tracking-widest">
                  <input
                    type="checkbox"
                    checked={currentOrder.sendReminder}
                    onChange={(e) => setCurrentOrder({ ...currentOrder, sendReminder: e.target.checked })}
                    className="h-4 w-4 rounded border-blue-500/20 bg-slate-900 text-cyan-400 focus:ring-cyan-500/30"
                  />
                  <span>Send reminder alerts before the deadline</span>
                </label>
                <p className="text-[10px] text-slate-500">You will receive 48-hour and 24-hour reminders for this order.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 sm:py-3 lg:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={16} className="sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">{isEditing ? 'Save Changes' : 'Confirm & Create'}</span>
                      <span className="sm:hidden">{isEditing ? 'Save' : 'Create'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    resetForm();
                  }}
                  className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-xl border border-slate-700 text-slate-400 font-bold text-xs sm:text-sm hover:bg-slate-800 hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
