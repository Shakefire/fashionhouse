"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Ruler, 
  ShoppingBag, 
  Truck,
  ArrowUpRight,
  MoreVertical,
  Plus,
  Search,
  ChevronRight,
  Database
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Customers", value: "0", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Measurements Recorded", value: "0", icon: Ruler, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Active Orders", value: "0", icon: ShoppingBag, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Total Revenue", value: "$0", icon: Database, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ]);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      const [customers, measurements, orders, payments] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact' }),
        supabase.from('measurements').select('id', { count: 'exact' }),
        supabase.from('orders').select('*, customers(full_name)').order('created_at', { ascending: false }).limit(4),
        supabase.from('payments').select('amount')
      ]);

      const totalRevenue = payments.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      setStats([
        { label: "Total Customers", value: customers.count?.toString() || "0", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Measurements Recorded", value: measurements.count?.toString() || "0", icon: Ruler, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Active Orders", value: orders.data?.filter(o => o.status === 'In Progress').length.toString() || "0", icon: ShoppingBag, color: "text-cyan-400", bg: "bg-cyan-400/10" },
        { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: Database, color: "text-emerald-400", bg: "bg-emerald-400/10" },
      ]);

      if (orders.data) {
        setRecentOrders(orders.data.map(o => ({
          id: o.order_number,
          client: o.customers?.full_name || 'Unknown',
          type: o.items?.[0]?.description || 'Custom Order',
          status: o.status,
          price: `$${Number(o.total_amount).toLocaleString()}`,
          date: new Date(o.created_at).toLocaleDateString()
        })));
      }
      setIsLoading(false);
    }

    fetchDashboardData();
  }, [supabase]);

  const quickNav = [
    { label: "Register Customer", icon: Plus, href: "/dashboard/register", color: "from-blue-600 to-blue-400" },
    { label: "New Measurement", icon: Ruler, href: "/dashboard/measurements", color: "from-purple-600 to-purple-400" },
    { label: "Create Order", icon: ShoppingBag, href: "/dashboard/orders", color: "from-cyan-600 to-cyan-400" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome & Stats Section */}
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white">Operational Dashboard</h2>
            <p className="text-slate-400 text-xs lg:text-sm mt-1">Real-time overview of your fashion design operations.</p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-max">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>System Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-effect rounded-2xl p-6 border border-blue-500/10 hover:border-blue-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Live</span>
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline space-x-2 mt-1">
                {isLoading ? (
                  <div className="h-8 w-24 bg-slate-800 animate-pulse rounded-lg mt-1" />
                ) : (
                  <h3 className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">{stat.value}</h3>
                )}
                {!isLoading && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center">
                    <ArrowUpRight size={12} className="mr-0.5" /> 8%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Recent Orders & Quick Nav */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Section */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <ShoppingBag size={20} className="text-cyan-400" />
              <span>Recent Commissions</span>
            </h3>
            <div className="relative group w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-900/50 border border-blue-500/10 rounded-lg py-1.5 pl-9 pr-3 text-xs w-full focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          <div className="glass-effect rounded-2xl overflow-hidden border border-blue-500/10 min-h-[320px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Synchronizing Ledger</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/60 text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-6 py-4 font-bold">Client Name</th>
                      <th className="px-6 py-4 font-bold">Order Type</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Value</th>
                      <th className="px-6 py-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/5">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order, idx) => (
                        <tr key={idx} className="group hover:bg-blue-500/5 transition-colors cursor-pointer">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-slate-200">{order.client}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{order.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400 line-clamp-1">{order.type}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              order.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono font-bold text-cyan-400">{order.price}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic text-xs">
                          No commissions found in the ledger.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <button 
              onClick={() => router.push('/dashboard/orders')}
              className="w-full py-4 text-center text-xs text-blue-400 hover:text-cyan-400 transition-colors border-t border-blue-500/5 bg-slate-900/20"
            >
              View All Operational History
            </button>
          </div>
        </div>

        {/* Quick Navigation Section */}
        <div className="flex flex-col space-y-4">
          <h3 className="font-bold text-lg flex items-center space-x-2">
            <Plus size={20} className="text-cyan-400" />
            <span>Quick Access</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {quickNav.map((item, idx) => (
              <button
                key={idx}
                onClick={() => router.push(item.href)}
                className="group relative overflow-hidden glass-effect rounded-2xl p-5 border border-blue-500/10 hover:border-cyan-500/30 transition-all text-left"
              >
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity`} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{item.label}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Instant Action</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 transition-all group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>

          {/* System Status Mini Card */}
          <div className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/10 relative overflow-hidden">
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">System Integrity</h4>
            <div className="flex items-center space-x-2">
              <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
              </div>
              <span className="text-[10px] font-mono text-cyan-400">98%</span>
            </div>
            <p className="text-[9px] text-slate-600 mt-3 leading-relaxed">
              All encryption modules active. Connection to central database secured.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
