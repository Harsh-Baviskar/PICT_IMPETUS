import { useState } from "react";
import { Plus, ChevronRight, FileText, UploadCloud, Calendar, Lock } from "lucide-react";
import { Link } from "react-router";

// Mock data
const INITIAL_TRADES = [
  {
    id: "AGR-8349",
    crop: "Organic Soybeans",
    amount: "1,200 MT",
    value: "₹4,20,000",
    deadline: "Oct 15, 2026",
    status: "Payment Secured",
    farmer: "ACCT-3A29",
  },
  {
    id: "AGR-8350",
    crop: "Winter Wheat",
    amount: "500 MT",
    value: "₹1,35,000",
    deadline: "Nov 02, 2026",
    status: "Agreement Started",
    farmer: "ACCT-7F14",
  },
  {
    id: "AGR-8211",
    crop: "Yellow Corn",
    amount: "2,000 MT",
    value: "₹3,80,000",
    deadline: "Sep 20, 2026",
    status: "Money Sent",
    farmer: "ACCT-1E48",
  }
];

export function BuyerDashboard() {
  const [trades, setTrades] = useState(INITIAL_TRADES);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#25343F]">Buyer Dashboard</h1>
          <p className="text-[#2C687B] text-sm mt-1">Manage active agreements and secure payments.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 bg-[#3A8B95] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2C687B] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Agreement
        </button>
      </div>

      {/* Create Trade Form (Collapsible) */}
      {isCreating && (
        <div className="bg-white rounded-xl border border-[#8CC7C4] p-6 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-[#285A48]" />
            <h2 className="text-lg font-semibold text-[#25343F]">New Agreement</h2>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2C687B]">Crop Type</label>
              <input 
                type="text" 
                placeholder="e.g. Organic Soybeans"
                className="w-full px-3 py-2 rounded-md border border-[#8CC7C4]/50 focus:border-[#3A8B95] focus:ring-1 focus:ring-[#3A8B95] outline-none text-[#262626]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2C687B]">Amount (MT)</label>
              <input 
                type="number" 
                placeholder="1,000"
                className="w-full px-3 py-2 rounded-md border border-[#8CC7C4]/50 focus:border-[#3A8B95] focus:ring-1 focus:ring-[#3A8B95] outline-none text-[#262626]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2C687B]">Payment Amount (₹)</label>
              <input 
                type="number" 
                placeholder="1,00,000"
                className="w-full px-3 py-2 rounded-md border border-[#8CC7C4]/50 focus:border-[#3A8B95] focus:ring-1 focus:ring-[#3A8B95] outline-none text-[#262626]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2C687B]">Delivery Deadline</label>
              <input 
                type="date"
                className="w-full px-3 py-2 rounded-md border border-[#8CC7C4]/50 focus:border-[#3A8B95] focus:ring-1 focus:ring-[#3A8B95] outline-none text-[#262626]"
              />
            </div>
            
            <div className="col-span-full flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg font-medium text-[#2C687B] hover:bg-[#8CC7C4]/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 rounded-lg font-medium bg-[#25343F] text-white hover:bg-[#2C687B] transition-colors"
              >
                Start Agreement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trade Cards List */}
      <div className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-[#2C687B] mb-2">Active Agreements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trades.map((trade) => (
            <div 
              key={trade.id} 
              className="bg-white rounded-xl border border-[#8CC7C4]/40 hover:border-[#8CC7C4] transition-all p-5 flex flex-col justify-between h-full"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-[#F7F9FB] px-2 py-0.5 rounded text-[#2C687B]">{trade.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      trade.status === 'Agreement Started' ? 'bg-amber-100 text-amber-800' :
                      trade.status === 'Payment Secured' ? 'bg-[#8CC7C4]/20 text-[#3A8B95]' :
                      'bg-[#408A71]/10 text-[#408A71]'
                    }`}>
                      {trade.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#25343F]">{trade.crop}</h3>
                </div>
                <Link to={`/trade/${trade.id}`} className="text-[#3A8B95] hover:text-[#285A48] p-1 rounded-full hover:bg-[#8CC7C4]/10">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Card Body */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#2C687B] flex items-center gap-1"><UploadCloud className="w-4 h-4" /> Volume</span>
                  <span className="font-medium text-[#262626]">{trade.amount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#2C687B] flex items-center gap-1"><Lock className="w-4 h-4" /> Guarantee</span>
                  <span className="font-medium text-[#262626]">{trade.value}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#2C687B] flex items-center gap-1"><Calendar className="w-4 h-4" /> Deadline</span>
                  <span className="font-medium text-[#262626]">{trade.deadline}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-[#8CC7C4]/20 mt-auto">
                {trade.status === 'Agreement Started' ? (
                  <button className="w-full flex justify-center items-center gap-2 bg-[#3A8B95] text-white py-2.5 rounded-lg font-medium hover:bg-[#2C687B] transition-colors">
                    <Lock className="w-4 h-4" />
                    Secure Payment
                  </button>
                ) : (
                  <Link 
                    to={`/trade/${trade.id}`} 
                    className="w-full flex justify-center items-center gap-2 bg-[#F7F9FB] text-[#25343F] border border-[#8CC7C4]/40 py-2.5 rounded-lg font-medium hover:bg-[#8CC7C4]/20 transition-colors"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
