import { useState } from "react";
import { UploadCloud, CheckCircle2, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router";

// Mock Data
const MOCK_INCOMING = [
  { id: "AGR-8349", crop: "Organic Soybeans", value: "₹4,20,000", status: "Payment Secured" }
];

export function FarmerDashboard() {
  const [proofUploaded, setProofUploaded] = useState(false);

  return (
    <div className="max-w-md mx-auto w-full p-4 sm:p-6 pb-28 space-y-6">
      {/* Earnings Overview */}
      <div className="bg-[#25343F] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A8B95] rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
        
        <p className="text-[#8CC7C4] text-sm font-medium mb-1">Your Guaranteed Earnings</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">₹4,20,000</h1>
        
        <div className="flex items-center gap-2 text-sm bg-[#2C687B]/40 px-3 py-1.5 rounded-lg inline-flex backdrop-blur-sm border border-[#8CC7C4]/20">
          <CheckCircle2 className="w-4 h-4 text-[#8CC7C4]" />
          <span>1 Payment Secured</span>
        </div>
      </div>

      {/* Incoming Requests */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-[#2C687B]">Awaiting Your Delivery</h2>
          <span className="bg-[#8CC7C4]/20 text-[#285A48] text-xs font-bold px-2 py-0.5 rounded-full border border-[#8CC7C4]/30">1 Pending</span>
        </div>

        {MOCK_INCOMING.map((trade) => (
          <div key={trade.id} className="bg-white rounded-2xl border border-[#8CC7C4]/40 p-5 shadow-sm relative overflow-hidden">
            {/* Status indicator bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3A8B95]"></div>
            
            <div className="pl-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-[#25343F] text-xl">{trade.crop}</h3>
                  <p className="text-sm font-mono text-[#2C687B]">{trade.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#285A48] text-xl">{trade.value}</p>
                  <span className="text-xs bg-[#8CC7C4]/20 text-[#3A8B95] px-2 py-0.5 rounded-md font-medium">{trade.status}</span>
                </div>
              </div>

              {/* Upload Proof Area */}
              <div className="mt-8 mb-6">
                <p className="text-sm font-semibold text-[#2C687B] mb-3">Upload Delivery Proof</p>
                
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    proofUploaded 
                      ? "border-[#408A71] bg-[#408A71]/5" 
                      : "border-[#8CC7C4] hover:bg-[#8CC7C4]/10 cursor-pointer active:scale-[0.98]"
                  }`}
                  onClick={() => !proofUploaded && setProofUploaded(true)}
                >
                  {proofUploaded ? (
                    <div className="flex flex-col items-center gap-3 text-[#408A71] animate-in zoom-in-95">
                      <CheckCircle2 className="w-10 h-10" />
                      <span className="font-bold text-lg">Proof Uploaded!</span>
                      <span className="text-sm text-[#2C687B] mt-1 underline cursor-pointer">Change photo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-[#2C687B]">
                      <div className="w-16 h-16 rounded-full bg-[#8CC7C4]/20 flex items-center justify-center text-[#3A8B95]">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="font-bold text-[#25343F] text-lg block">Tap to add photo</span>
                        <span className="text-sm mt-1 block">Clear photos process faster</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Massive CTA for Field Tapping */}
              <button 
                disabled={!proofUploaded}
                className={`w-full py-6 rounded-2xl text-xl font-bold flex justify-center items-center gap-3 transition-all active:scale-[0.98] ${
                  proofUploaded 
                    ? "bg-[#408A71] text-white hover:bg-[#285A48] shadow-[0_8px_20px_-6px_rgba(64,138,113,0.4)]" 
                    : "bg-[#F7F9FB] text-[#8CC7C4] border-2 border-[#8CC7C4]/30 cursor-not-allowed"
                }`}
              >
                <UploadCloud className="w-7 h-7" />
                MARK DELIVERED
              </button>

              <div className="mt-6 pt-5 border-t border-[#8CC7C4]/20 flex justify-center">
                 <Link to={`/trade/${trade.id}`} className="text-sm font-semibold text-[#3A8B95] flex items-center gap-1 hover:text-[#285A48] p-2 hover:bg-[#8CC7C4]/10 rounded-lg transition-colors">
                   View Full Agreement <ChevronRight className="w-4 h-4" />
                 </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
