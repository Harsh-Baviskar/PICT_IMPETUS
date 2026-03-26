import { Outlet, Link, useLocation } from "react-router";
import { Sprout, ShieldCheck, User, Lock, Globe, MessageCircle } from "lucide-react";

export function AppShell() {
  const location = useLocation();

  // Determine role based on path for mock purposes
  let role = "Guest";
  let RoleIcon = User;
  if (location.pathname.includes("buyer")) {
    role = "Buyer";
  } else if (location.pathname.includes("farmer")) {
    role = "Farmer";
    RoleIcon = Sprout;
  } else if (location.pathname.includes("verifier")) {
    role = "Verifier";
    RoleIcon = ShieldCheck;
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#262626] font-sans flex flex-col relative">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#8CC7C4]/30 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-[#25343F] font-semibold text-lg hover:text-[#3A8B95] transition-colors">
            <Sprout className="w-6 h-6 text-[#3A8B95]" />
            <span className="hidden sm:inline">Farmer Payment Assurance</span>
            <span className="sm:hidden">FPA</span>
          </Link>

          {/* Network Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-[#F7F9FB] rounded-full border border-[#8CC7C4]/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#408A71] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#408A71]"></span>
            </span>
            <span className="text-[11px] font-medium text-[#2C687B] uppercase tracking-wide">Live Sync</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <button className="flex items-center justify-center gap-1 px-2 py-1 text-[#2C687B] hover:text-[#3A8B95] transition-colors font-medium text-sm border border-transparent hover:border-[#8CC7C4]/40 rounded-md">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">EN/HI</span>
            <span className="sm:hidden">अ</span>
          </button>

          {/* Role Badge */}
          {role !== "Guest" && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8CC7C4]/20 text-[#285A48] text-sm font-medium border border-[#8CC7C4]/40">
              <RoleIcon className="w-4 h-4" />
              <span>{role}</span>
            </div>
          )}

          {/* Account Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25343F] text-white text-sm font-medium shadow-sm cursor-pointer hover:bg-[#2C687B] transition-colors">
            <Lock className="w-4 h-4 text-[#8CC7C4]" />
            <span className="hidden sm:inline">Account: 8F42</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Floating Action Button for Live Support */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#408A71] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#408A71]/30 hover:bg-[#285A48] hover:scale-105 active:scale-95 transition-all z-50 group"
        aria-label="Live Support"
      >
        <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
      </button>
    </div>
  );
}
