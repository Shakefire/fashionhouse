"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, Lock, Eye, EyeOff, LogIn, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setErrorMessage("Access Denied: Email confirmation required. Please check your inbox or disable email verification in Supabase Dashboard.");
      } else {
        setErrorMessage(error.message);
      }
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login-bg.png"
          alt="Futuristic Background"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/80" />
        <div className="bg-grid-pattern absolute inset-0 opacity-20" />
        <div className="bg-glow" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {/* Header/Logo Section */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative w-32 h-32 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">
            <Image
              src="/logo.png"
              alt="Fashion Designer Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight glow-text bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">
            Fashion Designer
          </h1>
          <p className="text-blue-300/80 tracking-[0.2em] uppercase text-sm font-medium mt-1">
            Order Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full glass-effect rounded-2xl p-8 md:p-10 transition-all duration-500 hover:shadow-[0_0_40px_rgba(14,165,233,0.15)]">
          <h2 className="text-2xl font-semibold text-center mb-8 text-blue-100 border-b border-blue-500/20 pb-4">
            User Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-cyan-400 text-blue-400/60">
                  <User size={20} />
                </div>
                <input
                  type="email"
                  placeholder="Designer Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/40 border border-blue-500/30 rounded-lg py-3.5 pl-12 pr-4 text-blue-100 placeholder:text-blue-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-cyan-400 text-blue-400/60">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/40 border border-blue-500/30 rounded-lg py-3.5 pl-12 pr-4 text-blue-100 placeholder:text-blue-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-400/60 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2 text-red-400 text-xs animate-in fade-in slide-in-from-top-1 duration-300">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Options */}
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-blue-400/60 text-[10px] uppercase tracking-widest">Authorized Access Only</span>
              <button type="button" className="text-blue-400 hover:text-cyan-400 transition-colors text-xs">
                Need Help?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden group py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="flex items-center justify-center space-x-2">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <LogIn size={20} />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-blue-400/40 text-xs tracking-widest uppercase animate-pulse-glow">
          v2.4.0 secure connection active
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
