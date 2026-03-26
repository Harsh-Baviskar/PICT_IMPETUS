import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, CheckCircle2, Circle, Clock, AlertTriangle, Download, FileText, Lock } from "lucide-react";

const STATUS_STEPS = ["Agreement Started", "Payment Secured", "Crop Delivered", "Money Sent"];

export function TradeDetail() {
  const { id } = useParams();
  const [currentStatus] = useState("Crop Delivered");
  const [showDispute, setShowDispute] = useState(false);

  // Mock Data Details
  const trade = {
    id: id || "AGR-8349",
    crop: "Organic Soybeans",
    amount: "1,200 MT",
    value: "₹4,20,000",
    escrowAddress: "SD-8F4E2B9A",
    createdAt: "Sep 10, 2026",
    deadline: "Oct 15, 2026",
    farmer: "ACCT-3A29",
    buyer: "ACCT-8F42",
    verifier: "ACCT-9E71",
  };

  const currentStepIndex = STATUS_STEPS.indexOf(currentStatus);
  const isCompleted = currentStepIndex >= 2;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 pb-28 space-y-8">
      {/* Header Navigation */}
      <div className="flex items-center gap-4 text-[#2C687B] mb-6">
        <button onClick={() => window.history.back()} className="hover:text-[#25343F] transition-colors p-2 hover:bg-[#8CC7C4]/10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-[#25343F]">Agreement Details</h1>
        <div className="ml-auto font-mono text-sm bg-white border border-[#8CC7C4]/40 px-3 py-1 rounded-md text-[#285A48] shadow-sm">
          {trade.id}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Status & Details) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-[#8CC7C4]/40 p-6 shadow-sm">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-[#2C687B] mb-6">Payment Status</h2>
            <div className="relative flex justify-between">
              {/* Timeline Connector */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#8CC7C4]/30 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-[#3A8B95] -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              ></div>

              {/* Steps */}
              {STATUS_STEPS.map((step, idx) => {
                const stepCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2 max-w-[80px] text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      stepCompleted 
                        ? 'bg-[#3A8B95] border-[#3A8B95] text-white' 
                        : 'bg-white border-[#8CC7C4]/50 text-[#8CC7C4]'
                    } ${isCurrent ? 'ring-4 ring-[#8CC7C4]/30' : ''}`}>
                      {stepCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-3 h-3 fill-current" />}
                    </div>
                    <span className={`text-xs font-semibold tracking-wide leading-tight ${
                      stepCompleted ? 'text-[#25343F]' : 'text-[#8CC7C4]'
                    }`}>{step}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#8CC7C4]/20 flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#2C687B]" />
              <div>
                <p className="text-[#25343F] font-medium text-sm">Waiting for Verifier Confirmation</p>
                <p className="text-[#2C687B] text-sm">Delivery proof uploaded by Farmer. Funds are secure in the safe deposit.</p>
              </div>
            </div>

            {/* Receipt Action for Completed/Delivered States */}
            {isCompleted && (
              <button className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2C687B] text-white px-6 py-3.5 rounded-xl font-medium hover:bg-[#25343F] active:scale-[0.98] transition-all shadow-sm">
                <Download className="w-5 h-5" />
                Share Receipt to WhatsApp
              </button>
            )}
          </div>

          {/* Trade Info Card */}
          <div className="bg-white rounded-xl border border-[#8CC7C4]/40 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#8CC7C4]/20 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#25343F] mb-1">{trade.crop}</h2>
                <div className="flex gap-4 text-sm text-[#2C687B]">
                  <span>Volume: <strong className="text-[#262626]">{trade.amount}</strong></span>
                  <span>Deadline: <strong className="text-[#262626]">{trade.deadline}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#2C687B] uppercase tracking-wider mb-1">Payment Amount</p>
                <p className="text-2xl font-bold text-[#285A48] flex items-center justify-end gap-1">
                  <Lock className="w-5 h-5 text-[#8CC7C4]" />
                  {trade.value}
                </p>
              </div>
            </div>
            <div className="p-6 bg-[#F7F9FB] grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-[#2C687B] mb-1">Safe Deposit ID</p>
                <p className="font-mono text-[#25343F] bg-white border border-[#8CC7C4]/40 px-3 py-1.5 rounded">{trade.escrowAddress}</p>
              </div>
              <div>
                <p className="text-[#2C687B] mb-1">Created At</p>
                <p className="font-medium text-[#25343F] px-3 py-1.5">{trade.createdAt}</p>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#8CC7C4]/20">
                  <span className="text-[#2C687B]">Buyer ID</span>
                  <span className="font-mono font-medium text-[#25343F]">{trade.buyer}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#8CC7C4]/20">
                  <span className="text-[#2C687B]">Farmer ID</span>
                  <span className="font-mono font-medium text-[#25343F]">{trade.farmer}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#2C687B]">Assigned Verifier</span>
                  <span className="font-mono font-medium text-[#25343F]">{trade.verifier}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Actions & Documents) */}
        <div className="space-y-6">
          
          {/* Action Panel */}
          <div className="bg-[#25343F] rounded-xl p-6 text-white shadow-sm">
            <h3 className="font-semibold mb-4 text-[#8CC7C4]">Required Action</h3>
            <button className="w-full bg-[#3A8B95] text-white py-3 rounded-lg font-bold hover:bg-[#2C687B] active:scale-[0.98] transition-all shadow-sm mb-3 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Authorize Release
            </button>
            <button 
              onClick={() => setShowDispute(!showDispute)}
              className="w-full bg-transparent text-[#8CC7C4] border border-[#8CC7C4]/40 py-2.5 rounded-lg font-medium hover:bg-[#8CC7C4]/10 hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Raise Dispute
            </button>
          </div>

          {/* Proof Documents */}
          <div className="bg-white rounded-xl border border-[#8CC7C4]/40 p-6 shadow-sm">
            <h3 className="text-sm uppercase tracking-wider font-semibold text-[#2C687B] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Attached Proofs
            </h3>
            <div className="space-y-3">
              {['DeliveryReceipt_Signed.pdf', 'WeightBridge_Scale1.jpg'].map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#8CC7C4]/20 hover:border-[#8CC7C4]/60 bg-[#F7F9FB] transition-colors cursor-pointer group">
                  <span className="text-sm font-medium text-[#25343F] truncate max-w-[180px]">{file}</span>
                  <Download className="w-4 h-4 text-[#8CC7C4] group-hover:text-[#3A8B95]" />
                </div>
              ))}
            </div>
          </div>

          {/* Modular Dispute Panel */}
          {showDispute && (
            <div className="bg-rose-50 rounded-xl border border-rose-200 p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2 text-rose-700 mb-4">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">Initiate Dispute Resolution</h3>
              </div>
              <p className="text-sm text-rose-600/80 mb-4">
                This action will pause the payment guarantee timer and flag the agreement for Admin review. Please provide a reason.
              </p>
              <textarea 
                className="w-full p-3 rounded-lg border border-rose-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none text-sm text-[#262626] resize-none mb-4"
                rows={4}
                placeholder="Describe the issue with the delivery or proof..."
              ></textarea>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDispute(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm">
                  Submit
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
