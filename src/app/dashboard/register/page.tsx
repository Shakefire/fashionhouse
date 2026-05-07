"use client";

import { useState } from "react";
import { 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  Save, 
  Trash2, 
  UserPlus,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function RegisterCustomerPage() {
  const supabase = createClient();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    notes: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleClear = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      address: "",
      notes: ""
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const { error } = await supabase
      .from('customers')
      .insert([
        { 
          full_name: formData.fullName, 
          phone_number: formData.phoneNumber, 
          address: formData.address, 
          notes: formData.notes 
        }
      ]);

    if (error) {
      console.error("Error saving customer:", error);
      setStatusMessage({ type: 'error', text: "Failed to register customer. Please try again." });
    } else {
      setStatusMessage({ type: 'success', text: "Customer registered successfully in the cloud ledger!" });
      handleClear();
    }
    
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="mb-8 lg:mb-10">
        <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center space-x-3">
          <UserPlus size={28} className="text-cyan-400 lg:w-8 lg:h-8" />
          <span>Register New Customer</span>
        </h2>
        <p className="text-slate-400 mt-2 text-xs lg:text-sm">Initialize a new client profile in the central management system.</p>
      </div>

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      <div className="glass-effect rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_rgba(14,165,233,0.1)]">
        <div className="p-6 md:p-12">
          <div className="flex items-center space-x-3 mb-8 lg:mb-10 border-b border-blue-500/10 pb-6">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-100">Customer Identity</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Data Entry Module</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Full Name */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter full legal name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-slate-900/40 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 ml-1">Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full bg-slate-900/40 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 ml-1">Primary Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <MapPin size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Street, City, State, ZIP Code"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-900/40 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                  required
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 ml-1">Additional Notes</label>
              <div className="relative group">
                <div className="absolute top-4 left-4 pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <FileText size={20} />
                </div>
                <textarea
                  rows={4}
                  placeholder="Special preferences, allergies, or previous history..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-900/40 border border-blue-500/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full md:w-64 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Customer</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="w-full md:w-64 py-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center space-x-3"
              >
                <Trash2 size={20} />
                <span>Clear Fields</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-10 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center space-x-4">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <p className="text-xs text-slate-400 font-medium">
          Note: Customer data will be synchronized with the encrypted cloud backup automatically upon saving.
        </p>
      </div>
    </div>
  );
}
