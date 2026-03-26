import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { LandingPage } from "./components/LandingPage";
import { BuyerDashboard } from "./components/BuyerDashboard";
import { FarmerDashboard } from "./components/FarmerDashboard";
import { VerifierDashboard } from "./components/VerifierDashboard";
import { TradeDetail } from "./components/TradeDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppShell,
    children: [
      { index: true, Component: LandingPage },
      { path: "buyer", Component: BuyerDashboard },
      { path: "farmer", Component: FarmerDashboard },
      { path: "verifier", Component: VerifierDashboard },
      { path: "trade/:id", Component: TradeDetail },
    ],
  },
]);
