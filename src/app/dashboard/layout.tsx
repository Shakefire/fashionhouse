"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  UserPlus, 
  Ruler, 
  ShoppingBag, 
  CreditCard, 
  FileText,
  LogOut,
  User,
  Menu,
  X
} from "lucide-react";

import { createClient } from "@/utils/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      }
    }
    checkSession();
  }, [router, supabase]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: UserPlus, label: "Register Customer", href: "/dashboard/register" },
    { icon: Ruler, label: "Record Measurements", href: "/dashboard/measurements" },
    { icon: ShoppingBag, label: "Manage Orders", href: "/dashboard/orders" },
    { icon: CreditCard, label: "Payment Records", href: "/dashboard/payments" },
    { icon: FileText, label: "Generate Reports", href: "/dashboard/reports" },
  ];

  const SidebarContent = () => (
    <>
      <nav className="space-y-3">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard");
          return (
            <button
              key={idx}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 group border ${
                isActive 
                ? "bg-blue-600/20 border-blue-500/40 text-cyan-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]" 
                : "border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-blue-100"
              }`}
            >
              <item.icon size={20} className={isActive ? "glow-border" : "group-hover:text-cyan-400"} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 glass-effect rounded-xl border border-blue-500/10 text-[10px] text-blue-400/40 uppercase tracking-widest text-center">
        System v2.4.0 active
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/login-bg.png"
          alt="Futuristic Background"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950" />
        <div className="bg-grid-pattern absolute inset-0 opacity-10" />
        <div className="bg-glow opacity-30" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-blue-500/20 p-6 flex flex-col transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <h2 className="text-lg font-bold text-cyan-400 italic">Fashion Designer</h2>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col w-full min-h-screen">
        
        {/* Top Header */}
        <header className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-12 border-b border-blue-500/10 bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 mr-2 lg:hidden text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden sm:flex items-center space-x-4">
              <div className="relative w-12 h-12 lg:w-16 lg:h-16">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl lg:text-3xl font-bold glow-text tracking-wider italic bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Fashion Designer
                </h1>
                <p className="text-[8px] lg:text-[10px] tracking-[0.4em] uppercase text-blue-400 font-bold opacity-80">
                  Order Management System
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 lg:space-x-6">
            <div className="flex items-center space-x-2 lg:space-x-3 text-slate-300">
              <span className="text-xs lg:text-sm font-medium hidden sm:block">Admin</span>
              <div className="p-1.5 lg:p-2 rounded-full border border-blue-500/30 bg-blue-500/10">
                <User size={16} />
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 lg:p-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-72 border-r border-blue-500/10 p-6 flex-col">
            <SidebarContent />
          </aside>

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(14, 165, 233, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.4);
        }
      `}</style>
    </div>
  );
}
