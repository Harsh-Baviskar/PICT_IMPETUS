import { useState } from "react";
import { CheckCircle2, ShieldAlert, Scale, Search, Clock, FileCheck } from "lucide-react";
import { Link } from "react-router";

// Mock Data
const INITIAL_QUEUE = [
  {
    id: "AGR-8349",
    crop: "Organic Soybeans",
    amount: "1,200 MT",
    value: "₹4,20,000",
    farmer: "ACCT-3A29",
    buyer: "ACCT-8F42",
    status: "DELIVERED",
    timeAgo: "2 hours ago",
    proofUrls: ["#1", "#2"],
  },
  {
    id: "AGR-8321",
    crop: "Winter Wheat",
    amount: "500 MT",
    value: "₹1,35,000",
    farmer: "ACCT-7F14",
    buyer: "ACCT-2A19",
    status: "DELIVERED",
    timeAgo: "5 hours ago",
    proofUrls: ["#3"],
  }
];

export function VerifierDashboard() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  
  const handleConfirm = (id: string) => {
    setQueue(queue.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#25343F]">Verification Queue</h1>
          <p className="text-[#2C687B] text-sm mt-1">Review delivery proofs and release guaranteed payments.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-[#8CC7C4]/40 rounded-lg px-3 py-2 shadow-sm">
          <Search className="w-5 h-5 text-[#8CC7C4]" />
          <input 
            type="text" 
            placeholder="Search by ID or Account..." 
            className="bg-transparent outline-none text-[#262626] text-sm w-48"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#8CC7C4]/40 p-4 shadow-sm flex items-center gap-4">
          <div className="bg-[#8CC7C4]/20 p-3 rounded-lg text-[#3A8B95]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C687B]">Pending Reviews</p>
            <p className="text-2xl font-bold text-[#25343F]">{queue.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#8CC7C4]/40 p-4 shadow-sm flex items-center gap-4">
          <div className="bg-[#408A71]/10 p-3 rounded-lg text-[#408A71]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C687B]">Cleared Today</p>
            <p className="text-2xl font-bold text-[#25343F]">14</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#8CC7C4]/40 p-4 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C687B]">Disputes Active</p>
            <p className="text-2xl font-bold text-[#25343F]">0</p>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-xl shadow-sm border border-[#8CC7C4]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F9FB] border-b border-[#8CC7C4]/30">
                <th className="py-3 px-4 text-xs font-semibold text-[#2C687B] uppercase tracking-wider">Agreement ID</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#2C687B] uppercase tracking-wider">Details</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#2C687B] uppercase tracking-wider">Value</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#2C687B] uppercase tracking-wider">Proof</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#2C687B] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8CC7C4]/20">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#2C687B]">
                    <div className="flex flex-col items-center gap-2">
                      <FileCheck className="w-10 h-10 text-[#8CC7C4]/50" />
                      <p>No pending reviews in the queue.</p>
                    </div>
                  </td>
                </tr>
              ) : queue.map((trade) => (
                <tr key={trade.id} className="hover:bg-[#8CC7C4]/5 transition-colors">
                  <td className="py-4 px-4 align-top">
                    <span className="font-mono text-sm font-medium text-[#262626]">{trade.id}</span>
                    <div className="text-xs text-[#2C687B] flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {trade.timeAgo}
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <p className="font-bold text-[#25343F]">{trade.crop}</p>
                    <p className="text-sm text-[#2C687B]">{trade.amount}</p>
                    <div className="text-xs text-[#8CC7C4] mt-1 break-all">
                      F: {trade.farmer} <br/> B: {trade.buyer}
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <span className="font-semibold text-[#285A48]">{trade.value}</span>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="flex gap-2">
                      {trade.proofUrls.map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded bg-[#8CC7C4]/20 border border-[#8CC7C4]/40 flex items-center justify-center text-[#3A8B95] cursor-pointer hover:bg-[#8CC7C4]/40">
                          <FileCheck className="w-5 h-5" />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top text-right space-y-2">
                    <button 
                      onClick={() => handleConfirm(trade.id)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#408A71] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#285A48] transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Delivery
                    </button>
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#25343F] border border-[#8CC7C4]/40 px-4 py-2 rounded-lg font-medium hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm ml-0 sm:ml-2 mt-2 sm:mt-0">
                      <ShieldAlert className="w-4 h-4" />
                      Dispute
                    </button>
                    <div className="block mt-2">
                      <Link to={`/trade/${trade.id}`} className="text-xs font-medium text-[#3A8B95] hover:text-[#285A48]">
                        View Agreement &rarr;
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
