import { Link } from "react-router";
import { Sprout, ShoppingCart, ShieldCheck, Settings, Lock } from "lucide-react";

export function LandingPage() {
  const roles = [
    {
      title: "Buyer",
      description: "Create agreements, guarantee payments, and track crop deliveries.",
      icon: ShoppingCart,
      path: "/buyer",
    },
    {
      title: "Farmer",
      description: "Manage incoming requests, upload delivery proof, and get paid.",
      icon: Sprout,
      path: "/farmer",
    },
    {
      title: "Verifier",
      description: "Review delivery proofs and authorize payment guarantees.",
      icon: ShieldCheck,
      path: "/verifier",
    },
    {
      title: "Admin",
      description: "System oversight and issue resolution.",
      icon: Settings,
      path: "/",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      {/* Hero Section */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#25343F] tracking-tight mb-4">
          Guaranteed Payments for <span className="text-[#285A48]">Every Harvest</span>
        </h1>
        <p className="text-lg md:text-xl text-[#2C687B] mb-8 max-w-2xl mx-auto leading-relaxed">
          A transparent, reliable payment guarantee system ensuring instant, secure compensation for farmers upon confirmed crop delivery.
        </p>

        {/* Primary Call to Action */}
        <button className="inline-flex items-center gap-2 bg-[#3A8B95] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#2C687B] hover:-translate-y-0.5 transition-all shadow-sm">
          <Lock className="w-6 h-6" />
          Secure Login
        </button>
      </div>

      {/* Role Selection Grid */}
      <div className="w-full max-w-4xl mt-8">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-[#2C687B] mb-6">Select Your Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <Link
              key={role.title}
              to={role.path}
              className="flex flex-col items-start p-6 rounded-2xl bg-white border border-[#8CC7C4]/50 hover:border-[#3A8B95] hover:shadow-[0_4px_20px_-4px_rgba(140,199,196,0.3)] transition-all group text-left cursor-pointer"
            >
              <div className="p-3 rounded-lg bg-[#8CC7C4]/10 text-[#3A8B95] group-hover:bg-[#3A8B95] group-hover:text-white transition-colors mb-4">
                <role.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#25343F] mb-2">{role.title}</h3>
              <p className="text-sm text-[#2C687B] leading-snug">{role.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
