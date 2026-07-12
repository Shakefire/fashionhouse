"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Calendar, 
  User, 
  Download, 
  Search, 
  PieChart, 
  BarChart, 
  CheckCircle2, 
  Clock, 
  Truck,
  ChevronDown,
  ArrowRight,
  Filter,
  FileDown,
  Printer,
  Table as TableIcon
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const REPORT_TYPES = [
  "Order Performance",
  "Customer Analysis",
  "Revenue & Payments",
  "Delivery Efficiency"
];

export default function GenerateReportsPage() {
  const supabase = createClient();
  const [reportType, setReportType] = useState("Order Performance");
  const [selectedCustomer, setSelectedCustomer] = useState("All Customers");
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<any[] | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      const { data } = await supabase.from('customers').select('id, full_name').order('full_name');
      if (data) setDbCustomers(data);
    }
    fetchCustomers();
  }, [supabase]);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setReportResult(null);

    let data: any[] = [];
    
    try {
      if (reportType === "Order Performance") {
        let query = supabase.from('orders').select('order_number, customers(full_name), created_at, status, total_amount');
        if (selectedCustomer !== "All Customers") query = query.eq('customer_id', selectedCustomer);
        if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
        if (dateTo) query = query.lte('created_at', new Date(dateTo).toISOString());
        
        const res = await query;
        data = res.data?.map((o: any) => ({
          "Order ID": o.order_number,
          "Customer": o.customers?.full_name || 'Unknown',
          "Date": new Date(o.created_at).toLocaleDateString(),
          "Status": o.status,
          "Amount": `₦${Number(o.total_amount).toLocaleString()}`
        })) || [];
      } else if (reportType === "Customer Analysis") {
        const { data: raw } = await supabase.from('customers').select('full_name, orders(total_amount)');
        data = raw?.map((c: any) => {
          const totalOrders = c.orders?.length || 0;
          const totalSpent = c.orders?.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) || 0;
          return {
            "Client Name": c.full_name,
            "Total Orders": totalOrders,
            "LTV (Spent)": `₦${totalSpent.toLocaleString()}`,
            "Loyalty Tier": totalOrders > 10 ? 'Platinum' : totalOrders > 5 ? 'Gold' : 'Silver'
          };
        }) || [];
      } else if (reportType === "Revenue & Payments") {
        let query = supabase.from('payments').select('created_at, amount, method, status, orders(order_number)');
        if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
        const res = await query;
        data = res.data?.map((p: any) => ({
          "Date": new Date(p.created_at).toLocaleDateString(),
          "Order Ref": p.orders?.order_number || 'N/A',
          "Amount": `₦${Number(p.amount).toLocaleString()}`,
          "Method": p.method,
          "Status": p.status
        })) || [];
      } else if (reportType === "Delivery Efficiency") {
        const { data: raw } = await supabase.from('orders').select('order_number, deadline, status, customers(full_name)');
        data = raw?.map((o: any) => ({
          "Ref": o.order_number,
          "Customer": o.customers?.full_name,
          "Deadline": new Date(o.deadline).toLocaleDateString(),
          "Status": o.status,
          "Performance": new Date(o.deadline) < new Date() && o.status !== 'Completed' ? 'Delayed' : 'On Track'
        })) || [];
      }
    } catch (error) {
      console.error("Report generation error:", error);
    }

    setReportResult(data);
    setIsGenerating(false);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center space-x-3">
            <FileText size={28} className="text-cyan-400 lg:w-8 lg:h-8" />
            <span>Generate Reports</span>
          </h2>
          <p className="text-slate-400 mt-1 text-xs lg:text-sm">Advanced data visualization and export module.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Report Controls - Hidden on Print */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="glass-effect p-6 lg:p-8 rounded-3xl border border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="flex items-center space-x-3 mb-8 border-b border-blue-500/10 pb-6">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                <Filter size={24} />
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-100">Parameters</h3>
                <p className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-widest mt-1">Configuration</p>
              </div>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">Report Type</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none"
                  >
                    {REPORT_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Customer */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">Customer Filter</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none"
                  >
                    <option value="All Customers" className="bg-slate-900">All Customers</option>
                    {dbCustomers.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.full_name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">Timeline</label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                    <input 
                      type="date" 
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                    <input 
                      type="date" 
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-[1.01] transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PieChart size={18} />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
                
                {reportResult && (
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center space-x-2 text-xs"
                  >
                    <Printer size={16} />
                    <span>Print / Save as PDF</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Report Display */}
        <div className="lg:col-span-8 space-y-8">
          {!reportResult && !isGenerating ? (
            <div className="glass-effect p-12 rounded-3xl border border-blue-500/10 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[500px]">
              <div className="w-24 h-24 rounded-full bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-500/30">
                <TableIcon size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-300">No Report Active</h3>
                <p className="text-slate-500 max-w-xs mt-2 mx-auto">Configure the parameters on the left and click generate to synthesize your data.</p>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="glass-effect p-12 rounded-3xl border border-blue-500/10 flex flex-col items-center justify-center text-center space-y-8 h-full min-h-[500px]">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-blue-500/20 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PieChart size={32} className="text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Synthesizing Data</h3>
                <p className="text-slate-500 animate-pulse">Accessing encrypted ledgers...</p>
              </div>
            </div>
          ) : (
            <div className="glass-effect p-8 rounded-3xl border border-blue-500/20 shadow-2xl animate-in zoom-in-95 duration-500">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-blue-500/10 pb-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">{reportType}</h3>
                  <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em]">
                    Result Set: {reportResult?.length || 0} Records
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Generated On</p>
                  <p className="text-sm font-bold text-slate-300">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Dynamic Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-blue-500/10">
                      {reportResult?.[0] && Object.keys(reportResult[0]).map((key) => (
                        <th key={key} className="py-4 px-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/5">
                    {reportResult?.map((row, idx) => (
                      <tr key={idx} className="group hover:bg-blue-500/5 transition-colors">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="py-5 px-4">
                            <span className={`text-sm font-medium ${
                              val === 'Completed' || val === 'On Time' || val === 'Verified' || val === 'Gold' || val === 'Platinum'
                                ? 'text-emerald-400'
                                : val === 'Pending' || val === 'Scheduled' || val === 'Bronze'
                                ? 'text-amber-400'
                                : val === 'In Progress' || val === 'Delayed' || val === 'Silver'
                                ? 'text-blue-400'
                                : 'text-slate-300'
                            }`}>
                              {val}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Print Footer */}
              <div className="mt-12 pt-8 border-t border-blue-500/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <FileText size={20} />
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
                    Official System Export<br />
                    Secure ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </div>
                </div>
                <div className="hidden print:block text-[10px] text-slate-500 italic">
                  End of System Generated Report
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Card - Hidden on Print */}
      <div className="p-6 glass-effect rounded-2xl border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400">
            <Clock size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Dynamic Synthesis</h4>
            <p className="text-xs text-slate-500">Reports are generated in real-time from the active ledger state.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">
           <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
           <span>System Ready</span>
        </div>
      </div>

      {/* Print Overlay CSS */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .glass-effect {
            background: white !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          .text-white, .text-slate-300, .text-slate-100 {
            color: black !important;
          }
          .text-cyan-400, .text-blue-400, .text-emerald-400, .text-amber-400 {
            color: #111 !important;
            font-weight: bold !important;
          }
          .bg-slate-900, .bg-slate-950 {
            background: white !important;
          }
          table th {
            color: #666 !important;
            border-bottom: 2px solid #eee !important;
          }
          table td {
            border-bottom: 1px solid #eee !important;
          }
        }
      `}</style>

    </div>
  );
}
